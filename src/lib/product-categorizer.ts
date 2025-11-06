// 카테고리를 상품 '종류'에 따라 재정의합니다.
const CATEGORIES = {
  food: ['사료', '간식', '캔', '우유', '영양제', '껌'],
  toy: ['장난감', '토이', '노즈워크', '공', '인형'],
  hygiene: ['샴푸', '브러쉬', '발톱깎이', '배변패드', '기저귀', '탈취제', '물티슈', '치약', '칫솔'],
  apparel: ['옷', '신발', '양말', '케이프', '악세사리'],
  walking: ['목줄', '하네스', '리드줄', '이동가방', '유모차'],
  home: ['켄넬', '집', '울타리', '방석', '쿠션', '계단', '매트', '식기'],
};

// 새로운 카테고리 타입 정의
export interface ProductCategories {
  food: string[];
  toy: string[];
  hygiene: string[];
  apparel: string[];
  walking: string[];
  home: string[];
}

// 이 함수는 수정할 필요가 없습니다. 위 CATEGORIES 정의에 따라 자동으로 동작합니다.
export function categorizeProductByTitle(title: string): ProductCategories {
  const detectedCategories: ProductCategories = {
    food: [],
    toy: [],
    hygiene: [],
    apparel: [],
    walking: [],
    home: [],
  };

  (Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).forEach((category) => {
    CATEGORIES[category].forEach((keyword) => {
      if (title.includes(keyword)) {
        detectedCategories[category].push(keyword);
      }
    });
  });

  return detectedCategories;
}
