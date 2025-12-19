import { BaseComponent } from '../core/BaseComponent';

export class PageNotFound extends BaseComponent {
  constructor() {
    super('div', {}, {});
  }

  render(): string {
    return `
      <div class="page-not-found">
        <div class="not-found-content">
          <h1 class="not-found-title">404</h1>
          <p class="not-found-message">Page not found</p>
          <p class="not-found-description">The page you are looking for does not exist.</p>
          <a href="#/" class="not-found-link">Go to Home</a>
        </div>
      </div>
    `;
  }
}