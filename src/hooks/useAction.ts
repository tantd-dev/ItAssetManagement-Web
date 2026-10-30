"use client";

import { App } from "antd";
import { useCallback } from "react";
import { errorMessage } from "@/lib/api";

/**
 * Runs an API call, shows a success toast or the server's error message,
 * and resolves to the result (or undefined on failure).
 */
export function useAction() {
  const { message } = App.useApp();
  return useCallback(
    async <T,>(fn: () => Promise<T>, success?: string) => {
      try {
        const result = await fn();
        if (success) message.success(success);
        return { ok: true as const, data: result };
      } catch (e) {
        message.error(errorMessage(e));
        return { ok: false as const, data: undefined };
      }
    },
    [message],
  );
}
