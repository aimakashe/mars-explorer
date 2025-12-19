export abstract class BaseComponent<P = Record<string, unknown>, S = Record<string, unknown>> {
  protected props: P;
  protected state: S;
  protected element: HTMLElement;
  private children: Map<string, BaseComponent> = new Map();

  constructor(tagName: string, props: P, initialState: S = {} as S) {
    this.props = props;
    this.state = initialState;
    this.element = document.createElement(tagName);
  }

  // Абстрактный метод - должен быть реализован в каждом компоненте
  abstract render(): string;

  // Обновление состояния и перерисовка
  protected setState(newState: Partial<S>): void {
    this.state = { ...this.state, ...newState };
    this.update();
  }

  // Обновление UI
  private update(): void {
    const html = this.render();
    this.element.innerHTML = html;
    this.mountChildren();
    this.componentDidUpdate();
  }

  // Монтирование компонента в DOM
  public mount(parent: HTMLElement): void {
    const html = this.render();
    this.element.innerHTML = html;
    parent.appendChild(this.element);
    this.mountChildren();
    this.componentDidMount();
  }

  // Размонтирование компонента из DOM
  public unmount(): void {
    this.componentWillUnmount();
    this.unmountChildren();
    this.element.remove();
  }

  // Добавление дочернего компонента
  protected addChild(key: string, component: BaseComponent): void {
    this.children.set(key, component);
  }

  // Монтирование всех дочерних компонентов
  private mountChildren(): void {
    this.children.forEach((child, key) => {
      const placeholder = this.element.querySelector(`[data-child-key="${key}"]`);
      if (placeholder) {
        placeholder.innerHTML = '';
        child.mount(placeholder as HTMLElement);
      }
    });
  }

  // Размонтирование всех дочерних компонентов
  private unmountChildren(): void {
    this.children.forEach(child => child.unmount());
    this.children.clear();
  }

  // Получение корневого элемента
  public getElement(): HTMLElement {
    return this.element;
  }

  // Lifecycle методы (hooks) - можно переопределить в дочерних классах
  protected componentDidMount(): void {
    // Вызывается после первого монтирования
  }

  protected componentDidUpdate(): void {
    // Вызывается после обновления состояния
  }

  protected componentWillUnmount(): void {
    // Вызывается перед размонтированием
  }
}