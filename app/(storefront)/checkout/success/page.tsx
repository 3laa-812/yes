import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Order Confirmed!
      </h1>
      <p className="mt-4 text-lg text-gray-500 max-w-md">
        Thank you for your purchase. We've received your order and will begin
        processing it right away.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
