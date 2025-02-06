import { IItem, IFormErrors } from "../types";
import { CDN_URL } from "../utils/constants";
import { IEvents } from "./base/events";
import { Component } from "./Component";
import { ensureElement, ensureAllElements } from "../utils/utils";

//родительский класс для всех карточек товара
export class ItemView extends Component<IItem>{
  protected _id: string;
  protected _title: HTMLElement;
	protected _price: HTMLElement;
  protected element: HTMLElement;
  protected events: IEvents;

  constructor(container:HTMLElement, events:IEvents){
    super(container);
    this.events = events;
    this.element = container;

    this._title = this.element.querySelector('.card__title');
    this._price = this.element.querySelector('.card__price');
  }

  render(itemData:IItem){
    const {title, price, ...otherItemData} = itemData;
    if (title) this.title = title;
    if (price) this.price = price;
    Object.assign(this, otherItemData);
    return this.element;
  }

  set id(itemId:string){
    this._id = itemId;
  }

  get id(){
    return this._id;
  }

  set title(itemTitle: string){
    this.setText(this._title, itemTitle.toString());
  }

  set price(itemPrice:number|null){
    itemPrice === null ? this.setText(this._price, "Бесценно") : this.setText(this._price, `${itemPrice.toString()} синапсов`);
  }

}

interface ICatalog {
  basketCounter: HTMLElement;
  basketButton: HTMLElement;
  gallery:HTMLElement[];
  locked: boolean;
}

export class PageCatalog extends Component<ICatalog> {
  protected _basketCounter: HTMLElement;
  protected _gallery: HTMLElement;
  protected _basketButton: HTMLElement;
  protected _wrapper: HTMLElement;
  events: IEvents;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
    this._basketButton = container.querySelector('.header__basket');
    this._basketCounter = container.querySelector('.header__basket-counter');
    this._gallery = container.querySelector('.gallery');
    this._wrapper = container.querySelector('.page__wrapper');
    this._basketButton.addEventListener('click', () => {
      this.events.emit('basket:open', { item: this });
      console.log('basket:open', { item: this });
    });
  }

  set basketCounter(count: number) {
    this.setText(this._basketCounter, count);
  }

  set gallery(items: HTMLElement[]) {
    this._gallery.replaceChildren(...items);
  }

  set locked(lock: boolean) {
    if (lock) {
      this._wrapper.classList.add('page__wrapper_locked');
    } else {
      this._wrapper.classList.remove('page__wrapper_locked');
    }
  }

  public get galleryItems(): HTMLElement[] {
    return Array.from(this._gallery.children) as HTMLElement[];
  }
}

//класс для карточек в корзине
export class ItemBasketView extends ItemView{
	protected _button: HTMLButtonElement;
  protected _index: HTMLElement;

  constructor(container:HTMLTemplateElement, events:IEvents){
    super(container, events);

    this._button = this.element.querySelector('.basket__item-delete');
    this._index = this.element.querySelector('.basket__item-index');

    this._button.addEventListener('click', () => {
      this.events.emit('basket:item:remove', { item: this });
    });
  }

  set index(itemIndex:number){
    this.setText(this._index, itemIndex.toString());
  }
}

//класс для карточки в главном списке
export class ItemCatalogueView extends ItemView{
	protected _button: HTMLButtonElement;
  protected _category: HTMLElement;
  protected _image: HTMLImageElement;

  constructor(container:HTMLElement, events:IEvents){
    super(container, events)

    this._button = this.element.querySelector('.card');
    this._image = this.element.querySelector('.card__image');
    this._category = this.element.querySelector('.card__category');

    container.addEventListener('click', ()=>{
      this.events.emit('card:select', {item:this});
      console.log('card:select', {item:this});
    });
  }

  set image(itemImage:string){
    this.setImage(this._image, `${CDN_URL}` + `${itemImage}`, this.title);
  }

  set category(itemCategory:string){
    const categoryBaseclass = 'card__category';
    this._category.className = categoryBaseclass;
    this.setText(this._category, itemCategory);
    const categories: {[key:string]:string} = {
      "софт-скил":"soft",
      "хард-скил":"hard",
      "другое":"other",
      "дополнительное":"additional",
      "кнопка":"button"
    };
    this.toggleClass(this._category, `card__category_${categories[itemCategory]}`, true)
  }
}

interface IModalWindow {
  modalContent: HTMLElement;
}

export class ModalWindow extends Component<IModalWindow> {
  protected events: IEvents;
  protected _button: HTMLButtonElement;
  protected _modalContent: HTMLElement;

  constructor(container:HTMLElement, events:IEvents){
    super(container);
    this.events = events;
    this._button = container.querySelector('.modal__close');
    this._modalContent = container.querySelector('.modal__content');

    this.container.addEventListener('click', this.close.bind(this));
    this._button.addEventListener('click', this.close.bind(this));
    this.container.firstElementChild.addEventListener('click', (event) => event.stopPropagation());
  }

  set modalContent(content:HTMLElement){
    this._modalContent.replaceChildren(content);
  }

  protected toggleModal(modalState:boolean){
    this.toggleClass(this.container, 'modal_active', modalState);
  }

  open(){
    this.toggleModal(true);
    this.events.emit('modal:open');
  }

  close(){
    this.toggleModal(false);
    this.modalContent = null;
    this.events.emit('modal:close');
  }

  render(data?:IModalWindow): HTMLElement {
    super.render(data);
    this.open();
    return this.container;
  }
}


export class ItemPreview extends ItemCatalogueView{
  protected _description: HTMLElement;

  constructor(container:HTMLElement, events:IEvents){
    super(container, events)

    this._button = this.element.querySelector('.card__button');
    this._description = this.element.querySelector('.card__text');

    this._button.addEventListener('click', () => {
      this.events.emit('card:toggle', { item: this });
    });
    this._button.addEventListener('click', (event) => event.stopPropagation());
  }

  render(itemData:IItem){
    const {id, title, price, image, category, ...otherItemData} = itemData;
    if (id) this.id = id;
    if (title) this.title = title;
    if(price){
      this.price = price;
    } else {
      this.price = null;
    }
    if (image) this.image = image;
    if (category) this.category = category;
    Object.assign(this, otherItemData);
    this.events.emit('preview:ready', {item:this});
    return this.element;
  }

  set description(itemDescription:string){
    this.setText(this._description, itemDescription);
  }

  updateButtonText(isInBasket: boolean, isPriceless: boolean){
    if (isPriceless) {
        this.setText(this._button, "Нельзя добавить");
        this.blockButton();
    } else if (isInBasket) {
        this.setText(this._button, "Удалить из корзины");
        this.unblockButton();
    } else {
        this.setText(this._button, "В корзину");
        this.unblockButton();
    }
  }

  blockButton(){
    this.setDisabled(this._button, true);
  }

  unblockButton(){
    this.setDisabled(this._button, false);
  }
}


interface IBasket {
  items: HTMLElement[];
  basketPriceTotal: number;
}

export class Basket extends Component<IBasket>{
  protected _basketListContainer: HTMLUListElement;
  protected _basketPriceTotal: HTMLElement;
  protected _button:HTMLButtonElement;
  protected events:IEvents;

  constructor(container:HTMLElement, events:IEvents){
    super(container);
    this.events = events;
    this.items = [];

    this._basketListContainer = ensureElement<HTMLUListElement>('.basket__list', this.container);
    this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    this._basketPriceTotal = ensureElement<HTMLElement>('.basket__price', this.container);
    this._button.addEventListener('click', ()=>{
      this.events.emit('order:open');
    });
  }

  set total(totalPrice:number){
    this.setText(this._basketPriceTotal, `${totalPrice} синапсов`)
  }

  set items(basketItemsArray:HTMLElement[]){
    if(basketItemsArray.length){
      this._basketListContainer.replaceChildren(...basketItemsArray);
    }
  }
  clearItems(): void {
    this._basketListContainer.innerHTML = '';
  }
  blockButton(){
    this.setDisabled(this._button, true);
  }

  unblockButton(){
    this.setDisabled(this._button, false);
  }

  basketReset(){
    this._basketListContainer.replaceChildren();
  }

}

interface IForm extends IFormErrors{
  valid:boolean;
  errors:string[];
}

export abstract class Form<T> extends Component<IForm>{
  protected _submitButton:HTMLButtonElement;
  protected _formErrorContainer: HTMLSpanElement;
  protected events: IEvents;
  protected formName: string;
  protected _handleSubmit: Function;

  constructor(container:HTMLFormElement, events:IEvents){
    super(container);
    this.events = events;
    this._submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', container);
    this._formErrorContainer = ensureElement<HTMLSpanElement>('.form__errors', container);
    this.formName = this.container.getAttribute('name');

    this.container.addEventListener('submit', (evt:Event)=>{
      evt.preventDefault();
      this.events.emit(`${this.formName}:submit`);
    });

    this.container.addEventListener('input', (evt:InputEvent)=>{
      const target = evt.target as HTMLInputElement;
      const field = target.name;
      const value = target.value;
      this.events.emit(`${this.formName}.${field}:input`, {field, value});
      console.log(`${this.formName}.${field}:input`, {field, value})
    })
  }

  set valid(isValid:boolean){
    this.setDisabled(this._submitButton, !isValid);
  }

  get form(){
    return this.container;
  }

  set errors(errorMessages:string[]){
    this.setText(this._formErrorContainer, errorMessages);
  }

  protected onInput(field: keyof T, value: string){
    this.events.emit(`${this.formName}.${String(field)}:change`, {
      field,
      value
    });
  }

  render(data:IForm){
    const {valid, errors} = data;
    super.render({valid, errors});
    return this.container;
  }

}

interface IContactForm {
  phone: string
  email: string
}

export class ContactForm extends Form<IContactForm>{
  constructor(container:HTMLFormElement, events:IEvents){
    super(container, events);
    this._submitButton.addEventListener('click', ()=>{
      this.events.emit('contacts:submit');
      console.log('contacts:submit')
    })
  }
}

interface IPaymentForm {
  address: string
  payment: string
}

export class PaymentForm extends Form<IPaymentForm> {
  protected _paymentButtons:HTMLButtonElement[];

  constructor(container:HTMLFormElement, events:IEvents){
    super(container, events);

    this._paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', container);
    console.log(this._paymentButtons)

    this._paymentButtons.forEach((item) => {
      item.addEventListener('click', ()=>{
        this._paymentButtons.forEach((button)=>{
          this.toggleClass(button, 'button_alt-active', false);
        })

        this.toggleClass(item, 'button_alt-active', true);
        events.emit(`${this.formName}.payment:input`, {
          field:'payment',
          value:item.name
        })
        console.log(`${this.formName}.payment:input`, {field:'payment',value:item.name})
      })
    });
  }
}

interface ISuccess{
  total:number;
}

export class Success extends Component<ISuccess>{
  protected _totalPrice:HTMLElement;
  protected _button:HTMLButtonElement;

  constructor(container:HTMLElement, events:IEvents){
    super(container);
    this._totalPrice = ensureElement<HTMLElement>('.order-success__description', container)
    this._button = ensureElement<HTMLButtonElement>('.order-success__close', container);
    this._button.addEventListener('click', ()=>{
      events.emit('success:close');
    })
  }

  set total(total:number){
    this.setText(this._totalPrice, `Списано ${total} синапсов`);
  }
}
