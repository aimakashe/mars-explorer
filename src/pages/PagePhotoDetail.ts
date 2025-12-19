import { BaseComponent } from '../core/BaseComponent';

export class PagePhotoDetail extends BaseComponent {
  constructor() {
    super('div', {}, {});
  }

  render(): string {
    return `
      <div class="page-photo-detail">
        <div class="photo-detail-content">
          <h1>Photo Detail Page</h1>
          <p>This page will show detailed information about a Mars rover photo.</p>
          <a href="#/" class="back-link">← Back to Gallery</a>
        </div>
      </div>
    `;
  }
}