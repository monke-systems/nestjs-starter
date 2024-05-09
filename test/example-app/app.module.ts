import { Module } from '@nestjs/common';
import { createStarterModules } from '../../src';
import { AppConfig } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [...createStarterModules(AppConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
