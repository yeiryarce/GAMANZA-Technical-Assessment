import { api } from "./client";
import type { ProductsResponse, Product } from "./types";

// get list of products
export async function getProducts(limit = 10, skip = 0): Promise<ProductsResponse> {
  const res = await api.get<ProductsResponse>(`/products?limit=${limit}&skip=${skip}`);
  return res.data;
}

// get product by id
export async function getProduct(id: number): Promise<Product> {
  const res = await api.get<Product>(`/products/${id}`);
  return res.data;
}
// gupdate product 
export async function updateProduct(
  id: number,
  payload: Partial<Product>
): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, payload);
  return data;} 
  // Create product
export async function createProduct(
  payload: Partial<Product>
): Promise<Product> {
  // DummyJSON create endpoint
  const { data } = await api.post<Product>('/products/add', payload);
  return data;
}
// Get list of categories
export async function getCategories(): Promise<string[]> {
  const { data } = await api.get<string[]>('/products/categories');
  return data;
}

// Search products by query (server-side)
export async function searchProducts(
  q: string,
  limit = 10,
  skip = 0
): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>(
    `/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`
  );
  return data;
}

// Get products by category (server-side)
export async function getProductsByCategory(
  category: string,
  limit = 10,
  skip = 0
): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>(
    `/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`
  );
  return data;
}
