import { ApiResponse, FetchPhotosParams } from '../types/mars';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class MarsApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async fetchPhotos(params: FetchPhotosParams): Promise<ApiResponse> {
    const { roverName, sol, camera, page = 1 } = params;

    let url = `${this.baseUrl}/rovers/${roverName}/photos?sol=${sol}&page=${page}`;

    if (camera) {
      url += `&camera=${camera}`;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch photos: ${error.message}`);
      }
      throw new Error('Failed to fetch photos: Unknown error');
    }
  }
}

export const marsApi = new MarsApi();