import { BaseComponent } from '../core/BaseComponent';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { MarsPhotoCard } from '../components/MarsPhotoCard';
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
  private roverInput: Input | null = null;
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
            <div data-child-key="rover-input"></div>
            <div data-child-key="sol-input"></div>
          </div>
          <div data-child-key="search-button"></div>
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
              <div data-child-key="photo-<%= index %>"></div>
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
    this.createPhotoCards();
  }

  private createComponents(): void {
    // Rover Input
    this.roverInput = new Input({
      label: 'Rover Name',
      placeholder: 'curiosity, perseverance, opportunity, spirit',
      value: this.state.roverName,
      id: 'rover-input',
      onChange: (value: string) => {
        this.state.roverName = value;
      }
    });
    this.addChild('rover-input', this.roverInput);

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

    // Create photo cards
    this.createPhotoCards();
  }

  private createPhotoCards(): void {
    this.state.photos.forEach((photo, index) => {
      const photoCard = new MarsPhotoCard({
        photo,
        onClick: (clickedPhoto) => {
          window.location.hash = `/photo/${clickedPhoto.id}`;
        }
      });
      this.addChild(`photo-${index}`, photoCard);
    });
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
}