import type { PropertyRecord } from "./rentals";

export function findPropertyById(items: PropertyRecord[], routeId: string) {
  const id = decodeURIComponent(routeId);
  return items.find((item) => item.id === id);
}
