import { PropertyDashboard } from "@/components/property-dashboard";
import { getProperties } from "@/lib/property-repository";
import { hasSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { properties, dataSource } = await getProperties();

  return (
    <PropertyDashboard
      properties={properties}
      dataSource={dataSource}
      supabaseReady={hasSupabaseConfig()}
    />
  );
}
