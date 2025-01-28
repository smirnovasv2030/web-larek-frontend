# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Данные и типы данных, используемые в приложении

Карточка товара

```
export interface IItem {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
  index ?: number;
}
```
Каталог карточек товара

```
export interface IItemsList {
  items: IItem[];
  total: number;
}
```

Интерфейс для модели дынных карточек товара

```
export interface IItemsData {
  items: IItem[];
  preview: string|null;
  addItem(itemId: string): void;
  getItem(itemId: string): IItem;
  basket: IItem[];
  total: number;
  deleteItem(id: string): void;
}
```

Данные карточки товара в модальном окне карточки товара
```
export type TItemPreview = Pick<IItem, 'category' | 'title' | 'description' | 'image' | 'price'>;
```
Данные карточки товара в корзине
```
export type TItemBasket = Pick<IItem, 'title' | 'price' | 'id'>;
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой отображения, отвечает за отображение данных на странице,
- слой данных, отвечает за хранение и изменение данных
- слой взаимодействия - презентер, отвечает за связь отображения и данных.

### Базовый код

#### Класс Api
Содержит логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

### Слой данных

#### Класс ModelData
Класс отвечает за хранение и логику работы с данными о товаре.\
Конструктор класса принимает инстант брокера событий\
В полях класса хранятся следующие данные:
- `protected _items: IItem[];` Хранит список доступных товаров
- `protected _preview: string | null;` Хранит ID выбранного товара для превью
- `protected events: IEvents;` Объект для обработки событий
- `protected _basket: IItem[] = [];` Хранит товары в корзине
- `total: number;` Количество товаров

Так же класс предоставляет набор методов для взаимодействия с этими данными.

- методы `set` и `get` - Установка и получение списка товаров
- `set preview` и `get preview` - Установка и получение выбранного товара для превью
- `addItem` - Добавление товара в корзину
- `deleteItem` - Удаление товара из корзины

### Слой отображения

#### Класс Component

Класс `Component<T>` является абстрактным базовым классом для создания компонентов пользовательского интерфейса в веб-приложениях. Конструктор класса принимает в качестве аргумента контейнер типа `HTMLElement`, который служит базовым элементом для размещения содержимого компонента.
Класс предоставляет набор методов для манипуляций с элементами интерфейса, включая:
- `toggleClass(element: HTMLElement, className: string, force?: boolean)`: Переключает наличие указанного класса на элементе, основываясь на флаге `force`.
- `setText(element: HTMLElement, value: unknown)`: Устанавливает текстовое содержимое указанного элемента.
- `setDisabled(element: HTMLElement, state: boolean)`: Устанавливает или убирает атрибут `disabled` у переданного HTML-элемента на основе состояния `state`.
- `setImage(element: HTMLImageElement, src: string, alt?: string)`: Устанавливает источник изображения и его альтернативный текст.
- `getElement(selector)`: Возвращает дочерний HTML-элемент по предоставленному селектору внутри контейнера. Если элемент не найден, выбрасывает ошибку.

Класс предназначен для расширения и реализации в подклассах, позволяя создавать более специализированные компоненты, которые могут управлять пользовательским интерфейсом более гибко. Такими классами являются:

##### Класс ItemView
Класс `ItemView` расширяет базовый класс `Component` и реализует функциональность для отображения элемента товара. Этот класс предназначен для визуализации информации о товаре, а также для обработки связанных событий. Класс ожидает, что элемент будет передан в качестве контейнера, а также события для обработки взаимодействий.
Конструктор класса принимает аргументы:
  - `container` (HTMLElement): Корневой HTML-элемент, внутри которого находятся дочерние элементы карточки.
    - `events` (IEvents): Объект для управления событиями, позволяющий взаимодействовать с внешней логикой приложения.
  - Инициализируются DOM-элементы, такие как название (`_title`) и цена (`_price`).

Методы класса:
- `render(itemData: IItem): HTMLElement`:
  - Наполняет карточку данными: заголовком и ценой.
  - Возвращает контейнер карточки.
- `set title(itemTitle: string)` (сеттер):
  - Устанавливает текстовое содержимое заголовка карточки.
- `set price(itemPrice: number | null)` (сеттер):
  - Устанавливает текстовое содержимое цены карточки, добавляя единицу измерения («синапсы») или указывая «Бесценно», если цена не задана.
- `getElement(selector: string): HTMLElement`:
  - Вспомогательный метод для поиска дочерних элементов внутри контейнера на основе CSS-селектора.
  - Бросает ошибку, если элемент не найден.


##### Класс PageCatalog

Класс `PageCatalog` представляет собой компонент страницы каталога, который управляет отображением элементов на странице, такими как галерея товаров и счётчик в корзине. Класс наследует от базового компонента `Component` и реализует взаимодействие с элементами пользовательского интерфейса через события.

Свойства класса:
- `_basketCounter`: HTML-элемент, отображающий текущее количество товаров в корзине.
  - `_gallery`: HTML-элемент, содержащий список товаров (галерею).
  - `_basketButton`: HTML-кнопка, предназначенная для открытия корзины.
  - `events`: Экземпляр интерфейса `IEvents`, предоставляющий возможность подписываться и слушать события.


`constructor(container: HTMLElement, events: IEvents)`: Конструктор класса, который принимает контейнер, в котором размещены элементы компонента, и объект событий. Он инициализирует элементы интерфейса и настраивает обработчик событий для кнопки корзины.

Методы класса:
- `set basketCounter(count: number)`: Сеттер, который обновляет отображаемое количество товаров в корзине.
- `set gallery(items: HTMLElement[])`: Сеттер, который Обновляет содержимое галереи товаров.
- `render(data: Partial<ICatalog>): HTMLElement`: Обновляет состояние компонента на основе переданных данных. Принимает объект с полями `gallery` и/или `basketCounter`, которые изменяют соответствующие элементы интерфейса. Возвращает контейнер компонента.

##### Класс ItemBasketView
`ItemBasketView` — класс, расширяющий функциональность `ItemView`, предназначен для управления отображением элемента корзины. Он добавляет возможности удаления товара из корзины и отображения порядкового номера товара. Класс взаимодействует с внешними событиями через `IEvents` и предоставляет интерфейс для обновления и удаления элемента корзины.

Поля:
- `_id`: Уникальный идентификатор элемента корзины.
- `_index`: Элемент для отображения порядкового номера товара.
- `_button`: Кнопка для удаления товара из корзины.

Методы:
- `render(itemData: IItem): HTMLElement`: Наполняет элемент корзины данными (заголовок, цена, индекс).
- `deleteItem(): void`: Удаляет элемент корзины из DOM.

Обработчики событий:
- При нажатии кнопки удаления (`_button`) вызывает событие `item:remove` с текущим элементом.

##### Класс ItemCatalogueView
`ItemCatalogueView` — это класс, расширяющий `ItemView`, предназначен для отображения товаров в каталоге. Он добавляет функциональность установки категории и изображения, а также обработку события выбора товара при нажатии на карточку. Обеспечивает отображение информации о товаре, включая уникальный идентификатор, категорию и изображение.
Поля:
- `_id`: Уникальный идентификатор элемента каталога.
- `_category`: Элемент для отображения категории товара.
- `_image`: Изображение товара.

Методы:
- `render(itemData: IItem): HTMLElement`: Наполняет карточку данными о товаре (заголовок, цена, категория, изображение).
- `deleteItem(): void`: Удаляет карточку товара из DOM.

Сеттеры:
- `image`: Устанавливает изображение товара с использованием пути из CDN.
- `category`: Устанавливает категорию товара и изменяет её стили в зависимости от типа категории.

Обработчики событий:
- Нажатие на карточку вызывает событие `item:select`, передавая текущий товар.

### Слой взаимодействия

#### Класс ShopApi

`ShopApi` реализует клиент для взаимодействия с API магазина. Он использует интерфейс `IApi` для выполнения HTTP-запросов к серверу. Основная задача данного класса — абстрагировать детали работы с API и предоставить методы для получения данных о товарах.

Методы:
`getItems(): Promise<IItem[]>`
  - Выполняет запрос к API для получения списка всех товаров. Он делает GET-запрос к эндпоинту `/product/` и ожидает, что сервер вернет список товаров в формате `IItemsList`.
  Возвращаемое значение: Промис, который разрешается в массив объектов типа `IItem`.
`getItem(itemId: string): Promise<IItem>`
  - Принимает идентификатор товара и выполняет GET-запрос по эндпоинту `/product/${itemId}` для получения деталей конкретного товара. Он ожидает, что сервер вернет объект, соответствующий типу `IItem`.
  Возвращаемое значение: Промис, который разрешается в объект типа `IItem`.

В файле `index.ts` находится код необходимый для взаимосвязи отображения и данных: необходимые шаблоны HTML элементов, экземпляры классов и методы генерирующие события с помощью брокера событий.

