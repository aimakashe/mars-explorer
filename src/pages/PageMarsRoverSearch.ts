import { BaseComponent } from '../core/BaseComponent';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { marsApi } from '../api/marsApi';
import { Photo } from '../types/mars';
import template from 'lodash/template';

interface PageState {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  roverName: string;
  sol: number;
}

export class PageMarsRoverSearch extends BaseComponent<Record<string, unknown>, PageState> {
  private roverSelect: Select | null = null;
  private solInput: Input | null = null;
  private searchButton: Button | null = null;
  private prevButton: Button | null = null;
  private nextButton: Button | null = null;

  constructor() {
    super('div', {}, {
      photos: [],
      loading: false,
      error: null,
      currentPage: 1,
      roverName: 'curiosity',
      sol: 1000
    });
  }

  render(): string {
    const { photos, loading, error, currentPage } = this.state;

    // Преобразуем photos для безопасного отображения camera
    const processedPhotos = photos.map(photo => ({
      ...photo,
      cameraName: this.getCameraName(photo.camera),
      earthDate: photo.earth_date || 'N/A'
    }));

    const templateString = `
      <div class="page-mars-rover-search">
        <header class="page-header">
          <h1 class="page-title">Mars Rover Photos</h1>
          <p class="page-subtitle">Explore photos from NASA's Mars rovers</p>
        </header>

        <div class="search-section">
          <div class="search-inputs">
            <div data-child-key="rover-select"></div>
            <div data-child-key="sol-input"></div>
          </div>
          <div data-child-key="search-button"></div>
          
          <div class="search-hint">
            <p><strong>Available rovers:</strong> Curiosity, Perseverance, Opportunity, Spirit</p>
            <p><strong>Sol:</strong> Martian day number (0-10000)</p>
          </div>
        </div>

        <% if (loading) { %>
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading photos from Mars...</p>
          </div>
        <% } else if (error) { %>
          <div class="error">
            <h2>⚠️ Error Loading Photos</h2>
            <p><%= error %></p>
            <% if (error.includes('404')) { %>
              <p style="margin-top: 1rem; color: #888;">This rover may not have photos for Sol <%= sol %>. Try a different Sol value or rover.</p>
            <% } %>
            <button class="retry-button" onclick="location.reload()">Try Again</button>
          </div>
        <% } else if (photos.length === 0) { %>
          <div class="no-results">
            <p>🔍 No photos found</p>
            <p>Try different search parameters. Some rovers may not have photos for the selected Sol.</p>
          </div>
        <% } else { %>
          <div class="results-info">
            <p>Showing <%= photos.length %> photo<%= photos.length !== 1 ? 's' : '' %> on this page</p>
          </div>
          
          <div class="photo-grid">
            <% processedPhotos.forEach(function(photo) { %>
              <div class="photo-card" data-photo-id="<%= photo.id %>">
                <img src="<%= photo.img_src %>" alt="Mars photo from <%= photo.rover.name %>" class="photo-image" />
                <div class="photo-info">
                  <p class="photo-camera"><strong>Camera:</strong> <%= photo.cameraName %></p>
                  <p class="photo-date"><strong>Date:</strong> <%= photo.earthDate %></p>
                  <p class="photo-rover"><strong>Rover:</strong> <%= photo.rover.name %></p>
                  <p class="photo-sol"><strong>Sol:</strong> <%= photo.sol %></p>
                </div>
              </div>
            <% }); %>
          </div>

          <div class="pagination">
            <div data-child-key="prev-button"></div>
            <span class="page-number">Page <%= currentPage %></span>
            <div data-child-key="next-button"></div>
          </div>
        <% } %>
      </div>
    `;

    const compiled = template(templateString);
    return compiled({ 
      photos, 
      processedPhotos, 
      loading, 
      error, 
      currentPage,
      sol: this.state.sol 
    });
  }

  // Вспомогательный метод для безопасного получения имени камеры
  private getCameraName(camera: unknown): string {
    if (!camera) return 'Unknown';
    
    if (typeof camera === 'string') {
      return camera;
    }
    
    if (typeof camera === 'object' && camera !== null) {
      const cam = camera as { 
        name?: string | { filter_name?: string }; 
        full_name?: string | { filter_name?: string };
      };
      
      // Проверяем name
      if (cam.name) {
        if (typeof cam.name === 'string') {
          return cam.name;
        }
        if (typeof cam.name === 'object' && cam.name.filter_name) {
          return cam.name.filter_name;
        }
      }
      
      // Проверяем full_name
      if (cam.full_name) {
        if (typeof cam.full_name === 'string') {
          return cam.full_name;
        }
        if (typeof cam.full_name === 'object' && cam.full_name.filter_name) {
          return cam.full_name.filter_name;
        }
      }
    }
    
    return 'Unknown';
  }

  protected componentDidMount(): void {
    // Пытаемся восстановить сохраненное состояние
    const savedState = localStorage.getItem('mars_rover_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        this.state.roverName = parsed.roverName || 'curiosity';
        this.state.sol = parsed.sol || 1000;
        this.state.currentPage = parsed.currentPage || 1;
        localStorage.removeItem('mars_rover_state');
      } catch {
        // Обработка ошибок
      }
    }

    this.createComponents();
    this.loadPhotos();
  }

  protected componentDidUpdate(): void {
    // Не пересоздаем Input и Select, только обновляем кнопки и listeners
    this.updatePaginationButtons();
    this.attachPhotoClickListeners();
  }

  private updatePaginationButtons(): void {
    // Обновляем только состояние кнопок пагинации
    const isPrevDisabled = this.state.currentPage === 1;
    const isNextDisabled = this.state.photos.length < 25;

    if (this.prevButton) {
      this.prevButton.setDisabled(isPrevDisabled);
    }

    if (this.nextButton) {
      this.nextButton.setDisabled(isNextDisabled);
    }
  }

  private createComponents(): void {
    // Rover Select
    this.roverSelect = new Select({
      label: 'Rover Name',
      id: 'rover-select',
      options: [
        { value: 'curiosity', label: 'Curiosity' },
        { value: 'perseverance', label: 'Perseverance' },
        { value: 'opportunity', label: 'Opportunity' },
        { value: 'spirit', label: 'Spirit' }
      ],
      value: this.state.roverName,
      onChange: (value: string) => {
        // Не вызываем setState, просто сохраняем значение
        this.state.roverName = value;
      }
    });
    this.addChild('rover-select', this.roverSelect);

    // не вызываем setState при вводе
    this.solInput = new Input({
      label: 'Martian Sol (Day)',
      placeholder: '1000',
      value: String(this.state.sol),
      type: 'number',
      id: 'sol-input',
      onChange: (value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
          // Не вызываем setState, просто сохраняем значение
          this.state.sol = numValue;
        }
      }
    });
    this.addChild('sol-input', this.solInput);

    // Search Button
    this.searchButton = new Button({
      text: '🔍 Search',
      onClick: () => this.handleSearch()
    });
    this.addChild('search-button', this.searchButton);

    // Всегда создаем кнопки пагинации
    const isPrevDisabled = this.state.currentPage === 1;
    const isNextDisabled = this.state.photos.length < 25;

    // Prev Button
    this.prevButton = new Button({
      text: '← Previous',
      onClick: () => this.handlePrevPage(),
      disabled: isPrevDisabled
    });
    this.addChild('prev-button', this.prevButton);

    // Next Button
    this.nextButton = new Button({
      text: 'Next →',
      onClick: () => this.handleNextPage(),
      disabled: isNextDisabled
    });
    this.addChild('next-button', this.nextButton);
  }

  private handleSearch(): void {
    if (this.state.sol < 0) {
      this.setState({ 
        error: 'Sol (day) must be a positive number',
        photos: []
      });
      return;
    }

    if (this.state.sol > 10000) {
      this.setState({ 
        error: 'Sol (day) is too large. Please enter a value less than 10000',
        photos: []
      });
      return;
    }

    this.setState({ currentPage: 1 });
    this.loadPhotos();
  }

  private async loadPhotos(): Promise<void> {
    this.setState({ loading: true, error: null });

    try {
      const response = await marsApi.fetchPhotos({
        roverName: this.state.roverName.toLowerCase(),
        sol: this.state.sol,
        page: this.state.currentPage
      });

      this.setState({
        photos: response.photos,
        loading: false
      });

    } catch (error) {
      this.setState({
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load photos'
      });
    }
  }

  private handlePrevPage(): void {
    if (this.state.currentPage > 1) {
      this.setState({ currentPage: this.state.currentPage - 1 });
      this.loadPhotos();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private handleNextPage(): void {
    this.setState({ currentPage: this.state.currentPage + 1 });
    this.loadPhotos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private attachPhotoClickListeners(): void {
    const photoCards = this.element.querySelectorAll('.photo-card');
    photoCards.forEach(card => {
      const img = card.querySelector('.photo-image') as HTMLImageElement;
      const photoId = card.getAttribute('data-photo-id');
      
      if (img) {
        img.style.cursor = 'pointer';
        img.onclick = (e) => {
          e.stopPropagation();
          window.open(img.src, '_blank');
        };
      }

      if (card) {
        (card as HTMLElement).style.cursor = 'pointer';
        (card as HTMLElement).onclick = () => {
          if (photoId) {
            localStorage.setItem('mars_rover_state', JSON.stringify({
              roverName: this.state.roverName,
              sol: this.state.sol,
              currentPage: this.state.currentPage
            }));
            window.location.hash = `/photo/${photoId}`;
          }
        };
      }
    });
  }
}