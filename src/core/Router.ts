import { BaseComponent } from './BaseComponent';

type Route = {
    path: string;
    component: new () => BaseComponent;
};

export class Router {
    private routes: Route[] = [];
    private rootElement: HTMLElement;

    constructor(rootSelector: string) {
        const root = document.querySelector<HTMLElement>(rootSelector);
        if (!root) throw new Error(`Root element "${rootSelector}" not found`);
        this.rootElement = root;

        window.addEventListener('hashchange', () => this.handleRoute());
    }

    public register(path: string, component: new () => BaseComponent): void {
        this.routes.push({ path, component });
    }

    private handleRoute(): void {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.routes.find(r => r.path === hash);

        this.rootElement.innerHTML = '';

        if (route) {
            const componentInstance = new route.component();
            componentInstance.render(this.rootElement);
        } else {
            console.warn(`Route "${hash}" not found`);
        }
    }

    public init(): void {
        this.handleRoute();
    }
}
