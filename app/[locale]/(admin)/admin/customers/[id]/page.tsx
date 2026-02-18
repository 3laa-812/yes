import db from "@/lib/db";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { getTranslations, getLocale } from "next-intl/server";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Link } from "@/i18n/routing";
import {
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Calendar,
  ShoppingBag,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

async function getCustomer(id: string) {
  const customer = await db.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      },
      addresses: true,
    },
  });

  if (!customer) return null;
  return customer;
}

export default async function CustomerDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomer(id);
  const t = await getTranslations("Admin.Customers");
  const tOrders = await getTranslations("Admin.Orders");
  const statusT = await getTranslations("Storefront.Status");
  const locale = await getLocale();
  const dateLocale = locale === "ar" ? ar : enUS;

  if (!customer) {
    notFound();
  }

  const totalSpent = customer.orders.reduce(
    (acc, order) => acc + Number(order.total),
    0,
  );
  const lastOrderDate =
    customer.orders.length > 0 ? customer.orders[0].createdAt : null;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={customer.image || ""}
              alt={customer.name || t("userAlt")}
            />
            <AvatarFallback className="text-lg">
              {customer.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {customer.name || t("noName")}
            </h1>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        {/* <Button variant="destructive">{t("delete")}</Button> */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {t("profile")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {t("contactInfo")}
              </span>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone || "-"}</span>
              </div>
            </div>
            <Separator />
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {t("status")}
              </span>
              <Badge
                variant={customer.isActive ? "default" : "secondary"}
                className="w-fit"
              >
                {t(customer.isActive ? "active" : "status")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {t("spent")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent, locale)}
            </div>
            <p className="text-xs text-muted-foreground">
              {customer.orders.length} {tOrders("title")}
            </p>
            {lastOrderDate && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t("lastOrder")}:{" "}
                {format(new Date(lastOrderDate), "MMM d, yyyy", {
                  locale: dateLocale,
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Addresses */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("addresses")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {customer.addresses.length > 0 ? (
              customer.addresses.map((address) => (
                <div key={address.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium">{address.name}</div>
                  <div className="text-muted-foreground">
                    {address.street}, {address.city}
                  </div>
                  <div className="text-muted-foreground">{address.phone}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("noAddresses")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("orderHistory")}</CardTitle>
            <CardDescription>{tOrders("title")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tOrders("orderId")}</TableHead>
                  <TableHead>{tOrders("date")}</TableHead>
                  <TableHead>{tOrders("status")}</TableHead>
                  <TableHead>{tOrders("total")}</TableHead>
                  <TableHead className="text-end">
                    {tOrders("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM d, yyyy", {
                        locale: dateLocale,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "DELIVERED" ? "default" : "secondary"
                        }
                      >
                        {statusT(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(order.total), locale)}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          {tOrders("details")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {customer.orders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      {tOrders("noOrders")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
