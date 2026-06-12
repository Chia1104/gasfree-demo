import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getServiceEndPoint } from "@repo/utils/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const withServiceUrl = (url: string) => {
  const prefixedUrl = getServiceEndPoint(undefined, {
    baseUrl: "http://localhost:3001",
  });
  const urlWithStartSlash = url.startsWith("/") ? url : `/${url}`;
  return `${prefixedUrl}${urlWithStartSlash}`;
};
