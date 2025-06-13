export type TransportType = 'stdio' | 'http';

export interface HttpTransportConfig {
  host: string;
  port: number;
}

export interface TransportConfig {
  type: TransportType;
  http?: HttpTransportConfig;
}
