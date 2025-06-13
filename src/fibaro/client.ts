import axios, { type AxiosInstance } from 'axios';
import { getConfig } from '../config/index.js';
import { RoomApi } from './room.api.js';
import { DeviceApi } from './device.api.js';
import { SceneApi } from './scene.api.js';
import type { FibaroClientConfig } from './types.js';
import { getLogger } from '../logger.js';

export class FibaroClient {
  private axiosInstance: AxiosInstance;
  private config: FibaroClientConfig;
  public readonly rooms: RoomApi;
  public readonly devices: DeviceApi;
  public readonly scenes: SceneApi;

  constructor(config: FibaroClientConfig) {
    this.config = {
      port: 80,
      timeout: 10000,
      ...config,
    };

    const baseURL = `http://${this.config.host}:${this.config.port}`;

    this.axiosInstance = axios.create({
      baseURL,
      timeout: this.config.timeout,
      auth: {
        username: this.config.username,
        password: this.config.password,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Initialize API instances
    this.rooms = new RoomApi(this.axiosInstance);
    this.devices = new DeviceApi(this.axiosInstance);
    this.scenes = new SceneApi(this.axiosInstance);
  }

  /**
   * Test connection to the HC3 system
   * @returns Promise that resolves if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/api/rooms');
      return true;
    } catch (error) {
      getLogger().error('HC3 connection test failed:', error);
      return false;
    }
  }
}

function getFibaroClientConfig(): FibaroClientConfig {
  const config = getConfig();
  return {
    host: config.HC3_HOST,
    port: config.HC3_PORT,
    username: config.HC3_USERNAME,
    password: config.HC3_PASSWORD,
    timeout: config.SERVER_TIMEOUT,
  };
}

let clientInstance: FibaroClient | null = null;

/**
 * Get the Fibaro client instance
 * @returns The client instance
 */
export function getFibaroClient(): FibaroClient {
  if (!clientInstance) {
    const clientConfig = getFibaroClientConfig();
    clientInstance = new FibaroClient(clientConfig);
  }
  return clientInstance;
}
