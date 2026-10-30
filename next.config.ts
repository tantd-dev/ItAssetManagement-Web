import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // pro-form imports the legacy `rc-field-form`; antd 6 ships the same code as
  // `@rc-component/form`, and both must share one FieldContext.
  turbopack: {
    resolveAlias: { "rc-field-form": "@rc-component/form" },
  },
};

export default nextConfig;
