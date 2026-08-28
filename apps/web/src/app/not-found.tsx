import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="marketing-surface flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <Image src="/icons/notFound.png" alt="" width={112} height={112} priority className="size-28" />
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Page not found</h1>
        <p className="max-w-sm text-sm leading-relaxed text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <Link href="/">
        <Button variant="amber" size="lg" className="focus-visible:ring-offset-charcoal-950">
          Go home
        </Button>
      </Link>
    </div>
  );
}
