import db from "@/lib/supabase/db";
import { collections, products } from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";
import {
  CACHE_TAGS,
  STOREFRONT_STATIC_REVALIDATE_SECONDS,
} from "@/lib/cache/constants";
import { withStorefrontCache } from "@/lib/cache/storefront-cache";

function dbReadyForBuild() {
  const ref = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF?.trim() || "";
  const url = process.env.DATABASE_URL?.trim() || "";
  if (!ref || ref === "placeholder") return false;
  if (!url || url.includes("placeholder") || url.includes("127.0.0.1")) {
    return false;
  }
  return true;
}

export async function getPublishedProductSlugs() {
  if (!dbReadyForBuild()) return [];

  return withStorefrontCache(
    "sf:sitemap:products",
    async () => {
      const rows = await db
        .select({
          slug: products.slug,
          createdAt: products.createdAt,
        })
        .from(products)
        .where(eq(products.isDraft, false))
        .orderBy(products.createdAt);

      return rows;
    },
    {
      revalidate: STOREFRONT_STATIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.products],
    },
  );
}

export async function getCollectionSlugs() {
  if (!dbReadyForBuild()) return [];

  return withStorefrontCache(
    "sf:sitemap:collections",
    async () => {
      const rows = await db
        .select({
          slug: collections.slug,
          label: collections.label,
        })
        .from(collections)
        .orderBy(collections.order);

      return rows;
    },
    {
      revalidate: STOREFRONT_STATIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.collections],
    },
  );
}
