import { JsonHandler } from '../../infrastructure/database/json-handler';
import { Product } from './product.schema';

const productDb = new JsonHandler<Product>('products.json');

export const ProductService = {
  async getAll(): Promise<Product[]> {
    return await productDb.readAll();
  },

  async getById(id: string): Promise<Product | undefined> {
    return await productDb.findById(id);
  },

  // Mock method to seed/create product for testing
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return await productDb.insert(newProduct);
  }
};
