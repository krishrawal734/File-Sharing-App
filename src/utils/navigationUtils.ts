import { router } from "expo-router";

/**
 * Safely navigates back if history stack exists, otherwise navigates to home root '/'
 */
export function safeBack(fallbackRoute = "/") {
  if (router.canGoBack()) {
    try {
      router.back();
    } catch {
      router.replace(fallbackRoute as any);
    }
  } else {
    router.replace(fallbackRoute as any);
  }
}
