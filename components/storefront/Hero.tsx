import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("HomePage");

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden flex items-center bg-linear-to-br from-background via-background to-secondary/30">
      <div className="container mx-auto px-4 md:px-6 relative z-20 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
          {/* Text Content */}
          <div className="flex flex-col space-y-6 lg:col-span-6 lg:pr-12 order-2 lg:order-1 pt-20 lg:pt-0">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-accent inline-block rounded-full" />
              <span className="text-sm font-bold tracking-[0.2em] text-accent uppercase">
                {t("newCollection")}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-foreground">
              <span className="block">{t("redefine")}</span>
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-accent to-accent/80 pb-2 mt-1">
                {t("yourStyle")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground/80 max-w-lg leading-relaxed font-medium">
              {t("description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                asChild
                size="lg"
                className="rounded-full text-lg px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-shadow"
              >
                <Link href="/products">
                  {t("shopNow")}{" "}
                  <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full text-lg px-8 py-6 border-2 hover:bg-secondary/50"
              >
                <Link href="/collections">{t("exploreLookbook")}</Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-6 relative h-125 lg:h-187.5 w-full order-1 lg:order-2">
            <div className="absolute inset-0 z-10">
              <div className="relative w-full h-full rounded-4xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                <div className="w-full h-full bg-secondary relative flex items-center justify-center">
                  <Image
                    src="/her-v2.png"
                    alt="Fashion Model"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-tr from-black/10 to-transparent" />
                </div>
              </div>

              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 glass-card p-4 md:p-6 rounded-2xl z-20">
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black tabular-nums">
                    2026
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {useTranslations("Hero")("collection")}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary/50 rounded-full blur-3xl -z-10 opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
}
