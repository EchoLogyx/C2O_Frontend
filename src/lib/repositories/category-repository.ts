import { Category } from "@/types";
import categoriesData from "@/data/categories.json";

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | undefined>;
  getVisible(): Promise<Category[]>;
  getFeatured(): Promise<Category[]>;
  toggleVisibility(id: string): Promise<Category>;
  toggleFeatured(id: string): Promise<Category>;
  update(id: string, data: Partial<Category>): Promise<Category>;
}

class CategoryRepository implements ICategoryRepository {
  private categories: Category[] = categoriesData as Category[];

  async getAll(): Promise<Category[]> {
    return [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getById(id: string): Promise<Category | undefined> {
    return this.categories.find((c) => c.id === id);
  }

  async getVisible(): Promise<Category[]> {
    return this.categories.filter((c) => c.visible);
  }

  async getFeatured(): Promise<Category[]> {
    return this.categories.filter((c) => c.featured);
  }

  async toggleVisibility(id: string): Promise<Category> {
    const cat = await this.getById(id);
    if (!cat) throw new Error(`Category ${id} not found`);
    return this.update(id, { visible: !cat.visible });
  }

  async toggleFeatured(id: string): Promise<Category> {
    const cat = await this.getById(id);
    if (!cat) throw new Error(`Category ${id} not found`);
    return this.update(id, { featured: !cat.featured });
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Category ${id} not found`);
    this.categories[index] = { ...this.categories[index], ...data };
    return this.categories[index];
  }
}

export const categoryRepository = new CategoryRepository();
