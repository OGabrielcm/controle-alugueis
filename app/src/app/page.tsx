import { PropertyDashboard } from "@/components/property-dashboard";
import { properties } from "@/lib/rentals";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function Home() {
  return <PropertyDashboard properties={properties} supabaseReady={hasSupabaseConfig()} />;
}
