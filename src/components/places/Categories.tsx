"use client";

import {JSX} from "react";

export interface Category {
  label: string;
  query: string;
  color: string;
  icon: JSX.Element;
}

interface CategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (query: string) => void;
}

export default function Categories({ categories, selectedCategory, onSelectCategory }: CategoriesProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border-b">
      <span className="text-sm font-semibold mr-2">카테고리:</span>
      {categories.map((category) => (
        <button
          key={category.query}
          onClick={() => onSelectCategory(category.query)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition-colors ${
            selectedCategory === category.query
              ? 'text-white' // 선택된 버튼 스타일
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // 선택되지 않은 버튼 스타일
          }`}
          // 선택된 버튼의 배경색을 카테고리 색상과 동기화
          style={{
            backgroundColor: selectedCategory === category.query ? category.color : undefined
          }}
        >
          {category.icon}
          {category.label}
        </button>
      ))}
    </div>
  );
}
