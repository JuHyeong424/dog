"use client";

import { Blog } from '@/hooks/search/useWebSearch'; // 블로그 검색 결과의 데이터 타입을 가져옵니다.
import SaveButton from '@/components/common/SaveButton'; // 콘텐츠를 저장하는 버튼 컴포넌트를 가져옵니다.

// BlogResultCard 컴포넌트가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface BlogResultCardProps {
  blog: Blog; // 표시할 단일 블로그 검색 결과 데이터
}

// 웹 검색 결과를 보여주는 카드 형태의 UI 컴포넌트입니다.
export default function BlogResultCard({ blog }: BlogResultCardProps) {
  return (
    // 전체 카드를 감싸는 컨테이너입니다. 호버 시 그림자 효과가 강조됩니다.
    <div className="group relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4">
      {/* 카드 우측 상단에 위치하는 '저장하기' 버튼 컴포넌트입니다. */}
      <SaveButton
        contentType="web" // 저장할 콘텐츠의 종류를 'web'으로 지정합니다.
        contentId={blog.link} // 콘텐츠를 식별할 고유 ID로 블로그 링크를 사용합니다.
        contentData={{ // 마이페이지에서 보여줄 메타데이터를 전달합니다.
          name: blog.title,
          snippet: blog.snippet,
          link: blog.link,
          displayLink: blog.displayLink,
        }}
      />
      {/* 카드 전체를 클릭 가능한 링크로 만듭니다. */}
      <a href={blog.link} target="_blank" rel="noopener noreferrer" className="flex flex-col flex-grow">
        {/* 블로그의 출처 도메인을 표시합니다. */}
        <p className="text-sm text-gray-500 mb-1">{blog.displayLink}</p>
        {/* 블로그 제목을 표시합니다. 최대 2줄까지 보여주고 나머지는 말줄임표로 처리됩니다. */}
        <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-blue-600 line-clamp-2">
          {blog.title}
        </h3>
        {/* 블로그 내용의 일부(요약)를 표시합니다. 최대 3줄까지 보여주고 나머지는 말줄임표로 처리됩니다. */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {blog.snippet}
        </p>
      </a>
    </div>
  );
}
