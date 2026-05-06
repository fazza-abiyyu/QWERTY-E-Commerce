export interface ProductVariant {
  sku: string;
  name: string;
  price: number;
  stock: number;
  weight: number; // in grams
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string; // Cloudinary URL
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}
