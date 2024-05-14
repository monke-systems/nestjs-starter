import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/')
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(private service: AppService) {}

  @Get('/logging-test')
  logging() {
    this.logger.verbose('verbose log');
    this.logger.debug('debug log');
    this.logger.log('info log');
    this.logger.warn('warn log');
    this.logger.error('error log');
    this.logger.fatal('fatal log');

    this.logger.log('userdata', {
      id: 123,
      something: 123123,
    });

    throw new InternalServerErrorException(new Error('asdads'));
  }
}
