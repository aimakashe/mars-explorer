import { BaseComponent } from '../core/BaseComponent';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  id: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
}

interface SelectState {
  value: string;
}

export class Select extends BaseComponent<SelectProps, SelectState> {
  private handleChangeBound: ((event: Event) => void) | null = null;

  constructor(props: SelectProps) {
    super('div', props, { value: props.value || props.options[0]?.value || '' });
    this.handleChangeBound = this.handleChange.bind(this);
  }

  render(): string {
    const { label, id, options } = this.props;
    const { value } = this.state;

    const optionsHtml = options.map(option => 
      `<option value="${option.value}" ${value === option.value ? 'selected' : ''}>${option.label}</option>`
    ).join('');

    return `
      <div class="select-wrapper">
        <label for="${id}" class="select-label">${label}</label>
        <select id="${id}" class="select-field">
          ${optionsHtml}
        </select>
      </div>
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
    const select = this.element.querySelector('select');
    if (select && this.handleChangeBound) {
      select.addEventListener('change', this.handleChangeBound);
    }
  }

  private removeEventListeners(): void {
    const select = this.element.querySelector('select');
    if (select && this.handleChangeBound) {
      select.removeEventListener('change', this.handleChangeBound);
    }
  }

  private handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    
    this.setState({ value });

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  public getValue(): string {
    return this.state.value;
  }

  protected componentWillUnmount(): void {
    this.removeEventListeners();
  }
}