import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityTable } from "@/components/admin/EntityTable";
import { Button } from "@/components/ui/Button";
import { findCollection } from "@/lib/admin/collections";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { routes } from "@/lib/config/routes";

interface CollectionPageProps {
  params: Promise<{ collection: string }>;
  /** `error` is set when a delete was refused — see `deleteEntityAction`. */
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { collection } = await params;
  return {
    title: findCollection(collection)?.label ?? "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  await requireUser();

  const { collection: name } = await params;
  const collection = findCollection(name);
  if (!collection) notFound();

  // Admin-only collections guard themselves in `list()` too; this stops an
  // editor seeing the page frame at all.
  if (collection.adminOnly) await requireAdmin();

  const [rows, { error }] = await Promise.all([collection.list(), searchParams]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-ink-900">
            {collection.label}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-600">{collection.description}</p>
        </div>
        <Button href={routes.create(collection.name)}>
          New {collection.singular}
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-8 rounded-control border border-danger-500 bg-danger-50 p-4 text-sm text-danger-700"
        >
          {error}
        </p>
      )}

      <p className="mt-8 text-sm text-ink-500" aria-live="polite">
        {rows.length} {rows.length === 1 ? "entry" : "entries"}
      </p>

      <div className="mt-4">
        <EntityTable
          collection={collection.name}
          singular={collection.singular}
          rows={rows}
        />
      </div>
    </>
  );
}
