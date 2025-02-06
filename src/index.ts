import './scss/styles.scss';
import { ModelData, OrderData } from './components/Model';
import { Api } from './components/base/api';
import { IApi, ShopApi } from './components/ShopApi';
import { EventEmitter } from './components/base/events';
import { IFormErrors, IOrderData, IOrderResult } from './types';
import { API_URL, settings } from './utils/constants';
import { cloneTemplate } from './utils/utils';
import { PageCatalog, ItemPreview, ItemCatalogueView, ModalWindow, ItemBasketView, Basket, ContactForm, PaymentForm, Success } from './components/View';

//шаблоны
const previewItemTemplate:HTMLTemplateElement = document.getElementById('card-preview') as HTMLTemplateElement;
const basketItemTemplate:HTMLTemplateElement = document.getElementById('card-basket') as HTMLTemplateElement;
const catalogItemTemplate:HTMLTemplateElement = document.getElementById('card-catalog') as HTMLTemplateElement;
const basketTemplate: HTMLTemplateElement = document.getElementById('basket') as HTMLTemplateElement;
const contactFormTemplate: HTMLTemplateElement = document.getElementById('contacts') as HTMLTemplateElement;
const paymentFormTemplate: HTMLTemplateElement = document.getElementById('order') as HTMLTemplateElement;
const modalContainer = document.getElementById('modal-container');
const successTemplate = document.getElementById('success') as HTMLTemplateElement;

//экземпляры
const events = new EventEmitter();
const baseApi:IApi = new Api(API_URL, settings)
const shopApi = new ShopApi(baseApi);
const appData = new ModelData(events);
const page = new PageCatalog (document.body, events);
const modal = new ModalWindow(modalContainer, events);
const itemPreview = new ItemPreview(cloneTemplate(previewItemTemplate), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const contactForm = new ContactForm(cloneTemplate(contactFormTemplate), events);
const paymentForm = new PaymentForm(cloneTemplate(paymentFormTemplate), events);
const orderData = new OrderData(events);
const successWindow = new Success(cloneTemplate(successTemplate), events);



//получаем карточки с сервера, сохраняем в модель
shopApi.getItems().then((data)=>{
    appData.items = data;
    console.log(appData.items);
    events.emit('initialData:loaded');
    console.log('loaded');
})
.catch((err)=>{
    console.error(err);
});

events.on('initialData:loaded', ()=>{
    console.log(appData.items);
    const itemsArray = appData.items.map((item)=>{
        const itemCatalogue = new ItemCatalogueView(cloneTemplate(catalogItemTemplate), events);
        return itemCatalogue.render(item)
    });
    page.render({gallery:itemsArray});
})

events.on('modal:open', () => {
    page.locked = true;
});


events.on('modal:close', () => {
    page.locked = false;
});

//открытие модалки с карточкой
events.on('card:select', (data:{item:ItemCatalogueView})=>{
  const {item} = data;
  appData.preview = item.id;
  //console.log(appData.preview)
  modal.render({modalContent:itemPreview.render(appData.getItem(appData.preview))});
});

//открытие корзины
events.on('basket:open', ()=>{
    const itemsArray = appData.basket.map((item)=>{
        const itemBasket = new ItemBasketView(cloneTemplate(basketItemTemplate), events);
        return itemBasket.render(item);
    })
    modal.render({modalContent:basket.render({items:itemsArray})});
    if(appData.basket.length===0){
        basket.blockButton();
    }else{
        basket.unblockButton();
    }
});


//проверка кнопки и установка состояния
events.on('preview:ready', (data: { item: ItemPreview }) => {
  const { item } = data;
  const itemData = appData.getItem(item.id);
  const isInBasket = appData.checkInbasket(item.id);
  item.updateButtonText(isInBasket, itemData.price === null);
});

events.on('card:toggle', (data: { item: ItemPreview }) => {
  const { item } = data;
  const isInBasket = appData.checkInbasket(item.id);
  if (isInBasket) {
    appData.deleteItem(item.id);
    events.emit('card:removed', { item: item });
  } else {
    appData.addItem(item.id);
    events.emit('card:added', { item: item });
  }
  item.updateButtonText(!isInBasket, appData.getItem(item.id)?.price === undefined);
  events.emit('basket:changed');
});

events.on('basket:item:remove', (data: { item: ItemBasketView }) => {
  const { item } = data;
  appData.deleteItem(item.id);
  if (appData.basket.length === 0) {
    basket.clearItems();
    basket.blockButton();
  } else {
    const updatedItems = appData.basket.map((basketItemData) => {
      const basketItem = new ItemBasketView(cloneTemplate(basketItemTemplate), events);
      return basketItem.render(basketItemData);
    });
    basket.items = updatedItems;
    basket.unblockButton();
  }
  events.emit('basket:changed');
});

//обновление корзины
events.on('basket:changed', ()=>{
    page.basketCounter = appData.getTotal();
    basket.total = appData.getSum();
});

//события форм заказа
//открытие формы оплаты
events.on('order:open', ()=>{
    modal.render({modalContent:paymentForm.render({valid: false, errors: [], address: '', payment: ''})});
 });

//валидация
events.on(/^order\..*:input/, (data: { field: keyof IOrderData; value: string }) => {
    const { field, value } = data
    orderData.setPaymentFields(field, value);
});

events.on('formErrorsPayment:change', (formErrors: IFormErrors)=> {
    const isEmpty = Object.keys(formErrors).length === 0
    const validation = {valid: isEmpty, errors: [formErrors.address || '', formErrors.payment || '']}
    paymentForm.render(validation)
});

//открытие формы контактов
events.on('order:submit', ()=> {
    modal.render({modalContent:contactForm.render({valid: false, errors: [], address: '', payment: ''})});
});

//валидация
events.on(/^contacts\..*:input/, (data: { field: keyof IOrderData; value: string }) => {
    const { field, value } = data
    orderData.setContactFields(field, value);
});

events.on('formErrorsContact:change', (formErrors: IFormErrors)=> {
    const isEmpty = Object.keys(formErrors).length === 0
    const validation = {valid: isEmpty, errors: [formErrors.phone || '', formErrors.email || '']}
    contactForm.render(validation)
});

events.on('formErrorsPayment:change', (validation: { valid: boolean; errors: string[] }) => {
  paymentForm.render({
      valid: validation.valid,
      errors: validation.errors
  });
});

events.on('formErrorsContact:change', (validation: { valid: boolean; errors: string[] }) => {
  contactForm.render({
      valid: validation.valid,
      errors: validation.errors
  });
});

events.on('contacts:submit', ()=>{
    const userInfo = orderData.getData();
    const total = appData.getSum();
    const items = appData.getIdList();
    const orderObj = {...userInfo, total, items};
    console.log(orderObj);
    shopApi.sendOrderData(orderObj)
    .then((response:IOrderResult)=>{
        orderData.resetOrder();
        appData.resetBasket();
        basket.basketReset();
        events.emit('basket:changed')
        modal.render({modalContent:successWindow.render({total:response.total})});
    })
    .catch((err)=>{
        console.error(err);
    });
});

events.on('success:close', ()=>{
    modal.close();
})
