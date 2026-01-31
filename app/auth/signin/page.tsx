import { signIn } from "@/auth"; // We will need to import this or use a server action
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <FadeIn className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg ring-1 ring-gray-900/5">
        <div className="text-center">
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to continue to the dashboard.
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await signIn("credentials", {
              ...Object.fromEntries(formData),
              redirectTo: "/admin/dashboard",
            });
          }}
          className="mt-8 space-y-6"
        >
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-t-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
                defaultValue="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-b-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Password"
                defaultValue="admin"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative flex w-full justify-center"
            >
              Sign in
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Default Credentials:</p>
            <p>Email: admin@example.com</p>
            <p>Password: admin</p>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
