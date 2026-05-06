import { NextResponse } from 'next/server';
import { ProductService } from '../../../src/modules/products/product.service';
import { ResponseHandler } from '../../../src/utils/handler/respon.utils';

export async function GET() {
  try {
    const products = await ProductService.getAll();
    return ResponseHandler.success(products, 'Products retrieved successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to retrieve products', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = await ProductService.create(body);
    return ResponseHandler.success(newProduct, 'Product created successfully', 201);
  } catch (error) {
    return ResponseHandler.error('Failed to create product', error);
  }
}
