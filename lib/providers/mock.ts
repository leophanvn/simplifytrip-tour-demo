import "server-only";
import { MOCK_FACETS, TOURS } from "@/data/tours";
import type { TourProvider } from "./types";

/** Nguồn dữ liệu giả lập (data/tours.ts) – dùng khi chưa có key */
export const mockProvider: TourProvider = {
  source: "mock",
  facetPreset: MOCK_FACETS,
  async listTours() {
    return TOURS;
  },
  async getTourBySlug(slug) {
    return TOURS.find((t) => t.slug === slug);
  },
  async checkSeatsAvailable(departureId) {
    for (const t of TOURS) {
      const d = t.departures.find((x) => x.id === departureId);
      if (d) return d.seatsLeft;
    }
    return 0;
  },
};
