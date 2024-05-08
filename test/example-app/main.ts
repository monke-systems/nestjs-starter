import { createStarterApp, initStarterApp, startStarterApp } from '../../src';
import { AppConfig } from './app.config';
import { AppModule } from './app.module';

const main = async () => {
  const app = await createStarterApp(AppModule);

  await initStarterApp(app, AppConfig);

  await startStarterApp(app, AppConfig);
};

main().catch(console.error);
