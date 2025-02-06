import { IItem, IOrderData, IFormErrors } from "../types";
import { IEvents } from "./base/events";
import { IItemsData, IItemsList } from "../types";

export class ModelData implements IItemsData {
  protected _items: IItem[];
  protected _preview: string|null;
  protected events: IEvents;
  protected _basket: IItem[] = [];

  constructor(events: IEvents){
    this.events = events;
  }

  set items(items:IItem[]){
    this._items = items;
    this.events.emit('cardsList:changed');
  }

  get items(){
    return this._items;
  }

  set preview(itemId: string|null){
    if(!itemId){
      this._preview = null;
      return;
    }
    const selectedItem = this.getItem(itemId);
    if(selectedItem){
      this._preview = itemId;
    }
  }

  get preview(){
    return this._preview;
  }

  get basket(){
    return this._basket;
  }

  getItem(itemId: string){
    return this._items.find((item)=>item.id===itemId)
  };

  checkInbasket(itemId:string){
   return this._basket.some((item)=>item.id===itemId)
  }

  addItem(itemId: string){
    if(!this.checkInbasket(itemId)){
      this._basket.push(this.getItem(itemId));
      this.updateIndex(this._basket);
      this.events.emit('basket:changed');
    }
  };

  deleteItem(itemId: string){
    if(this.checkInbasket(itemId)){
      this._basket = this._basket.filter((item)=>{
        return item.id !== itemId
      })
      this.updateIndex(this._basket);
    this.events.emit('basket:changed');
    }
  };

  updateIndex(_basket:IItem[]){
    for(let i = 0; i < this._basket.length;i++){
      this._basket[i].index = i+1;
    }
  }

  getTotal() {
    return this._basket.length;
  }

  getSum(){
    return this._basket.reduce((total, item)=>total + item.price, 0);
  }

  getIdList() {
    return this._basket.map((item) => item.id);
  }

  resetBasket() {
    this._basket = [];
    this.events.emit('basket:changed');
  }
}

export class OrderData implements IOrderData{
  protected _payment: string ="";
  protected _address: string ="";
  protected _email: string ="";
  protected _phone: string ="";
  protected events: IEvents;
  formErrors:IFormErrors = {};

  constructor(events: IEvents){
    this.events = events;
  }

  getData(){
    return {
      payment: this._payment,
      address: this._address,
      email: this._email,
      phone: this._phone
    }
  }

  setPaymentFields(field: keyof IOrderData, value: string) {
    this[field] = value
    this.validatePaymentForm()
  }

  setContactFields(field: keyof IOrderData, value: string) {
    this[field] = value
    this.validateContactForm()
  }

  set payment(inputPayment:string){
    this._payment = inputPayment;
  }
  get payment(){
    return this._payment
  }
  set address(inputAddress:string){
    this._address = inputAddress;
  }
  get address(){
    return this._address
  }
  set email(inputEmail:string){
    this._email = inputEmail;
  }
  get email(){
    return this._email
  }
  set phone(inputPhone:string){
    this._phone = inputPhone;
  }
  get phone(){
    return this._phone
  }

  validatePaymentForm(){
    const errors: typeof this.formErrors = {};

    if (!this.payment) {
        errors.payment = "Выберите тип оплаты";
    }

    if (!this.address) {
        errors.address = "Заполните поле адреса";
    }

    this.formErrors = errors;

    // Генерируем событие и передаем ошибки (только те, что не пустые)
    const errorMessages = [errors.address, errors.payment].filter((message) => message); // Убираем пустые строки
    this.events.emit('formErrorsPayment:change', {
        valid: errorMessages.length === 0,
        errors: errorMessages
    });

    return Object.keys(errors).length === 0;
  }

  validateContactForm(){
    const errors: typeof this.formErrors = {};

    if (!this.phone) {
        errors.phone = "Заполните поле телефона";
    }

    if (!this.email) {
        errors.email = "Заполните поле email";
    }

    this.formErrors = errors;
    const errorMessages = [errors.phone, errors.email].filter((message) => message); // Убираем пустые строки
    this.events.emit('formErrorsContact:change', {
        valid: errorMessages.length === 0,
        errors: errorMessages
    });

    return Object.keys(errors).length === 0;
}

  resetOrder() {
    this.payment = ''
    this.address = ''
    this.email = ''
    this.phone = ''
}
}

