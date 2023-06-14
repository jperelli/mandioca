type date = string;

export interface Product {
  barcode: string;
  name: string;
  image: string;
  brands: string;
  categories: string;
}

export interface StockRecord {
  id: string;
  executedAt: date;
  code: string;
  code_format: string;
  quantity: number;

  // if product is loaded
  product?: Product;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: Array<ShoppingListItem>;
}

export interface ShoppingListItem {
  barcode: string;
  quantity: number;
  done: boolean;

  // if product is loaded
  product?: Product;
}
