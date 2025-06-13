import type { AxiosInstance, AxiosResponse } from 'axios';
import { z } from 'zod';
import {
  FibaroDeviceSchema,
  type FibaroDevice,
  type FibaroDeviceActionArgs,
} from './device.types.js';

export class DeviceApi {
  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * Get all devices from the HC3 system
   * @param roomId - Filter by room ID
   * @param interfaces - Filter by device interfaces
   * @param type - Filter by device type
   * @returns Array of device objects
   */
  async getDevices(roomId?: number, interfaces?: string[], type?: string): Promise<FibaroDevice[]> {
    const params = new URLSearchParams();
    if (roomId !== undefined) {
      params.append('roomID', roomId.toString());
    }
    if (interfaces?.length) {
      interfaces.forEach((int) => {
        params.append('interface', int);
      });
    }
    if (type) {
      params.append('type', type);
    }

    const response: AxiosResponse<unknown[]> = await this.axiosInstance.get(
      `/api/devices${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return z.array(FibaroDeviceSchema).parse(response.data);
  }

  /**
   * Get a specific device by ID
   * @param deviceId - Device ID
   * @returns Device object
   */
  async getDevice(deviceId: number): Promise<FibaroDevice> {
    const response: AxiosResponse<unknown> = await this.axiosInstance.get(
      `/api/devices/${deviceId}`,
    );

    return FibaroDeviceSchema.parse(response.data);
  }

  /**
   * Call an action on a device
   * @param deviceId - Device ID
   * @param actionName - Name of the action (e.g., 'turnOn', 'turnOff')
   * @param args - Action arguments
   * @returns Promise that resolves when action is executed
   */
  async callDeviceAction(
    deviceId: number,
    actionName: string,
    args: FibaroDeviceActionArgs = {},
  ): Promise<void> {
    await this.axiosInstance.post(`/api/devices/${deviceId}/action/${actionName}`, args);
  }
}
