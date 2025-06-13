import type { AxiosInstance, AxiosResponse } from 'axios';
import { z } from 'zod';
import { FibaroRoomSchema, type FibaroRoom } from './room.types.js';

export class RoomApi {
  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * Get all rooms from the HC3 system
   * @param visible - Filter by visible rooms only
   * @param empty - Filter by empty/non-empty rooms
   * @returns Array of room objects
   */
  async getRooms(visible?: boolean, empty?: boolean): Promise<FibaroRoom[]> {
    const params = new URLSearchParams();
    if (visible !== undefined) {
      params.append('visible', visible.toString());
    }
    if (empty !== undefined) {
      params.append('empty', empty.toString());
    }

    const response: AxiosResponse<unknown[]> = await this.axiosInstance.get(
      `/api/rooms${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return z.array(FibaroRoomSchema).parse(response.data);
  }

  /**
   * Get a specific room by ID
   * @param roomId - Room ID
   * @returns Room object
   */
  async getRoom(roomId: number): Promise<FibaroRoom> {
    const response: AxiosResponse<unknown> = await this.axiosInstance.get(`/api/rooms/${roomId}`);

    return FibaroRoomSchema.parse(response.data);
  }
}
