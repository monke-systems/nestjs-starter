export type StructuredLog = {
  timestamp: number;
  level: string;
  message: string;
  context: string;
  traceId?: string;
  [key: string]: unknown;
};
