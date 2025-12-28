'use client';

import Link from 'next/link';

interface BoardButtonProps {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  lightColor: string;
  count: number;
}

export function BoardButton({
  id,
  slug,
  name,
  icon,
  color,
  lightColor,
  count,
}: BoardButtonProps) {
  return (
    <Link
      href={`/library/board/${slug}`}
      className="block rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: lightColor,
        borderColor: '#E5E7EB',
        padding: '20px 16px',
      }}
      onMouseEnter={(e) => {
        const button = e.currentTarget;
        button.style.borderColor = color;
        button.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        const button = e.currentTarget;
        button.style.borderColor = '#E5E7EB';
        button.style.boxShadow = 'none';
      }}
    >
      {/* Icon */}
      <span className="block text-[28px] mb-2">{icon}</span>

      {/* Name */}
      <div
        className="text-sm font-semibold mb-1"
        style={{ color: '#111827' }}
      >
        {name}
      </div>

      {/* Count */}
      <div
        className="text-xs"
        style={{ color: '#9CA3AF' }}
      >
        {count} items
      </div>
    </Link>
  );
}
