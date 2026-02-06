import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-black uppercase">
              {t("about")}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {t("ourStory")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {t("sustainability")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {t("careers")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-black uppercase">
              {t("support")}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {t("shipping")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {t("returns")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-black uppercase">
              {t("legal")}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-black uppercase">
              {t("newsletter")}
            </h3>
            <p className="mt-4 text-sm text-gray-500">{t("subscribe")}</p>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-400 text-center">
            {t("rights", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
