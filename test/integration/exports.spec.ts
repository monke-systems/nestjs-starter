import {
  ActuatorModule,
  ConfigModule,
  createStarterModules,
  GracefulShutdownModule,
  HealthcheckModule,
  NestStarterConfig,
  PrometheusModule,
  starterBootstrap,
} from '../../src';

describe('exports test', () => {
  it('package exports modules', () => {
    expect(starterBootstrap).toBeDefined();
    expect(createStarterModules).toBeDefined();
    expect(NestStarterConfig).toBeDefined();
    expect(ActuatorModule).toBeDefined();
    expect(ConfigModule).toBeDefined();
    expect(HealthcheckModule).toBeDefined();
    expect(GracefulShutdownModule).toBeDefined();
    expect(PrometheusModule).toBeDefined();
  });
});
