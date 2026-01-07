import { BaseComponent } from '../core/BaseComponent';
import { Photo } from '../types/mars';

interface PageState {
  photo: Photo | null;
  loading: boolean;
  error: string | null;
}

export class PagePhotoDetail extends BaseComponent<Record<string, unknown>, PageState> {
  constructor(_params?: Record<string, string>) {
    super('div', {}, {
      photo: null,
      loading: false,
      error: 'This page does not exist. Photo details are not available.'
    });
  }

  render(): string {
    const { error } = this.state;

    // Всегда показываем 404 согласно требованиям
    return `
      <div class="page-photo-detail">
        <div class="error">
          <h2>⚠️ Page Not Found</h2>
          <p>${error}</p>
          <a href="#/" class="back-button">← Back to Gallery</a>
        </div>
      </div>
    `;
  }

  protected componentDidMount(): void {
 // «При нажатии на карточку фотографии должен происходить переход на несуществующий маршрут детальной страницы,
// который обязан отображать страницу 404.»
  }
}