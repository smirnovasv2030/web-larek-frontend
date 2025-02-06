import { ApiPostMethods } from "./base/api";
import { IItem, IItemsList, IServerOrderData, IOrderResult, IRequestError } from "../types";

export interface IApi {
  baseUrl: string;
  get<T>(uri: string): Promise<T>;
  post<T>(uri: string, data: object, method: ApiPostMethods): Promise<T>;
}

export class ShopApi {
  private _baseApi: IApi;

  constructor(baseApi:IApi){
    this._baseApi = baseApi;
  }

  getItems(): Promise<IItem[]> {
    return this._baseApi.get<IItemsList>(`/product/`).then((data:IItemsList)=> data.items);
  }

  getItem(itemId:string): Promise<IItem> {
    return this._baseApi.get<IItem>(`/product/${itemId}`).then((item:IItem)=> item);
  }

  sendOrderData(orderData:IServerOrderData):Promise<IOrderResult|IRequestError> {
    return this._baseApi.post<IOrderResult|IRequestError>(`/order/`, orderData, 'POST');
  }
}
