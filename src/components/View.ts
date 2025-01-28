import { IItem } from "../types";
import { CDN_URL } from "../utils/constants";
import { IEvents } from "./base/events";
import { Component } from "./Component";

// Родительский класс для карточек товара
export class ItemView extends Component<IItem> {
  protected events: IEvents;
  protected _title: HTMLElement;
  protected _price: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
    this._title = this.getElement('.card__title');
    this._price = this.getElement('.card__price');
  }

  render(itemData: IItem): HTMLElement {
    const { title, price } = itemData;
    if (title) this.title = title;
    this.price = price ?? null;
    return this.container;
  }

  set title(itemTitle: string) {
    this.setText(this._title, itemTitle);
  }

  set price(itemPrice: number | null) {
    this.setText(this._price, itemPrice ? `${itemPrice} синапсов` : "Бесценно");
  }

  protected getElement(selector: string): HTMLElement {
    const element = this.container.querySelector(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    return element as HTMLElement;
  }
}

interface ICatalog {
  basketCounter: HTMLElement;
  basketButton: HTMLElement;
  gallery:HTMLElement[];
  locked: boolean;
}

// Класс страницы каталога
export class PageCatalog extends Component<ICatalog> {
  private _basketCounter: HTMLElement;
  private _gallery: HTMLElement;
  private _basketButton: HTMLElement;
  private events: IEvents;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
    this._basketButton = this.getElement('.header__basket');
    this._basketCounter = this.getElement('.header__basket-counter');
    this._gallery = this.getElement('.gallery');

    this._basketButton.addEventListener('click', () => {
      this.events.emit('basket:open', { page: this });
    });
  }

  set basketCounter(count: number) {
    this.setText(this._basketCounter, count);
  }

  set gallery(items: HTMLElement[]) {
    this._gallery.replaceChildren(...items);
  }

  render(data: Partial<ICatalog>): HTMLElement {
    if (data.gallery) {
      this.gallery = data.gallery;
    }
    if (data.basketCounter !== undefined) {
      this.basketCounter = Number(data.basketCounter);
    }
    return this.container;
  }
}

// Класс для карточек в корзине
export class ItemBasketView extends ItemView {
  private _id: string;
  private _index: HTMLElement;
  private _button: HTMLButtonElement;

  constructor(container: HTMLTemplateElement, events: IEvents) {
    super(container, events);
    this._index = this.getElement('.basket__item-index');
    this._button = this.getElement('.basket__item-delete') as HTMLButtonElement;

    this._button.addEventListener('click', () => {
      this.events.emit('item:remove', { item: this });
    });
  }

  render(itemData: IItem): HTMLElement {
    const { id, index } = itemData;
    this._id = id;
    if (index !== undefined) this.index = index;
    return super.render(itemData);
  }

  get id(): string {
    return this._id;
  }

  set index(itemIndex: number) {
    this.setText(this._index, itemIndex);
  }

  deleteItem(): void {
    this.container.remove();
  }
}

// Класс для карточки в каталоге
export class ItemCatalogueView extends ItemView {
  private _id: string;
  private _category: HTMLElement;
  private _image: HTMLImageElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this._category = this.getElement('.card__category');
    this._image = this.getElement('.card__image') as HTMLImageElement;

    this.container.addEventListener('click', () => {
      this.events.emit('item:select', { item: this });
    });
  }

  render(itemData: IItem): HTMLElement {
    const { id, image, category } = itemData;
    this._id = id;
    if (image) this.image = image;
    if (category) this.category = category;
    return super.render(itemData);
  }

  get id(): string {
    return this._id;
  }

  set image(itemImage: string) {
    this.setImage(this._image, `${CDN_URL}${itemImage}`, this._title.textContent || "Image");
  }

  set category(itemCategory: string) {
    const categoryClasses: { [key: string]: string } = {
      "софт-скил": "soft",
      "хард-скил": "hard",
      "другое": "other",
      "дополнительное": "additional",
      "кнопка": "button",
    };
    this._category.className = 'card__category';
    this._category.classList.add(`card__category_${categoryClasses[itemCategory] || "unknown"}`);
    this.setText(this._category, itemCategory);
  }

  deleteItem(): void {
    this.container.remove();
  }
}
//апарварар
