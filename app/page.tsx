import Link from "next/link";
import { LibraryLayout } from "@/components/library";

export default function Home() {
  return (
    <LibraryLayout
      showSidebar={true}
      showFilters={false}
      breadcrumbs={[{ label: 'Home' }]}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome to GTM Library
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your central hub for sales enablement, content resources, and best practices.
        </p>
      </div>

      {/* Featured Content Placeholder */}
      <div
        className="rounded-xl p-12 text-center mb-8"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <svg
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: 'var(--text-muted)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Featured Content Coming Soon
        </h2>
        <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          This landing page will showcase featured resources, recent additions, and curated collections.
        </p>
        <Link
          href="/library"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--bg-dark)' }}
        >
          Browse Library
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLinkCard
          title="Browse All Resources"
          description="Explore the complete library across all boards"
          href="/library"
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          }
        />
        <QuickLinkCard
          title="Enablement Hub"
          description="Training, certifications, and learning paths"
          href="/library/board/enablement"
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
            />
          }
        />
        <QuickLinkCard
          title="Sales Resources"
          description="Proposals, discovery guides, and more"
          href="/library/board/sales"
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          }
        />
      </div>
    </LibraryLayout>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl p-5 transition-all hover:shadow-md"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <svg
        className="w-8 h-8 mb-3"
        style={{ color: 'var(--text-muted)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icon}
      </svg>
      <h3
        className="text-sm font-semibold mb-1 group-hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </Link>
  );
}
