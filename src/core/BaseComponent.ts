export abstract class BaseComponent<P = unknown, S = unknown> {
  protected props: P;
  protected state: S;
  protected element: HTMLElement;

  private children: Map<string, BaseComponent<unknown, unknown>> = new Map();

  constructor(tagName: string, props: P, initialState: S) {
    this.props = props;
    this.state = initialState;
    this.element = document.createElement(tagName);
  }

  abstract render(): string;

  protected setState(newState: Partial<S>): void {
    this.state = { ...(this.state as object), ...newState } as S;
    this.update();
  }

  private update(): void {
    const html = this.render();
    this.element.innerHTML = html;
    this.mountChildren();
    this.componentDidUpdate();
  }

  public mount(parent: HTMLElement): void {
    const html = this.render();
    this.element.innerHTML = html;
    parent.appendChild(this.element);
    this.mountChildren();
    this.componentDidMount();
  }

  public unmount(): void {
    this.componentWillUnmount();
    this.unmountChildren();
    this.element.remove();
  }

  protected addChild(key: string, component: BaseComponent<unknown, unknown>): void {
    this.children.set(key, component);
  }

  private mountChildren(): void {
    this.children.forEach((child, key) => {
      const placeholder = this.element.querySelector(
        `[data-child-key="${key}"]`
      );

      if (placeholder) {
        placeholder.innerHTML = '';
        child.mount(placeholder as HTMLElement);
      }
    });
  }

  private unmountChildren(): void {
    this.children.forEach(child => child.unmount());
    this.children.clear();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  protected componentDidMount(): void {}
  protected componentDidUpdate(): void {}
  protected componentWillUnmount(): void {}
}
