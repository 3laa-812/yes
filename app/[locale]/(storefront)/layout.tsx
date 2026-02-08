import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { FadeIn } from "@/components/ui/motion";
import { auth } from "@/auth";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <FadeIn className="flex-1">{children}</FadeIn>
      <Footer />
    </div>
  );
}
