# @monkee/nestjs-starter package

Warning: This package is in the early development stage. It is not recommended to use it in production before the first major version.

## Table of contents
- [Motivation](#motivation)
- [Installation steps](#installation-steps)
- [Configuration](#configuration)
- [Logging](#logging)
- [Http server](#http-server)
- [Production-ready features](#production-ready-features)
  - [Graceful shutdown](#graceful-shutdown)
  - [Healthcheck](#healthcheck)
  - [Prometheus metrics](#prometheus-metrics)
- [Package update flow](#package-update-flow)

## Motivation

NestJs is great, but compared to mature frameworks from other ecosystems, like Spring Boot, Laravel, Ruby on Rails, it is still considered a micro-framework. The building blocks of the application are very small, and this approach does not scale well. Often, a higher level of abstraction is required.
Also, the NestJS community overlooks production-ready practices, focusing on "hello world" solutions. A glaring example is the complete disregard for observability tools. Here, there are no official solutions, no mature community-driven solutions.

This starter provides the core block, including tools that are used in most projects:

1. Configuration
2. Logging
3. HTTP server
    * Swagger doc
    * Graceful shutdown
4. Healthcheck
5. Metrics (prometheus)

Essential subjects:

1. Each module should answer the question "Why include it in the starter?"
2. Each module should be configurable with the internal configuration module.
3. The starter should be easily extendable and not hinder application customization.
4. Prohibition on inventing wheels.

## Installation steps

### Install libraries

Prerequisites:
1. NestJs project with nest version 10+

```bash
npm i @monkee/nestjs-starter @monkee/turbo-config@2 @nestjs/swagger@7 class-validator@0.13.2
```

### Create configuration class

```typescript
import { NestStarterConfig } from '@monkee/nestjs-starter';

// Starter config contains all necessary configuration for included modules
export class AppConfig extends NestStarterConfig {}
```

### Add starter modules to AppModule

```typescript
import { Module } from '@nestjs/common';
import { createStarterModules } from '@monkee/nestjs-starter';
import { AppConfig } from './app.config';

@Module({
  imports: [
    ...createStarterModules(AppConfig),
    // other modules
  ],
})
export class AppModule {}
```

### Create and init app
```typescript
import { createStarterApp, initStarterApp, startStarterApp } from '@monkee/nestjs-starter';
import { AppConfig } from './app.config';
import { AppModule } from './app.module';

const main = async () => {
  const app = await createStarterApp(AppModule);

  await initStarterApp(app, AppConfig);

  // on this step you can add your own initialization logic
  // for example, you can add custom global pipes, guards, interceptors, etc.

  await startStarterApp(app, AppConfig);
};

main();
```

## Configuration

### Why include it in the starter?

It's hard to imagine an application that doesn't require configuration. Also, starter already includes several components that need to be configured.

### What's wrong with the @nestjs/config?

The built-in solution simply lacks behind competitors in the market. Features that are found in one form or another in other frameworks (Spring Boot, ASP Net) are missing in @nestjs/config.

1. Multiple configuration sources (yml, envs, cli)
2. Support for parsing into a typed data structure
3. Using the same validation solution as the rest of the application
4. Support for data structures (arrays, maps)
5. Developer UX tools (autocomplete for yml configs)
6. Config documentation generator

### The solution

This starter provides a high-level tool for configuring your applications. Many configuration rules are strictly enforced, and this is done intentionally.

Key points:

1. The application is configured using YML files with the ability to override settings through YML, environment variables, or CLI arguments.
2. There is always a default configuration file named config.default.yml.
3. Separate YML files can be created for each environment. The environment name is set by the NEST_CONFIG_ENV environment variable. Examples: config.production.yml, config.test.yml
4. The root directory by default is "src/resources". The root directory can be reassigned via the NEST_CONFIG_ROOT environment variable. You should properly configure the production container build
5. If the application is started with NEST_CONFIG_GENERATE_REF=true, config reference and json schema is automatically generated

The starter uses the [@monkee/turbo-config](https://github.com/monke-systems/monke-turbo-config) library under the hood. Refer to the documentation for more details.

## Logging

### Why include it in the starter?

Application without logging is like a car without a dashboard. You can drive it, but you don't know what's going on under the hood (Copilot generated this analogy).

### The solution

Starter provides a pre-configured logging module that implements the standard NestJs Logger interface.

Since there is currently no established format for structured logs (waiting for https://www.cncf.io/projects/opentelemetry/ graduated state), the format was chosen based on popular solutions: zerolog from the Golang ecosystem, and Logback from Java.

Log format with basic fields:
```json
{
    "timestamp": 1696689301574,
    "level": "debug",
    "message": "Debug message",
    "context": "default",
    "traceId": "25215d96-e247-40b4-8146-a93f1b9250c0"
}
```

### Metrics example

```
# HELP nest_log_events_total Total count of log events
# TYPE nest_log_events_total counter
nest_log_events_total{level="debug",context="default"} 1
```

## Http server

### Why include it in the starter?

It would be entirely correct to say that not every application requires an HTTP server. However, it is an integral part of NestJS itself, and we have decided to make it part of the starter as well.

### What's wrong with the default NestJS HTTP server?

NestJS suffers from a lack of abstraction over the HTTP server, directly referencing implementations: Express or Fastify. Otherwise, the solution works well.

### The solution

The starter provides a pre-configured setup of Fastify. It was chosen as a more maintained project. Also, for some projects, performance may be a critical factor.

### Metrics example

```
# HELP http_server_requests_seconds Http server request time seconds
# TYPE http_server_requests_seconds histogram
nest_http_requests_seconds_bucket{le="+Inf",method="GET",uri="/hello",status="200"} 1
nest_http_requests_seconds_sum{method="GET",uri="/hello",status="200"} 0.0008857910000006086
nest_http_requests_seconds_count{method="GET",uri="/hello",status="200"} 1
```

## Production-ready features

### Actuator

Yes, our team couldn't come up with our own term. The actuator is a well-known concept from the Spring Boot ecosystem.
The actuator mainly exposes operational information about the running application — health, metrics, info etc.

### Graceful shutdown

Essential feature for cloud deployments. "Zero-downtime" deployment is a must-have for any modern application.

### Healthcheck

The starter provides two simple health checks:
1. /actuator/health - At the moment, it will only detect application freeze, without checking system components. Can be used as a liveness probe with caution.
2. /actuator/readiness - This endpoint checks the http server readiness. It can be used as a readiness probe.

### Prometheus metrics

Surprisingly, the observability point is simply absent from the NestJS documentation. Any modern application should have monitoring tools.

The starter provides a module for Prometheus.
The module implements the [standard interface](https://github.com/monke-systems/small-standards/blob/master/src/standards/prometheus.ts), so all starter modules and third-party modules that implement the interface can provide their own metrics.

The starter already includes metrics for:

1. HTTP module
2. Logging module
3. Default Node.js process

Default metrics endpoint is

```
 /actuator/prometheus
```

## Package update flow

Package publishing only available via CI jobs.

You must use '-beta' postfix for testing purposes. Otherwise CI job being failed. Bump version via npm

```bash
npm version prerelease --preid beta
```

Before merge changes into master branch you should remove 'beta' postfix

```bash
npm version major | minor | patch
```

Learn more <https://docs.npmjs.com/cli/v8/commands/npm-version>

