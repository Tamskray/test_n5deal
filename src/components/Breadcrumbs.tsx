import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
    >
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">›</span> : null}
            {item.href && !isCurrent ? (
              <Link
                href={item.href}
                className="font-medium text-slate-700 transition hover:text-slate-900"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isCurrent ? "text-slate-600" : "font-medium text-slate-700"}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
