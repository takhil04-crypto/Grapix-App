import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IProductFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};

export type IProductTableFilters = {
  stock: string[];
  publish: string[];
};

export type IProductReviewNewForm = {
  rating: number | null;
  review: string;
  name: string;
  email: string;
};

export type IProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  helpful: number;
  avatarUrl: string;
  postedAt: IDateValue;
  isPurchased: boolean;
  attachments?: string[];
};

export type IProductItem = {
  id: string;
  name: string;
  subDescription: string;
  description: string;
  images: string[];
  coverUrl: string;
  tags: string[];
  taxes: number;
  gender: string[];
  category: string;
  newLabel: {
    enabled: boolean;
    content: string;
  };
  saleLabel: {
    enabled: boolean;
    content: string;
  };
  publish: string;
  createdAt: IDateValue;
  available: number;
  totalSold: number;
  totalRatings: number;
  totalReviews: number;
  inventoryType: string;
  reviews: IProductReview[];
  ratings: {
    name: string;
    starCount: number;
    reviewCount: number;
  }[];
  properties: {
    color: string;
    storage: string;
    category: string;
    sku: string;
    code: string;
    quantity: number;
  };
  pricing: {
    price: number;
    priceSale: number | null;
  };
  publish_status?: 'published' | 'draft';
};
