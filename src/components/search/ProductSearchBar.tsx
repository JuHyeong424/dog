"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // next/router가 아닌 next/navigation을 사용합니다.
import { FaSearch } from 'react-icons/fa';

export default function ProductSearchBar() {
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!inputValue.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    // /products 페이지로 이동하면서 q라는 쿼리 파라미터에 검색어를 담아 보냅니다.
    router.push(`/search?q=${inputValue}`);
  };

  return (
    <div className="flex w-full max-w-md">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="w-full border p-2 rounded-l-lg focus:ring-2 focus:ring-blue-500"
        placeholder="찾고 싶은 상품, 건강 정보를 검색해 보세요."
      />
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 flex items-center justify-center">
        <FaSearch />
      </button>
    </div>
  );
}
