import { IItem } from "../types";
import { IEvents } from "./base/events";
import { IItemsData, IItemsList } from "../types";

export class ModelData implements IItemsData {
  protected _items: IItem[];
  protected _preview: string|null;
  protected events: IEvents;
  protected _basket: IItem[] = [];
  total: number;

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
      this.events.emit('basket:changed');
    }
  };

  deleteItem(itemId: string){
    if(this.checkInbasket(itemId)){
      this._basket = this._basket.filter((item)=>{
        return item.id !== itemId
      })
    this.events.emit('basket:changed');
    }
  };
}
