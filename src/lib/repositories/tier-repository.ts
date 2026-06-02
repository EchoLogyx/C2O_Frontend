import { TierConfig } from "@/types";
import tiersData from "@/data/tiers.json";

export interface ITierRepository {
  getAll(): Promise<TierConfig[]>;
  getById(id: string): Promise<TierConfig | undefined>;
  getActive(): Promise<TierConfig[]>;
  toggleActive(id: string): Promise<TierConfig>;
  addProduct(tierId: string, productId: string): Promise<TierConfig>;
  removeProduct(tierId: string, productId: string): Promise<TierConfig>;
  updateOrder(id: string, displayOrder: number): Promise<TierConfig>;
  update(id: string, data: Partial<TierConfig>): Promise<TierConfig>;
}

class TierRepository implements ITierRepository {
  private tiers: TierConfig[] = tiersData as TierConfig[];

  async getAll(): Promise<TierConfig[]> {
    return [...this.tiers].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getById(id: string): Promise<TierConfig | undefined> {
    return this.tiers.find((t) => t.id === id);
  }

  async getActive(): Promise<TierConfig[]> {
    return this.tiers.filter((t) => t.active);
  }

  async toggleActive(id: string): Promise<TierConfig> {
    const tier = await this.getById(id);
    if (!tier) throw new Error(`Tier ${id} not found`);
    return this.update(id, { active: !tier.active });
  }

  async addProduct(tierId: string, productId: string): Promise<TierConfig> {
    const tier = await this.getById(tierId);
    if (!tier) throw new Error(`Tier ${tierId} not found`);
    if (!tier.productIds.includes(productId)) {
      return this.update(tierId, { productIds: [...tier.productIds, productId] });
    }
    return tier;
  }

  async removeProduct(tierId: string, productId: string): Promise<TierConfig> {
    const tier = await this.getById(tierId);
    if (!tier) throw new Error(`Tier ${tierId} not found`);
    return this.update(tierId, {
      productIds: tier.productIds.filter((id) => id !== productId),
    });
  }

  async updateOrder(id: string, displayOrder: number): Promise<TierConfig> {
    return this.update(id, { displayOrder });
  }

  async update(id: string, data: Partial<TierConfig>): Promise<TierConfig> {
    const index = this.tiers.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Tier ${id} not found`);
    this.tiers[index] = { ...this.tiers[index], ...data };
    return this.tiers[index];
  }
}

export const tierRepository = new TierRepository();
