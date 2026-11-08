import "server-only";
import { getConfig } from "@/lib/config";
import { mockProvider } from "./mock";
import { restProvider } from "./rest";
import type { TourProvider } from "./types";

/** Chọn nguồn dữ liệu theo TOUR_PROVIDER (mock | rest) */
export function getProvider(): TourProvider {
  return getConfig().provider === "rest" ? restProvider : mockProvider;
}

export { ProviderError } from "./types";
export type { TourProvider } from "./types";
