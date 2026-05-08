import { notFound } from "next/navigation";
import { CosmiclanWorkPage } from "@/components/public/cosmiclan-work-page";
import {
  getProductBySlug,
  PRODUCTS,
} from "@/components/public/cosmiclan-site-data";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <CosmiclanWorkPage
      product={product}
      index={PRODUCTS.findIndex((item) => item.slug === product.slug)}
    />
  );
}
