"use client";

import { Blog } from '@/hooks/search/useWebSearch';
import SaveButton from '@/components/common/SaveButton'; // SaveButton import 추가

interface BlogResultCardProps {
  blog: Blog;
}

export default function BlogResultCard({ blog }: BlogResultCardProps) {
  return (
    <div className="group relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4">
      <SaveButton
        contentType="web"
        contentId={blog.link}
        contentData={{
          name: blog.title,
          snippet: blog.snippet,
          link: blog.link,
          displayLink: blog.displayLink,
        }}
      />
      <a href={blog.link} target="_blank" rel="noopener noreferrer" className="flex flex-col flex-grow">
        <p className="text-sm text-gray-500 mb-1">{blog.displayLink}</p>
        <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-blue-600 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3">
          {blog.snippet}
        </p>
      </a>
    </div>
  );
}
