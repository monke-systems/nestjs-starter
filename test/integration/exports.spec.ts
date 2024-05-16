import {
  ActuatorModule,
  buildStarterConfig,
  ConfigModule,
  createStarterApp,
  createStarterModules,
  HealthcheckModule,
  initStarterApp,
  NestStarterConfig,
  PrometheusModule,
  startStarterApp,
  StructuredLogger,
} from '../../src';

describe('exports test', () => {
  it('package exports modules', () => {
    expect(createStarterApp).toBeDefined();
    expect(initStarterApp).toBeDefined();
    expect(startStarterApp).toBeDefined();
    expect(createStarterModules).toBeDefined();
    expect(NestStarterConfig).toBeDefined();
    expect(ActuatorModule).toBeDefined();
    expect(ConfigModule).toBeDefined();
    expect(HealthcheckModule).toBeDefined();
    expect(PrometheusModule).toBeDefined();
    expect(StructuredLogger).toBeDefined();
    expect(buildStarterConfig).toBeDefined();
  });
});
