export interface IItem {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
  index ?: number;
}

export interface IItemsList {
  items: IItem[];
  total: number;
}

export interface IItemsData {
  items: IItem[];
  preview: string|null;
  basket: IItem[];
  addItem(itemId: string): void;
  getItem(itemId: string): IItem;
  deleteItem(id: string): void;
}

export interface IOrderData {
  payment: string;
  address: string;
  email: string;
  phone: string;
}

export interface IServerOrderData {
  payment: string;
  address: string;
  email: string;
  phone: string;
  total: number;
  items:string[];
}

export interface IOrderResult {
  id: string;
  total: number|null;
}

export interface IRequestError {
  error: string;
}

export type IFormErrors = Partial<Record<keyof IOrderData, string>>;
