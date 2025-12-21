import { BaseComponent } from '../core/BaseComponent';
import { marsApi } from '../api/marsApi';
import { Photo } from '../types/mars';

interface PageState {
  photo: Photo | null;
  loading: boolean;
  error: string | null;
}

export class PagePhotoDetail extends BaseComponent<Record<string, unknown>, PageState> {
  private photoId: number;

  constructor() {
    super('div', {}, {
      photo: null,
      loading: true,
      error: null
    });

    // Получаем ID фото из URL (например: #/photo/12345)
    const hash = window.location.hash;
    const match = hash.match(/\/photo\/(\d+)/);
    this.photoId = match ? parseInt(match[1]) : 0;
  }

  render(): string {
    const { photo, loading, error } = this.state;

    if (loading) {
      return `
        <div class="page-photo-detail">
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading photo details...</p>
          </div>
        </div>
      `;
    }

    if (error || !photo) {
      return `
        <div class="page-photo-detail">
          <div class="error">
            <h2>⚠️ Photo not found</h2>
            <p>${error || 'Unable to load photo details'}</p>
            <a href="#/" class="back-button">← Back to Gallery</a>
          </div>
        </div>
      `;
    }

    return `
      <div class="page-photo-detail">
        <div class="detail-header">
          <a href="#/" class="back-button">← Back to Gallery</a>
          <h1 class="detail-title">Mars Rover Photo Details</h1>
        </div>

        <div class="detail-content">
          <div class="detail-image-container">
            <img src="${photo.img_src}" alt="Mars photo" class="detail-image" />
            <a href="${photo.img_src}" target="_blank" class="view-original">
              🔍 View Original Image
            </a>
          </div>

          <div class="detail-info">
            <div class="info-section">
              <h2>📷 Camera Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Camera Name:</span>
                  <span class="info-value">${photo.camera.name}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Full Name:</span>
                  <span class="info-value">${photo.camera.full_name}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h2>🤖 Rover Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Rover Name:</span>
                  <span class="info-value">${photo.rover.name}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span>
                  <span class="info-value status-${photo.rover.status.toLowerCase()}">${photo.rover.status}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Launch Date:</span>
                  <span class="info-value">${photo.rover.launch_date}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Landing Date:</span>
                  <span class="info-value">${photo.rover.landing_date}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h2>📅 Photo Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Photo ID:</span>
                  <span class="info-value">${photo.id}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Earth Date:</span>
                  <span class="info-value">${photo.earth_date}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Martian Sol:</span>
                  <span class="info-value">${photo.sol}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  protected componentDidMount(): void {
    this.loadPhotoDetails();
  }

  private async loadPhotoDetails(): Promise<void> {
    this.setState({ loading: true, error: null });

    try {
      // Загружаем фото с тем же Sol, что и ID фото
      // Это упрощенный вариант - в реальности нужен endpoint для конкретного фото
      const response = await marsApi.fetchPhotos({
        roverName: 'curiosity',
        sol: 1000,
        page: 1
      });

      // Ищем фото по ID
      const photo = response.photos.find(p => p.id === this.photoId);

      if (photo) {
        this.setState({
          photo,
          loading: false
        });
      } else {
        this.setState({
          loading: false,
          error: 'Photo not found'
        });
      }

    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load photo details'
      });
    }
  }
}