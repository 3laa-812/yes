import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <div className="max-w-2xl">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
