import type { NextConfig } from "next";
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const nextConfig: NextConfig = {
  turbopack: {}, // Add empty turbopack config to avoid error
  webpack: (config, { isServer }) => {
    // Handle .wasm files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Monaco Editor configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // Ensure plugins array exists
      if (!config.plugins) {
        config.plugins = [];
      }

      // Add Monaco Editor webpack plugin
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["html", "css", "javascript", "typescript", "json"],
          // Note: Worker 404s in dev mode are harmless - Monaco falls back to main thread
          // Workers load correctly in production build
          publicPath: "/_next/",
        })
      );
    }

    return config;
  },
};

export default nextConfig;
