"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

// 사용자가 검색어를 입력하고 검색 페이지로 이동할 수 있게 하는 검색창 컴포넌트입니다.
export default function ProductSearchBar() {
  // 입력 필드의 현재 값을 관리하기 위한 state입니다.
  const [inputValue, setInputValue] = useState('');
  // 페이지 이동을 위해 Next.js의 useRouter 훅을 사용합니다.
  const router = useRouter();

  // 검색 버튼을 클릭하거나 엔터 키를 눌렀을 때 실행되는 함수입니다.
  const handleSearch = () => {
    // 입력된 검색어의 양쪽 공백을 제거했을 때 내용이 없으면,
    if (!inputValue.trim()) {
      alert("검색어를 입력해주세요."); // 사용자에게 알림을 표시하고,
      return; // 검색 실행을 중단합니다.
    }
    // router.push를 사용하여 검색 결과 페이지(/search)로 이동합니다.
    // 입력된 검색어는 URL의 쿼리 파라미터('q')로 전달됩니다.
    router.push(`/search?q=${inputValue}`);
  };

  return (
    // 검색창과 버튼을 감싸는 flex 컨테이너입니다.
    <div className="flex w-full max-w-md">
      {/* 사용자가 검색어를 입력하는 텍스트 필드입니다. */}
      <input
        type="text"
        value={inputValue} // 입력 값은 inputValue state와 동기화됩니다.
        onChange={(e) => setInputValue(e.target.value)} // 입력 값이 변경될 때마다 state를 업데이트합니다.
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // 'Enter' 키를 누르면 handleSearch 함수를 실행합니다.
        className="w-full border p-2 rounded-l-lg focus:ring-2 focus:ring-blue-500"
        placeholder="찾고 싶은 상품, 건강 정보를 검색해 보세요." // 입력 필드가 비어있을 때 보여줄 안내 텍스트입니다.
      />
      {/* 검색을 실행하는 버튼입니다. */}
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 flex items-center justify-center">
        {/* 돋보기 모양의 검색 아이콘입니다. */}
        <FaSearch />
      </button>
    </div>
  );
}
