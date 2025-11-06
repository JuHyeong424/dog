import { ProductCategories } from "@/lib/product-categorizer";

export interface Product {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  categories: ProductCategories; // 이 부분은 이미 있지만, ProductCategories의 내용이 변경되었습니다.
}
