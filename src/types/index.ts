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
  addItem(itemId: string): void;
  getItem(itemId: string): IItem;
  basket: IItem[];
  total: number;
  deleteItem(id: string): void;
}

export type TItemPreview = Pick<IItem, 'category' | 'title' | 'description' | 'image' | 'price'>;

export type TItemBasket = Pick<IItem, 'title' | 'price' | 'id'>;
