import { Module } from '@nestjs/common';
import { createStarterModules } from '../../src';
import { AppConfig } from './app.config';

@Module({
  imports: [...createStarterModules(AppConfig)],
})
export class AppModule {}
