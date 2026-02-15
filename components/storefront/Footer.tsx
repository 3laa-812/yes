import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary/10">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6">
              {t("about")}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("ourStory")}
                </Link>
              </li>
              <li></li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("careers")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6">
              {t("support")}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("shipping")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("returns")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6">
              {t("legal")}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6">
              {t("newsletter")}
            </h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              {t("subscribe")}
            </p>
          </div>
        </div>
        <div className="mt-16 border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50">
            {t("rights", { year })}
          </p>
          <div className="flex gap-4 items-center">
            {/* Social icons placeholders or similar could go here */}
            <p className="text-xs text-primary-foreground/50">
              {t("poweredBy")}{" "}
              <a
                href="https://linktr.ee/3laaR"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary-foreground transition-colors"
              >
                3laa
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
