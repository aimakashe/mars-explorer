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
            <p><strong>Rover:</strong> Select a Mars rover from the dropdown</p>
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
            <p>⚠️ <%= error %></p>
            <button class="retry-button" onclick="location.reload()">Try Again</button>
          </div>
        <% } else if (photos.length === 0) { %>
          <div class="no-results">
            <p>🔍 No photos found</p>
            <p>Try different search parameters</p>
          </div>
        <% } else { %>
          <div class="results-info">
            <p>Found <%= photos.length %> photos</p>
          </div>
          
          <div class="photo-grid">
            <% photos.forEach((photo, index) => { %>
              <div class="photo-card" data-photo-id="<%= photo.id %>">
                <img src="<%= photo.img_src %>" alt="Mars photo from <%= photo.rover.name %>" class="photo-image" />
                <div class="photo-info">
                  <p class="photo-camera"><strong>Camera:</strong> <%= photo.camera.full_name %></p>
                  <p class="photo-date"><strong>Date:</strong> <%= photo.earth_date %></p>
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
    return compiled({ photos, loading, error, currentPage });
  }

  protected componentDidMount(): void {
    this.createComponents();
    this.loadPhotos();
  }

  protected componentDidUpdate(): void {
    this.attachPhotoClickListeners();
  }

  private createComponents(): void {
    // Rover Select
    this.roverSelect = new Select({
      label: 'Mars Rover',
      id: 'rover-select',
      options: [
        { value: 'curiosity', label: 'Curiosity' },
        { value: 'perseverance', label: 'Perseverance' },
        { value: 'opportunity', label: 'Opportunity' },
        { value: 'spirit', label: 'Spirit' }
      ],
      value: this.state.roverName,
      onChange: (value: string) => {
        this.state.roverName = value;
      }
    });
    this.addChild('rover-select', this.roverSelect);

    // Sol Input
    this.solInput = new Input({
      label: 'Martian Sol (Day)',
      placeholder: '1000',
      value: String(this.state.sol),
      type: 'number',
      id: 'sol-input',
      onChange: (value: string) => {
        this.state.sol = parseInt(value) || 1000;
      }
    });
    this.addChild('sol-input', this.solInput);

    // Search Button
    this.searchButton = new Button({
      text: '🔍 Search',
      onClick: () => this.handleSearch()
    });
    this.addChild('search-button', this.searchButton);

    // Prev Button
    this.prevButton = new Button({
      text: '← Previous',
      onClick: () => this.handlePrevPage(),
      disabled: this.state.currentPage === 1
    });
    this.addChild('prev-button', this.prevButton);

    // Next Button
    this.nextButton = new Button({
      text: 'Next →',
      onClick: () => this.handleNextPage(),
      disabled: this.state.photos.length < 25
    });
    this.addChild('next-button', this.nextButton);
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

      // Update button states
      if (this.prevButton) {
        this.prevButton.setDisabled(this.state.currentPage === 1);
      }
      if (this.nextButton) {
        this.nextButton.setDisabled(response.photos.length < 25);
      }

    } catch (error) {
      this.setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load photos'
      });
    }
  }

  private handleSearch(): void {
    // Валидация sol
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

    // Если валидация прошла, загружаем фото
    this.setState({ currentPage: 1 });
    this.loadPhotos();
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
            window.location.hash = `/photo/${photoId}`;
          }
        };
      }
    });
  }
}