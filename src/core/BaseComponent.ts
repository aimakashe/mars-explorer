export abstract class BaseComponent<T extends HTMLElement = HTMLElement> {
    protected element: T;

    constructor(tagName: string, className?: string) {
        this.element = document.createElement(tagName) as T;
        if (className) {
            this.element.className = className;
        }
    }

    // Метод для рендера компонента в родительский элемент
    public render(parent: HTMLElement): void {
        parent.appendChild(this.element);
        this.onRender();
    }

    // Метод, который можно переопределять в наследниках для кастомного рендера
    protected onRender(): void {}
    
    // Метод для удаления компонента
    public destroy(): void {
        this.element.remove();
    }

    // Получить DOM-элемент компонента
    public getElement(): T {
        return this.element;
    }
}
