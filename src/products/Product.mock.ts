import { ProductEntity } from './Product.entity';

export const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<ProductEntity[]> {
    return [];
  },

  async findOne(): Promise<ProductEntity | null> {
    return null;
  },
};
