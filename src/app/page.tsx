import Link from "next/link";

const featureCards = [
  {
    title: "Discover assets",
    description: "Browse curated listings to find the right opportunity faster.",
    href: "/all-listing",
    cta: "Explore listings",
  },
  {
    title: "Buyer workflow",
    description: "Track your interest, compare options, and manage buyer activity in one place.",
    href: "/dashboard/buyer",
    cta: "Open buyer dashboard",
  },
  {
    title: "Seller operations",
    description: "Manage listings, buyers, and your pipeline from a dedicated seller workspace.",
    href: "/dashboard/seller",
    cta: "Seller tools",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {featureCards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
              Workspace
            </p>
            <h2 className="mt-3 text-xl font-bold text-slate-900">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            <Link
              href={card.href}
              className="mt-5 inline-flex font-semibold text-slate-900 underline underline-offset-4"
            >
              {card.cta}
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
