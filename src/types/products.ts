import { ProductCategories } from "@/lib/product-categorizer";

export interface Product {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  categories: ProductCategories;
}
