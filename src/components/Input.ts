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
  private handleInputBound: ((event: Event) => void) | null = null;

  constructor(props: InputProps) {
    super('div', props, { value: props.value || '' });
    this.handleInputBound = this.handleInput.bind(this);
  }

  render(): string {
    const { label, placeholder = '', type = 'text', id } = this.props;
    // Используем value из props, а не из state!
    const value = this.props.value || '';

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
    this.removeEventListeners();
    this.attachEventListeners();
    // Восстанавливаем фокус, если input был сфокусирован
    const input = this.element.querySelector('input') as HTMLInputElement;
    if (input && document.activeElement?.id === input.id) {
      const cursorPos = input.value.length;
      input.focus();
      input.setSelectionRange(cursorPos, cursorPos);
    }
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
    
    // НЕ вызываем setState, только callback!
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  public getValue(): string {
    const input = this.element.querySelector('input') as HTMLInputElement;
    return input ? input.value : this.props.value || '';
  }

  public setValue(value: string): void {
    const input = this.element.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = value;
    }
  }

  protected componentWillUnmount(): void {
    this.removeEventListeners();
  }
}