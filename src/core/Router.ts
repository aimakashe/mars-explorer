import { BaseComponent } from './BaseComponent';

type RouteComponent = new () => BaseComponent;

interface Route {
  path: string;
  component: RouteComponent;
}

export class Router {
  private routes: Route[] = [];
  private notFoundComponent: RouteComponent | null = null;
  private currentComponent: BaseComponent | null = null;
  private rootElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.init();
  }

  // Инициализация роутера
  private init(): void {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  // Регистрация маршрута
  public register(path: string, component: RouteComponent): void {
    this.routes.push({ path, component });
  }

  // Регистрация компонента для 404
  public setNotFound(component: RouteComponent): void {
    this.notFoundComponent = component;
  }

  // Навигация на указанный путь
  public navigate(path: string): void {
    window.location.hash = path;
  }

  // Получение текущего пути
  private getCurrentPath(): string {
    return window.location.hash.slice(1) || '/';
  }

  // Парсинг параметров из пути (например /photo/:id)
  private matchRoute(routePath: string, currentPath: string): { matched: boolean; params: Record<string, string> } {
    const routeParts = routePath.split('/').filter(Boolean);
    const currentParts = currentPath.split('/').filter(Boolean);

    if (routeParts.length !== currentParts.length) {
      return { matched: false, params: {} };
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        // Это параметр, сохраняем его значение
        const paramName = routeParts[i].slice(1);
        params[paramName] = currentParts[i];
      } else if (routeParts[i] !== currentParts[i]) {
        // Части не совпадают
        return { matched: false, params: {} };
      }
    }

    return { matched: true, params };
  }

  // Обработка текущего маршрута
  private handleRoute(): void {
    const currentPath = this.getCurrentPath();

    // Размонтируем текущий компонент
    if (this.currentComponent) {
      this.currentComponent.unmount();
      this.currentComponent = null;
    }

    // Очищаем корневой элемент
    this.rootElement.innerHTML = '';

    // Ищем подходящий маршрут
    let componentToRender: RouteComponent | null = null;

    for (const route of this.routes) {
      const { matched } = this.matchRoute(route.path, currentPath);
      if (matched) {
        componentToRender = route.component;
        break;
      }
    }

    // Если маршрут не найден, используем 404
    if (!componentToRender) {
      componentToRender = this.notFoundComponent;
    }

    // Рендерим компонент
    if (componentToRender) {
      this.currentComponent = new componentToRender();
      this.currentComponent.mount(this.rootElement);
    }
  }

  // Запуск роутера
  public start(): void {
    this.handleRoute();
  }
}