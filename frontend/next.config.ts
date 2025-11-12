import type { NextConfig } from "next";
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

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
          // Configure publicPath to match where workers are requested
          // Workers are requested at /_next/css.worker.js etc.
          publicPath: "/_next/",
        })
      );
    }

    return config;
  },
};

export default nextConfig;
