import { BaseComponent } from './BaseComponent';

type RouteComponent = new (params?: Record<string, string>) => BaseComponent<unknown, unknown>;

interface Route {
  path: string;
  component: RouteComponent;
}

export class Router {
  private routes: Route[] = [];
  private notFoundComponent: RouteComponent | null = null;
  private currentComponent: BaseComponent<unknown, unknown> | null = null;
  private rootElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.init();
  }

  private init(): void {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  public register(path: string, component: RouteComponent): void {
    this.routes.push({ path, component });
  }

  public setNotFound(component: RouteComponent): void {
    this.notFoundComponent = component;
  }

  public navigate(path: string): void {
    window.location.hash = path;
  }

  private getCurrentPath(): string {
    const hash = window.location.hash.slice(1);
    
    // Если хэш пустой, устанавливаем '/' и возвращаем его
    if (!hash) {
      window.location.hash = '/';
      return '/';
    }
    
    return hash.startsWith('/') ? hash : '/' + hash;
  }

  private matchRoute(routePath: string, currentPath: string): { matched: boolean; params: Record<string, string> } {
    const normalizePathForComparison = (path: string): string => {
      let normalized = path.startsWith('/') ? path.slice(1) : path;
      normalized = normalized.endsWith('/') && normalized.length > 1 ? normalized.slice(0, -1) : normalized;
      return normalized;
    };

    const routeNormalized = normalizePathForComparison(routePath);
    const currentNormalized = normalizePathForComparison(currentPath);

    if (routeNormalized === '' && currentNormalized === '') {
      return { matched: true, params: {} };
    }

    const routeParts = routeNormalized.split('/').filter(Boolean);
    const currentParts = currentNormalized.split('/').filter(Boolean);

    if (routeParts.length !== currentParts.length) {
      return { matched: false, params: {} };
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = currentParts[i];
      } else if (routeParts[i] !== currentParts[i]) {
        return { matched: false, params: {} };
      }
    }

    return { matched: true, params };
  }

  private handleRoute(): void {
    const currentPath = this.getCurrentPath();

    if (this.currentComponent) {
      this.currentComponent.unmount();
      this.currentComponent = null;
    }

    this.rootElement.innerHTML = '';

    let componentToRender: RouteComponent | null = null;
    let routeParams: Record<string, string> = {};
    let routeFound = false;

    for (const route of this.routes) {
      const { matched, params } = this.matchRoute(route.path, currentPath);
      if (matched) {
        componentToRender = route.component;
        routeParams = params;
        routeFound = true;
        break;
      }
    }

    if (!routeFound && this.notFoundComponent) {
      componentToRender = this.notFoundComponent;
    }

    if (componentToRender) {
      this.currentComponent = new componentToRender(routeParams);
      this.currentComponent.mount(this.rootElement);
    }
  }

  public start(): void {
    // Устанавливаем хэш при первом запуске, если его нет
    if (!window.location.hash) {
      window.location.hash = '/';
    }
    this.handleRoute();
  }
}