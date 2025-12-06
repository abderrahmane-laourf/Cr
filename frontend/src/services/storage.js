import { initialData } from '../data/initialData';

const STORAGE_KEY_PREFIX = 'crm_app_';

const getCollectionKey = (collection) => `${STORAGE_KEY_PREFIX}${collection}`;

/**
 * Initialize storage with default data if empty
 */
export const initializeStorage = () => {
  Object.keys(initialData).forEach(collection => {
    const key = getCollectionKey(collection);
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(initialData[collection]));
    }
  });
};

// Initialize immediately
initializeStorage();

export const storageService = {
  get(collection) {
    const key = getCollectionKey(collection);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  set(collection, data) {
    const key = getCollectionKey(collection);
    localStorage.setItem(key, JSON.stringify(data));
  },

  getAll(collection) {
    return this.get(collection);
  },

  getById(collection, id) {
    const items = this.get(collection);
    return items.find(item => item.id == id); // Loose equality to match both string/number IDs
  },

  add(collection, item) {
    const items = this.get(collection);
    const newItem = { ...item, id: item.id || Date.now().toString() };
    items.push(newItem);
    this.set(collection, items);
    return newItem;
  },

  update(collection, id, updates) {
    const items = this.get(collection);
    const index = items.findIndex(item => item.id == id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.set(collection, items);
      return items[index];
    }
    throw new Error(`Item with id ${id} not found in ${collection}`);
  },

  delete(collection, id) {
    const items = this.get(collection);
    const filtered = items.filter(item => item.id != id);
    this.set(collection, filtered);
    return { id };
  }
};
