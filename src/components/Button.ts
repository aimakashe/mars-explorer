import { BaseComponent } from '../core/BaseComponent';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

interface ButtonState {
  disabled: boolean;
}

export class Button extends BaseComponent<ButtonProps, ButtonState> {
  private handleClickBound: ((event: Event) => void) | null = null;

  constructor(props: ButtonProps) {
    super('div', props, { disabled: props.disabled || false });
    this.handleClickBound = this.handleClick.bind(this);
  }

  render(): string {
    const { text, type = 'button', className = '' } = this.props;
    const { disabled } = this.state;

    return `
      <button 
        type="${type}" 
        class="button ${className}" 
        ${disabled ? 'disabled' : ''}
      >
        ${text}
      </button>
    `;
  }

  protected componentDidMount(): void {
    this.attachEventListeners();
  }

  protected componentDidUpdate(): void {
    this.removeEventListeners();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const button = this.element.querySelector('button');
    if (button && this.handleClickBound) {
      button.addEventListener('click', this.handleClickBound);
    }
  }

  private removeEventListeners(): void {
    const button = this.element.querySelector('button');
    if (button && this.handleClickBound) {
      button.removeEventListener('click', this.handleClickBound);
    }
  }

  private handleClick(event: Event): void {
    event.preventDefault();
    
    if (!this.state.disabled && this.props.onClick) {
      this.props.onClick();
    }
  }

  public setDisabled(disabled: boolean): void {
    this.setState({ disabled });
  }

  protected componentWillUnmount(): void {
    this.removeEventListeners();
  }
}