import './scss/styles.scss';
import { ModelData } from './components/Model';
import { Api } from './components/base/api';
import { IApi, ShopApi } from './components/ShopApi';
import { EventEmitter } from './components/base/events';
import { ItemCatalogueView} from './components/View';
import { API_URL, settings } from './utils/constants';
import { cloneTemplate } from './utils/utils';
import { PageCatalog } from './components/View';

//шаблоны
const catalogItemTemplate:HTMLTemplateElement = document.getElementById('card-catalog') as HTMLTemplateElement;
const modalContainer = document.getElementById('modal-container');


//экземпляры
const events = new EventEmitter();
const baseApi:IApi = new Api(API_URL, settings)
const shopApi = new ShopApi(baseApi);
const appData = new ModelData(events);
const page = new PageCatalog (document.body, events);

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

