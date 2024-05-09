import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/')
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(private service: AppService) {}

  @Get('/hello')
  async getHello() {
    this.logger.log('Hello World from controller!');

    return this.service.getHello();
  }
}
