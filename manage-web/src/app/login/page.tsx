import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { routes } from "@/lib/config/routes";
import { appConfig } from "@/lib/config/app";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  /** `next` is set by `src/proxy.ts` when it turns an unauthenticated visitor away. */
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-ink-200 bg-white p-8 sm:p-10">
        <p className="text-xs font-medium tracking-widest text-accent-600 uppercase">
          {appConfig.name} admin
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-ink-900">
          Sign in
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-600">
          This area manages the content on the public site. If you do not have
          credentials, there is nothing for you here.
        </p>

        <div className="mt-8">
          <LoginForm next={next ?? routes.dashboard} />
        </div>
      </div>
    </div>
  );
}
