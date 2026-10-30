"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { useServerInsertedHTML } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";

/** Collects Ant Design's CSS-in-JS rules during SSR and injects them once. */
export function AntdRegistry({ children }: { children: ReactNode }) {
  const [cache] = useState(() => createCache());
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <style
        id="antd-cssinjs"
        dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
