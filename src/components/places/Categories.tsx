"use client";

import {JSX} from "react";

// 개별 카테고리의 데이터 구조를 정의하는 인터페이스입니다.
export interface Category {
  label: string;      // 버튼에 표시될 텍스트 (예: "공원/산책로")
  query: string;      // API 검색 시 사용될 실제 검색어 (예: "공원 산책로")
  color: string;      // 선택되었을 때 버튼의 배경색
  icon: JSX.Element;  // 버튼에 표시될 아이콘 컴포넌트
}

// Categories 컴포넌트가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface CategoriesProps {
  categories: Category[];             // 표시할 카테고리 객체들의 배열
  selectedCategory: string;           // 현재 선택된 카테고리의 query 값
  onSelectCategory: (query: string) => void; // 카테고리 버튼을 클릭했을 때 실행될 콜백 함수
}

// 여러 개의 카테고리 버튼을 나열하고, 사용자가 선택할 수 있도록 하는 UI 컴포넌트입니다.
export default function Categories({ categories, selectedCategory, onSelectCategory }: CategoriesProps) {
  return (
    // 카테고리 버튼들을 감싸는 flex 컨테이너입니다.
    <div className="flex flex-wrap items-center gap-3 p-4 border-b">
      <span className="text-sm font-semibold mr-2">카테고리:</span>
      {/* categories 배열을 순회하면서 각 카테고리에 대한 버튼을 생성합니다. */}
      {categories.map((category) => (
        <button
          key={category.query} // React가 각 항목을 식별하기 위한 고유한 key
          onClick={() => onSelectCategory(category.query)} // 버튼 클릭 시 부모의 onSelectCategory 함수를 호출합니다.
          // 현재 선택된 카테고리인지 여부에 따라 동적으로 클래스를 적용합니다.
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition-colors ${
            selectedCategory === category.query
              ? 'text-white' // 선택된 버튼의 텍스트 색상
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // 선택되지 않은 버튼의 스타일
          }`}
          // 선택된 버튼의 배경색을 해당 카테고리의 고유 색상으로 동적으로 설정합니다.
          style={{
            backgroundColor: selectedCategory === category.query ? category.color : undefined
          }}
        >
          {/* 카테고리 아이콘과 라벨 텍스트를 표시합니다. */}
          {category.icon}
          {category.label}
        </button>
      ))}
    </div>
  );
}
