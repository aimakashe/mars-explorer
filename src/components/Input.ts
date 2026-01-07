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
  internalValue: string;
}

export class Input extends BaseComponent<InputProps, InputState> {
  private handleInputBound: ((event: Event) => void) | null = null;

  constructor(props: InputProps) {
    super('div', props, { internalValue: props.value || '' });
    this.handleInputBound = this.handleInput.bind(this);
  }

  render(): string {
    const { label, placeholder = '', type = 'text', id } = this.props;
    // используем internalValue для начального значения
    const value = this.state.internalValue;

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
    // НЕ обновляем, чтобы не сбросить фокус
  }

  private attachEventListeners(): void {
    const input = this.element.querySelector('input');
    if (input && this.handleInputBound) {
      input.addEventListener('input', this.handleInputBound);
    }
  }

  private removeEventListeners(): void {
    const input = this.element.querySelector('input');
    if (input && this.handleInputBound) {
      input.removeEventListener('input', this.handleInputBound);
    }
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Обновляем внутреннее состояние
    this.state.internalValue = value;
    
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  public getValue(): string {
    const input = this.element.querySelector('input') as HTMLInputElement;
    return input ? input.value : this.state.internalValue;
  }

  public setValue(value: string): void {
    const input = this.element.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = value;
      this.state.internalValue = value;
    }
  }

  protected componentWillUnmount(): void {
    this.removeEventListeners();
  }
}