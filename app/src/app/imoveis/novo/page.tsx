import { PropertyWorkspace } from "@/components/property-workspace";
import { getProperties } from "@/lib/property-repository";
import { hasSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  const { properties, dataSource } = await getProperties();

  return (
    <PropertyWorkspace
      mode="new"
      properties={properties}
      dataSource={dataSource}
      supabaseReady={hasSupabaseConfig()}
    />
  );
}
