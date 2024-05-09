import { randomUUID } from 'node:crypto';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { RawRequestDefaultExpression } from 'fastify';

export const createFastifyAdapter = (
  enableRequestId: boolean,
): FastifyAdapter => {
  if (enableRequestId) {
    return new FastifyAdapter({
      genReqId(req: RawRequestDefaultExpression) {
        const fromHeaders = req.headersDistinct['x-request-id'];

        if (
          fromHeaders !== undefined &&
          fromHeaders.length > 0 &&
          fromHeaders[0] !== undefined
        ) {
          req.id = fromHeaders[0];
          return fromHeaders[0];
        }

        const id = randomUUID();
        req.id = id;
        return id;
      },
    });
  } else {
    return new FastifyAdapter();
  }
};
