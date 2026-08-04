export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  is_available: boolean;
  created_at?: string;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at'>;
