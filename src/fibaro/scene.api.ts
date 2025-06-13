import type { AxiosInstance, AxiosResponse } from 'axios';
import { z } from 'zod';
import { FibaroSceneSchema, type FibaroScene, type ExecuteSceneRequest } from './scene.types.js';

export class SceneApi {
  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * Get all scenes from the HC3 system
   * @param alexaProhibited - Filter by alexa prohibited scenes
   * @returns Array of scene objects
   */
  async getScenes(alexaProhibited?: boolean): Promise<FibaroScene[]> {
    const params = new URLSearchParams();
    if (alexaProhibited !== undefined) {
      params.append('alexaProhibited', alexaProhibited.toString());
    }

    const response: AxiosResponse<unknown[]> = await this.axiosInstance.get(
      `/api/scenes${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return z.array(FibaroSceneSchema).parse(response.data);
  }

  /**
   * Get a specific scene by ID
   * @param sceneId - Scene ID
   * @param alexaProhibited - Get scene by alexaProhibited
   * @returns Scene object
   */
  async getScene(sceneId: number, alexaProhibited?: boolean): Promise<FibaroScene> {
    const params = new URLSearchParams();
    if (alexaProhibited !== undefined) {
      params.append('alexaProhibited', alexaProhibited.toString());
    }

    const response: AxiosResponse<unknown> = await this.axiosInstance.get(
      `/api/scenes/${sceneId}${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return FibaroSceneSchema.parse(response.data);
  }

  /**
   * Execute a scene asynchronously
   * @param sceneId - Scene ID
   * @param executeRequest - Optional execution parameters
   * @param pin - Optional PIN for protected scenes
   * @returns Promise that resolves when scene execution is initiated
   */
  async executeScene(
    sceneId: number,
    executeRequest?: ExecuteSceneRequest,
    pin?: string,
  ): Promise<void> {
    const headers: Record<string, string> = {};
    if (pin) {
      headers['Fibaro-User-PIN'] = pin;
    }

    await this.axiosInstance.post(`/api/scenes/${sceneId}/execute`, executeRequest || {}, {
      headers,
    });
  }

  /**
   * Execute a scene synchronously
   * @param sceneId - Scene ID
   * @param executeRequest - Optional execution parameters
   * @param pin - Optional PIN for protected scenes
   * @returns Promise that resolves when scene execution is complete
   */
  async executeSceneSync(
    sceneId: number,
    executeRequest?: ExecuteSceneRequest,
    pin?: string,
  ): Promise<void> {
    const headers: Record<string, string> = {};
    if (pin) {
      headers['Fibaro-User-PIN'] = pin;
    }

    await this.axiosInstance.post(`/api/scenes/${sceneId}/executeSync`, executeRequest || {}, {
      headers,
    });
  }

  /**
   * Kill a running scene
   * @param sceneId - Scene ID
   * @param pin - Optional PIN for protected scenes
   * @returns Promise that resolves when scene is killed
   */
  async killScene(sceneId: number, pin?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (pin) {
      headers['Fibaro-User-PIN'] = pin;
    }

    await this.axiosInstance.post(`/api/scenes/${sceneId}/kill`, {}, { headers });
  }
}
