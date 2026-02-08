import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FailedPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.orderId as string;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <XCircle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Payment Failed
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        Unfortunately, your payment could not be processed. Please try again or
        choose a different payment method.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/checkout">Try Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
