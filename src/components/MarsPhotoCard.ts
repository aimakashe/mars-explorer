import { BaseComponent } from '../core/BaseComponent';
import { Photo } from '../types/mars';

interface MarsPhotoCardProps {
  photo: Photo;
  onClick?: (photo: Photo) => void;
}

export class MarsPhotoCard extends BaseComponent<MarsPhotoCardProps> {
  constructor(props: MarsPhotoCardProps) {
    super('div', props, {});
  }

  render(): string {
    const { photo } = this.props;

    return `
      <div class="photo-card" data-photo-id="${photo.id}">
        <img src="${photo.img_src}" alt="Mars photo from ${photo.rover.name}" class="photo-image" />
        <div class="photo-info">
          <p class="photo-camera"><strong>Camera:</strong> ${photo.camera.full_name}</p>
          <p class="photo-date"><strong>Date:</strong> ${photo.earth_date}</p>
          <p class="photo-rover"><strong>Rover:</strong> ${photo.rover.name}</p>
          <p class="photo-sol"><strong>Sol:</strong> ${photo.sol}</p>
        </div>
      </div>
    `;
  }

  protected componentDidMount(): void {
    this.attachEventListeners();
  }

  protected componentDidUpdate(): void {
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const img = this.element.querySelector('.photo-image') as HTMLImageElement;
    const card = this.element.querySelector('.photo-card');
    
    if (img) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', this.handleImageClick.bind(this));
    }

    if (card) {
      card.addEventListener('click', this.handleCardClick.bind(this));
    }
  }

  private handleImageClick(event: Event): void {
    event.stopPropagation();
    const { photo } = this.props;
    window.open(photo.img_src, '_blank');
  }

  private handleCardClick(): void {
    if (this.props.onClick) {
      this.props.onClick(this.props.photo);
    }
  }

  protected componentWillUnmount(): void {
    const img = this.element.querySelector('.photo-image');
    const card = this.element.querySelector('.photo-card');
    
    if (img) {
      img.removeEventListener('click', this.handleImageClick.bind(this));
    }
    if (card) {
      card.removeEventListener('click', this.handleCardClick.bind(this));
    }
  }
}