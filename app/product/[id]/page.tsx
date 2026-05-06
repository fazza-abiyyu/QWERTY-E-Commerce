import { notFound } from 'next/navigation';
import { ProductService } from '../../../src/modules/products/product.service';
import AddToCartForm from '../../../components/AddToCartForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await ProductService.getById(id);

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <div data-testid="product-detail-image" className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#f5f5f5]">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center py-4">
          <h1 data-testid="product-detail-name" className="text-2xl font-bold tracking-tight text-[#111] mb-2">{product.name}</h1>
          <p className="text-[15px] text-gray-400 leading-relaxed mb-10">{product.description}</p>
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
