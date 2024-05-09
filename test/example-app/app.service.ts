import { Logger } from '@nestjs/common';

export class AppService {
  private logger = new Logger(AppService.name);

  getHello(): string {
    this.logger.debug('Hello world from service!');

    return 'Hello World!';
  }
}
