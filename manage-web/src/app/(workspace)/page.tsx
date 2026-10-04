import Link from "next/link";
import { collectionsForRole } from "@/lib/admin/collections";
import { requireUser } from "@/lib/auth/dal";
import { routes } from "@/lib/config/routes";

export default async function AdminDashboardPage() {
  const session = await requireUser();

  // An editor's dashboard simply does not have an Accounts tile. Each
  // collection's own methods guard it as well.
  const summaries = await Promise.all(
    collectionsForRole(session.role).map(async (collection) => ({
      name: collection.name,
      label: collection.label,
      description: collection.description,
      count: (await collection.list()).length,
    })),
  );

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight text-ink-900">
        Content
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-ink-600">
        Everything here appears on the public site as soon as it is saved. Page
        copy that is not a list — the home film, About, Research and training, and
        Contact us — is still edited in the code.
      </p>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((summary) => (
          <li key={summary.name}>
            <Link
              href={routes.collection(summary.name)}
              className="group flex h-full flex-col border border-ink-200 bg-white p-6 transition-colors hover:border-ink-900"
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="text-xl font-medium text-ink-900">
                  {summary.label}
                </span>
                <span className="text-sm text-ink-500">{summary.count}</span>
              </span>
              <span className="mt-3 text-sm leading-relaxed text-ink-600">
                {summary.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
