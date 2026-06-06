import { PropertyDetailClient } from "@/components/property-detail-client";
import { getProperties } from "@/lib/property-repository";
import { hasSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const { properties, dataSource } = await getProperties();

  return (
    <PropertyDetailClient
      routeId={id}
      fallbackProperties={properties}
      fallbackDataSource={dataSource}
      supabaseReady={hasSupabaseConfig()}
    />
  );
}
