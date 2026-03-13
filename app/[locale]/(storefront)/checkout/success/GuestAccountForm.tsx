"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createAccountFromGuestOrder } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";

export function GuestAccountForm({ orderId }: { orderId: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || password.length < 6) {
      toast.error(
        "Please enter a valid email and a password of at least 6 characters.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAccountFromGuestOrder(
        orderId,
        email,
        password,
      );
      if (result.success) {
        toast.success("Account created successfully! You can now log in.");
        setIsSuccess(true);
        // Optionally redirect to login or orders
      } else {
        toast.error(result.error || "Failed to create account.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="text-left bg-muted/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Account Created!</CardTitle>
          <CardDescription>
            Your order is now linked to your new account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/login")} className="w-full">
            Log In to your Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-left shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Track Your Order?</CardTitle>
        <CardDescription>
          Create an account to easily track your order status and save your
          details for next time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-email">Email Address</Label>
            <Input
              id="guest-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-password">Password (min 6 chars)</Label>
            <Input
              id="guest-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
