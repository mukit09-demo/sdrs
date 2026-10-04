import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/EntityForm";
import { Button } from "@/components/ui/Button";
import { findCollection } from "@/lib/admin/collections";
import { toFieldViews } from "@/lib/admin/fields";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { routes } from "@/lib/config/routes";

interface NewEntityPageProps {
  params: Promise<{ collection: string }>;
}

export async function generateMetadata({
  params,
}: NewEntityPageProps): Promise<Metadata> {
  const { collection } = await params;
  const found = findCollection(collection);
  return {
    title: found ? `New ${found.singular}` : "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function NewEntityPage({ params }: NewEntityPageProps) {
  await requireUser();

  const { collection: name } = await params;
  const collection = findCollection(name);
  if (!collection) notFound();
  if (collection.adminOnly) await requireAdmin();

  return (
    <>
      <Button
        href={routes.collection(collection.name)}
        variant="link"
        className="text-sm"
      >
        ← {collection.label}
      </Button>
      <h1 className="mt-4 text-3xl font-medium tracking-tight text-ink-900">
        New {collection.singular}
      </h1>

      <div className="mt-10 max-w-3xl">
        <EntityForm
          collection={collection.name}
          singular={collection.singular}
          views={toFieldViews(collection.fields)}
          values={{}}
        />
      </div>
    </>
  );
}
