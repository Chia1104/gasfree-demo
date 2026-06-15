import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getServiceEndPoint } from "@repo/utils/server";

import { env } from "./env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const withServiceUrl = (url: string) => {
  const prefixedUrl = getServiceEndPoint(undefined, {
    baseUrl: env.VITE_SERVICE_ENDPOINT,
  });
  const urlWithStartSlash = url.startsWith("/") ? url : `/${url}`;
  return `${prefixedUrl}${urlWithStartSlash}`;
};
