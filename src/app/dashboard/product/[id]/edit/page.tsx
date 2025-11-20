import axios, { endpoints } from 'src/utils/axios';
import type { IProductItem } from 'src/types/product';
import { CONFIG } from 'src/config-global';

import { ProductEditView } from 'src/sections/product/view';
import { PRODUCT_CATEGORY_GROUP_OPTIONS } from 'src/_mock';

// ----------------------------------------------------------------------

export const metadata = { title: `Product edit | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
    const { id } = params;
    console.log('Product ID from params:', id);
    let currentProduct: IProductItem | undefined = undefined;
    try {
      const res = await fetch(`http://localhost:8082/api/products/${id}`, { cache: 'no-store' });
      console.log('Fetch response for product:', res);
      if (res.ok) {
        const product = await res.json();
         currentProduct = {
            name: product.product_name || '',
            description: product.content || '',
            subDescription: product.sub_description || '',
            images: product.images || [],
            coverUrl: product.coverUrl || (product.images && product.images[0]) || '',
            tags: product.tags || [],
            taxes: product.taxes || 0,
            gender: product.gender || [],
            category: product.category || PRODUCT_CATEGORY_GROUP_OPTIONS[0].classify[1],
            newLabel: product.newLabel || { enabled: false, content: '' },
            saleLabel: product.saleLabel || { enabled: false, content: '' },
            id: product.id,
            publish: product.publish_status,
            createdAt: product.created_at,
            available: product.available ?? true,
            totalSold: product.totalSold ?? 0,
            totalRatings: product.totalRatings ?? 0,
            inventoryType: product.inventoryType ?? 'in_stock',
            totalReviews: product.totalReviews ?? 0,
            reviews: product.reviews ?? [],
            ratings: product.ratings ?? [],
            // Updated structure:
            properties: {
              color: product.colors?.[0] || '',
              storage: product.sizes?.[0] || '',
              category: product.category,
              sku: product.sku,
              code: product.code,
              quantity: product.quantity,
            },
            pricing: {
              price: product.price,
              priceSale: product.priceSale,
            },
          };
      } else {
        console.error('Failed to fetch product:', res.status);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }

    return <ProductEditView product={currentProduct} />;
}

// ----------------------------------------------------------------------

async function getProduct(id: string) {
  const URL = id ? `${endpoints.product.details}?productId=${id}` : '';

  const res = await axios.get(URL);

  return res.data;
}

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    const res = await axios.get(endpoints.product.list);

    return res.data.products.map((product: { id: string }) => ({ id: product.id }));
  }
  return [];
}
