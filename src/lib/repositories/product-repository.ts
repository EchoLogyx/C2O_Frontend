import { Product } from "@/types";
import productsData from "@/data/products.json";

// Repository interface — swap this implementation for API/DB later
export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  getByCategory(category: string): Promise<Product[]>;
  getByTier(tier: string): Promise<Product[]>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  toggleActive(id: string): Promise<Product>;
  search(query: string): Promise<Product[]>;
}

class ProductRepository implements IProductRepository {
  private products: Product[] = productsData as Product[];

  async getAll(): Promise<Product[]> {
    return this.products;
  }

  async getById(id: string): Promise<Product | undefined> {
    return this.products.find((p) => p.id === id);
  }

  async getByCategory(category: string): Promise<Product[]> {
    return this.products.filter((p) => p.category === category);
  }

  async getByTier(tier: string): Promise<Product[]> {
    return this.products.filter((p) => p.tier === tier);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Product ${id} not found`);
    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  async toggleActive(id: string): Promise<Product> {
    const product = await this.getById(id);
    if (!product) throw new Error(`Product ${id} not found`);
    return this.update(id, { active: !product.active });
  }

  async search(query: string): Promise<Product[]> {
    const q = query.toLowerCase();
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    );
  }
}

export const productRepository = new ProductRepository();
