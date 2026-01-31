import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";

export function Hero() {
  return (
    <div className="relative isolate overflow-hidden pt-14">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      <FadeIn
        delay={0.2}
        className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Elegance in every thread.
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Discover our new summer collection. Meticulously crafted for the
          modern individual who values style and comfort.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/products">Shop Collection</Link>
          </Button>
          <Link
            href="/collections/women"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
