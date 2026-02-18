import db from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getCustomers = unstable_cache(
  async () => {
    return db.user.findMany({});
  },
  ["admin-customers"],
  { revalidate: 60, tags: ["admin-customers"] },
);

