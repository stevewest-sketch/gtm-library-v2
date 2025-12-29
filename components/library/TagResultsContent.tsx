'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AssetCard } from './AssetCard';

interface Asset {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  hub: string;
  format: string;
  type?: string;
  tags: string[];
  publishDate?: string;
}

interface RelatedTag {
  id: string;
  name: string;
  slug: string;
}

interface TagResultsContentProps {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
  assets: Asset[];
  relatedTags: RelatedTag[];
  boardCount: number;
}

export function TagResultsContent({
  tag,
  assets,
  relatedTags,
  boardCount,
}: TagResultsContentProps) {
  const router = useRouter();

  const handleClearTag = () => {
    router.push('/library');
  };

  return (
    <div>
      {/* Tag Results Header */}
      <div style={{ marginBottom: '28px' }}>
        {/* Tag Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#FEF3C7',
            borderRadius: '24px',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#D97706' }}>#</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#D97706' }}>
            {tag.name}
          </span>
          <button
            onClick={handleClearTag}
            style={{
              width: '18px',
              height: '18px',
              background: '#D97706',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              marginLeft: '4px',
              border: 'none',
              padding: 0,
              lineHeight: 1,
            }}
            title="Clear filter"
          >
            ×
          </button>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: '8px',
          }}
        >
          {tag.name}
        </h1>

        {/* Meta */}
        <p style={{ fontSize: '14px', color: '#64748B' }}>
          {assets.length} resource{assets.length !== 1 ? 's' : ''} tagged with "{tag.name}"
          {boardCount > 0 && ` across ${boardCount} hub${boardCount !== 1 ? 's' : ''}`}
        </p>

        {/* Related Tags */}
        {relatedTags.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: '#94A3B8',
                marginRight: '4px',
              }}
            >
              Related:
            </span>
            {relatedTags.map((relatedTag) => (
              <Link
                key={relatedTag.id}
                href={`/library/tag/${relatedTag.slug}`}
                style={{
                  padding: '6px 12px',
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#64748B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D97706';
                  e.currentTarget.style.color = '#D97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                <span style={{ color: '#94A3B8' }}>#</span>
                {relatedTag.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Results Grid - Uses the same AssetCard as everywhere else */}
      {assets.length > 0 ? (
        <div className="card-grid">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              id={asset.id}
              slug={asset.slug}
              title={asset.title}
              shortDescription={asset.shortDescription}
              hub={asset.hub}
              format={asset.format}
              type={asset.type}
              publishDate={asset.publishDate}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#F1F5F9',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
            }}
          >
            #
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
            No resources found
          </h3>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            No resources have been tagged with "{tag.name}" yet.
          </p>
        </div>
      )}
    </div>
  );
}
