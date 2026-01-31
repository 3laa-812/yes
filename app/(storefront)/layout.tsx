import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { FadeIn } from "@/components/ui/motion";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <FadeIn className="flex-1">{children}</FadeIn>
      <Footer />
    </div>
  );
}
