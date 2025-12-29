'use client';

import Link from 'next/link';

interface BoardPillProps {
  slug: string;
  name: string;
  icon?: string;
  color: string;
  lightColor: string;
  accentColor: string;
  count?: number;
  isActive?: boolean;
}

export function BoardPill({
  slug,
  name,
  icon,
  color,
  lightColor,
  accentColor,
  count,
  isActive = false,
}: BoardPillProps) {
  return (
    <Link
      href={`/hub/${slug}`}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: isActive ? lightColor : 'white',
        borderColor: isActive ? color : 'var(--card-border)',
        color: isActive ? accentColor : 'var(--text-primary)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = lightColor;
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.color = accentColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = 'var(--card-border)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{name}</span>
      {count !== undefined && (
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: isActive ? 'rgba(255,255,255,0.5)' : 'var(--bg-page)',
            color: 'var(--text-muted)',
          }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
