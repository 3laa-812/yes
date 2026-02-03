import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store preferences and configuration.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Store Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Store Profile</CardTitle>
            <CardDescription>
              This is how your store will appear to customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input id="store-name" defaultValue="The Kitchen" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                defaultValue="contact@thekitchen.com"
                type="email"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of your admin panel and storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for the admin dashboard.
                </p>
              </div>
              {/* Toggle component would go here */}
              <div className="h-6 w-11 rounded-full bg-primary/20 p-1">
                <div className="h-4 w-4 rounded-full bg-primary shadow-sm" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer ring-2 ring-offset-2 ring-blue-500" />
                <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer" />
                <div className="h-8 w-8 rounded-full bg-green-500 cursor-pointer" />
                <div className="h-8 w-8 rounded-full bg-orange-500 cursor-pointer" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Tax */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping & Tax</CardTitle>
            <CardDescription>
              Configure shipping rates and tax percentages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" defaultValue="USD ($)" disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input id="tax-rate" defaultValue="10" type="number" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Configuration</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
