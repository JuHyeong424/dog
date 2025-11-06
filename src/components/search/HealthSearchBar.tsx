"use client";

import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface HealthSearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export default function HealthSearchBar({ onSearch }: HealthSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }
    onSearch(searchTerm);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex items-center gap-2 p-2 bg-white rounded-full shadow-lg">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="예: 강아지 훈련, 짖음, 산책..."
          className="w-full px-4 py-2 text-lg bg-transparent border-none focus:outline-none"
        />
        <button
          type="submit"
          className="flex-shrink-0 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          aria-label="Search"
        >
          <FaSearch size={20} />
        </button>
      </form>
    </div>
  );
}
