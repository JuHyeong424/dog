// 상품을 분류하기 위한 카테고리와 각 카테고리에 속하는 키워드들을 정의한 객체입니다.
const CATEGORIES = {
  food: ['사료', '간식', '캔', '우유', '영양제', '껌'],
  toy: ['장난감', '토이', '노즈워크', '공', '인형'],
  hygiene: ['샴푸', '브러쉬', '발톱깎이', '배변패드', '기저귀', '탈취제', '물티슈', '치약', '칫솔'],
  apparel: ['옷', '신발', '양말', '케이프', '악세사리'],
  walking: ['목줄', '하네스', '리드줄', '이동가방', '유모차'],
  home: ['켄넬', '집', '울타리', '방석', '쿠션', '계단', '매트', '식기'],
};

// 상품이 어떤 카테고리에 속하는지를 나타내는 데이터의 구조를 정의하는 인터페이스입니다.
// 각 카테고리는 상품 제목에서 발견된 키워드들의 배열을 값으로 가집니다.
export interface ProductCategories {
  food: string[];
  toy: string[];
  hygiene: string[];
  apparel: string[];
  walking: string[];
  home: string[];
}

/**
 * 상품 제목(title)을 분석하여 어떤 카테고리에 속하는지 판별하는 함수입니다.
 * @param {string} title - 분석할 상품의 제목 문자열
 * @returns {ProductCategories} 각 카테고리별로 제목에서 발견된 키워드 목록을 담은 객체
 */
export function categorizeProductByTitle(title: string): ProductCategories {
  // 발견된 카테고리와 키워드를 저장할 객체를 초기화합니다.
  const detectedCategories: ProductCategories = {
    food: [],
    toy: [],
    hygiene: [],
    apparel: [],
    walking: [],
    home: [],
  };

  // CATEGORIES 객체의 모든 키(카테고리명)에 대해 반복 작업을 수행합니다.
  (Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).forEach((category) => {
    // 현재 카테고리에 속한 모든 키워드에 대해 반복 작업을 수행합니다.
    CATEGORIES[category].forEach((keyword) => {
      // 만약 상품 제목(title)에 현재 키워드가 포함되어 있다면,
      if (title.includes(keyword)) {
        // detectedCategories 객체의 해당 카테고리 배열에 키워드를 추가합니다.
        detectedCategories[category].push(keyword);
      }
    });
  });

  // 최종적으로 분석된 카테고리 정보를 담은 객체를 반환합니다.
  return detectedCategories;
}
