"use client";

import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

// HealthSearchBar 컴포넌트가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface HealthSearchBarProps {
  // 사용자가 검색을 실행했을 때 호출될 콜백 함수입니다.
  // 검색어를 인자로 받습니다.
  onSearch: (searchTerm: string) => void;
}

// 사용자가 검색어를 입력하고 검색을 실행할 수 있는 검색창 UI 컴포넌트입니다.
export default function HealthSearchBar({ onSearch }: HealthSearchBarProps) {
  // 입력 필드의 현재 값을 관리하기 위한 state입니다.
  const [searchTerm, setSearchTerm] = useState('');

  // 폼(form)이 제출될 때(엔터 키 또는 검색 버튼 클릭) 실행되는 이벤트 핸들러입니다.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 발생하는 페이지 새로고침을 방지합니다.

    // 입력된 검색어의 양쪽 공백을 제거했을 때 내용이 없으면,
    if (!searchTerm.trim()) {
      alert('검색어를 입력해주세요.'); // 사용자에게 알림을 표시하고,
      return; // 검색 실행을 중단합니다.
    }

    // 부모 컴포넌트로부터 받은 onSearch 함수를 호출하여 검색어를 전달합니다.
    onSearch(searchTerm);
  };

  return (
    // 검색창의 전체적인 레이아웃과 크기를 정의하는 컨테이너입니다.
    <div className="w-full max-w-2xl mx-auto">
      {/* 검색 기능을 위한 form 요소입니다. onSubmit 이벤트를 통해 검색을 실행합니다. */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 p-2 bg-white rounded-full shadow-lg">
        {/* 사용자가 검색어를 입력하는 텍스트 필드입니다. */}
        <input
          type="text"
          value={searchTerm} // 입력 값은 searchTerm state와 동기화됩니다.
          onChange={(e) => setSearchTerm(e.target.value)} // 입력 값이 변경될 때마다 state를 업데이트합니다.
          placeholder="예: 강아지 훈련, 짖음, 산책..." // 입력 필드가 비어있을 때 보여줄 안내 텍스트입니다.
          className="w-full px-4 py-2 text-lg bg-transparent border-none focus:outline-none"
        />
        {/* 검색을 실행하는 버튼입니다. */}
        <button
          type="submit" // 이 버튼은 form을 제출하는 역할을 합니다.
          className="flex-shrink-0 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          aria-label="Search" // 웹 접근성을 위한 라벨입니다.
        >
          {/* 돋보기 모양의 검색 아이콘입니다. */}
          <FaSearch size={20} />
        </button>
      </form>
    </div>
  );
}
