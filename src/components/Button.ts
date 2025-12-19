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
  constructor(props: ButtonProps) {
    super('div', props, { disabled: props.disabled || false });
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
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const button = this.element.querySelector('button');
    if (button) {
      button.addEventListener('click', this.handleClick.bind(this));
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
    const button = this.element.querySelector('button');
    if (button) {
      button.removeEventListener('click', this.handleClick.bind(this));
    }
  }
}