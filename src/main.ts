import { Router } from './core/Router';
import { PageMarsRoverSearch } from './pages/PageMarsRoverSearch';
import { PageNotFound } from './pages/PageNotFound';
import { PagePhotoDetail } from './pages/PagePhotoDetail';

// Получаем корневой элемент
const appElement = document.getElementById('app');

if (!appElement) {
  throw new Error('App element not found');
}

// Создаем роутер
const router = new Router(appElement);

// Регистрируем маршруты
router.register('/', PageMarsRoverSearch);
router.register('/photo/:id', PagePhotoDetail);

// Устанавливаем страницу 404
router.setNotFound(PageNotFound);

// Запускаем роутер
router.start();