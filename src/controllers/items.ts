import { Item } from "../types/item";

let items: Item[] = [];
let currentId = 1;

export const getItems = (): Item[] => items;

export const getItemById = (id: number): Item | undefined =>
  items.find((item) => item.id === id);

export const addItem = (name: string, quantity: number, purchased = false): Item => {
  const newItem: Item = {
    id: currentId++,
    name,
    quantity,
    purchased,
  };
  items.push(newItem);
  return newItem;
};

export const updateItem = (
  id: number,
  updates: Partial<Omit<Item, "id">>
): Item | undefined => {
  const item = getItemById(id);
  if (!item) {
    return undefined;
  }

  if (updates.name !== undefined) {
    item.name = updates.name;
  }
  if (updates.quantity !== undefined) {
    item.quantity = updates.quantity;
  }
  if (updates.purchased !== undefined) {
    item.purchased = updates.purchased;
  }

  return item;
};

export const deleteItem = (id: number): boolean => {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  items.splice(index, 1);
  return true;
};
