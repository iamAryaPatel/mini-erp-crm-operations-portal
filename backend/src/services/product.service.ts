import * as productRepo from '../repositories/product.repository';

export async function getAllProducts(params: {
  search?: string;
  category?: string;
  low_stock?: boolean;
  page: number;
  limit: number;
}) {
  const { rows, total } = await productRepo.findAll(params);
  return {
    products: rows,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function getProductById(id: string) {
  const product = await productRepo.findById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

export async function createProduct(data: Partial<productRepo.ProductRow>) {
  // Check for duplicate SKU
  if (data.sku) {
    const existing = await productRepo.findBySku(data.sku);
    if (existing) {
      throw new Error('DUPLICATE_SKU');
    }
  }
  return productRepo.create(data);
}

export async function updateProduct(id: string, data: Partial<productRepo.ProductRow>) {
  const existing = await productRepo.findById(id);
  if (!existing) {
    throw new Error('Product not found');
  }

  // Check for duplicate SKU if SKU is being changed
  if (data.sku && data.sku !== existing.sku) {
    const skuExists = await productRepo.findBySku(data.sku);
    if (skuExists) {
      throw new Error('DUPLICATE_SKU');
    }
  }

  return productRepo.update(id, data);
}

export async function getCategories() {
  return productRepo.getCategories();
}
