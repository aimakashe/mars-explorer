import { BaseComponent } from '../core/BaseComponent';

interface InputProps {
  label: string;
  placeholder?: string;
  value?: string;
  type?: string;
  id: string;
  onChange?: (value: string) => void;
}

interface InputState {
  value: string;
}

export class Input extends BaseComponent<InputProps, InputState> {
  constructor(props: InputProps) {
    super('div', props, { value: props.value || '' });
  }

  render(): string {
    const { label, placeholder = '', type = 'text', id } = this.props;
    const { value } = this.state;

    return `
      <div class="input-wrapper">
        <label for="${id}" class="input-label">${label}</label>
        <input 
          type="${type}" 
          id="${id}" 
          class="input-field" 
          placeholder="${placeholder}"
          value="${value}"
        />
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
    const input = this.element.querySelector('input');
    if (input) {
      input.addEventListener('input', this.handleInput.bind(this));
    }
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    this.setState({ value });

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  public getValue(): string {
    return this.state.value;
  }

  public setValue(value: string): void {
    this.setState({ value });
  }

  protected componentWillUnmount(): void {
    const input = this.element.querySelector('input');
    if (input) {
      input.removeEventListener('input', this.handleInput.bind(this));
    }
  }
}