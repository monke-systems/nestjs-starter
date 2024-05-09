import type { Logger } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { debounce, type DebouncedFunction } from './debounce';

// Dlya vas perduliroval Alexander Tolmachev https://github.com/orgs/monke-systems/people/AlexTolmachev
// 1 million $ development

export async function setupGracefulShutdown(
  app: NestFastifyApplication,
  logger: Logger,
) {
  // eslint-disable-next-line @typescript-eslint/require-await
  async function fastifyGracefulShutdownPlugin(fastify: FastifyInstance) {
    logger.log('Graceful shutdown initialization started', 'GracefulShutdown');

    let signalReceived = false;

    let requestsAfterSignalCount = 0; // load balancer lag
    let responsesAfterSignalCount = 0; // above^ + long requests before signal

    // should resolve after signal and after all requests' onResponse hooks are executed
    const afterSignalResolveMap = new WeakMap<FastifyRequest, () => void>();
    const afterSignalPromises: Promise<void>[] = [];

    // should resolve after signal and after requests stop incoming
    let resolveRequestFlowStoppedPromise: DebouncedFunction<[], () => void>;
    const requestFlowStoppedPromise = new Promise<void>((resolve) => {
      resolveRequestFlowStoppedPromise = debounce(resolve, 1e4);
    });

    fastify.addHook('onRequest', (request, _, done) => {
      if (signalReceived) {
        requestsAfterSignalCount += 1;

        afterSignalPromises.push(
          new Promise((resolve) => {
            afterSignalResolveMap.set(request, resolve);
          }),
        );

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        resolveRequestFlowStoppedPromise();
      }

      done();
    });

    fastify.addHook('onSend', (request, reply, _, done) => {
      if (signalReceived) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        reply.header('Connection', 'close');

        // also available as request.raw.socket
        request.socket.setKeepAlive(false);
      }

      done();
    });

    fastify.addHook('onResponse', (request, _, done) => {
      if (signalReceived) {
        responsesAfterSignalCount += 1;
        afterSignalResolveMap.get(request)?.();
        afterSignalResolveMap.delete(request);
      }

      done();
    });

    let signalReceivedTimes = 0;

    const createSignalHandler = (signal: 'SIGINT' | 'SIGTERM') => async () => {
      signalReceivedTimes += 1;

      logger.log(
        { signal, signalReceivedTimes },
        'Received Signal',
        'GracefulShutdown',
      );

      // signal can be received several times
      if (signalReceived) return;

      signalReceived = true;

      const intervalId = setInterval(() => {
        logger.log(
          {
            signal,
            signalReceivedTimes,
            requestsAfterSignalCount,
            responsesAfterSignalCount,
          },
          'Waiting for responses',
          'GracefulShutdown',
        );
      }, 1000);

      // it's debounced, so if there are requests still incoming, they will debounce it even more
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      resolveRequestFlowStoppedPromise();

      const time1 = Date.now();
      await requestFlowStoppedPromise;
      const requestFlowStopTime = Date.now() - time1;

      const time2 = Date.now();
      const afterSignalPromisesCount = afterSignalPromises.length;
      await Promise.all(afterSignalPromises);
      const afterSignalPromisesWaitingTime = Date.now() - time2;

      clearInterval(intervalId);

      const fastifyCloseStartTime = Date.now();
      await fastify.close();
      const fastifyCloseTime = Date.now() - fastifyCloseStartTime;

      const appCloseStartTime = Date.now();
      await app.close();
      const appCloseTime = Date.now() - appCloseStartTime;

      const longRequestsCount =
        responsesAfterSignalCount - requestsAfterSignalCount;

      logger.log(
        {
          signal,
          signalReceivedTimes,
          requestFlowStopTime, // how much time passed between receiving the signal and when the requests stopped incoming
          afterSignalPromisesCount,
          afterSignalPromisesWaitingTime,
          appCloseTime,
          fastifyCloseTime,
          requestsAfterSignalCount,
          responsesAfterSignalCount,
          longRequestsCount, // requests that arrived before the signal, but were responded after the signal
        },
        'Finished',
        'GracefulShutdown',
      );

      process.exit(0);
    };

    process
      .removeAllListeners('SIGINT')
      .removeAllListeners('SIGTERM')
      .on('SIGINT', createSignalHandler('SIGINT'))
      .on('SIGTERM', createSignalHandler('SIGTERM'));
  }

  // @ts-expect-error https://www.fastify.io/docs/latest/Reference/Plugins/#handle-the-scope
  fastifyGracefulShutdownPlugin[Symbol.for('skip-override')] = true;

  await app
    .getHttpAdapter()
    .getInstance()
    .register(fastifyGracefulShutdownPlugin);
}
