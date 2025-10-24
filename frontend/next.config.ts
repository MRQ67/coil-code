import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.wasm": {
        loaders: ["@turbopack/loader-wasm"],
        as: "*.wasm",
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Handle .wasm files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Monaco Editor configuration
    if (!isServer) {
      config.externals = {
        ...config.externals,
        "monaco-editor": "monaco-editor",
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
