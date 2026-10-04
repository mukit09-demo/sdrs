import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/EntityForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Button } from "@/components/ui/Button";
import { findCollection } from "@/lib/admin/collections";
import { toFieldViews } from "@/lib/admin/fields";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { routes } from "@/lib/config/routes";

interface EditEntityPageProps {
  params: Promise<{ collection: string; id: string }>;
}

export async function generateMetadata({
  params,
}: EditEntityPageProps): Promise<Metadata> {
  const { collection, id } = await params;
  const found = findCollection(collection);
  return {
    title: found ? `${id} — ${found.label}` : "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function EditEntityPage({ params }: EditEntityPageProps) {
  await requireUser();

  const { collection: name, id } = await params;
  const collection = findCollection(name);
  if (!collection) notFound();
  if (collection.adminOnly) await requireAdmin();

  const values = await collection.values(id);
  if (!values) notFound();

  return (
    <>
      <Button
        href={routes.collection(collection.name)}
        variant="link"
        className="text-sm"
      >
        ← {collection.label}
      </Button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-medium tracking-tight text-ink-900">
          Edit {collection.singular}
        </h1>
        <DeleteButton collection={collection.name} id={id} label={id} />
      </div>

      <div className="mt-10 max-w-3xl">
        <EntityForm
          collection={collection.name}
          singular={collection.singular}
          views={toFieldViews(collection.fields)}
          values={values}
          id={id}
        />
      </div>
    </>
  );
}
