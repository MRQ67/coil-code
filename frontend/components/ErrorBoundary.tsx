"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-900 p-8">
          <div className="max-w-2xl rounded-lg border border-red-500/50 bg-red-900/20 p-8">
            <h1 className="mb-4 text-2xl font-bold text-red-400">
              Something went wrong
            </h1>
            <div className="mb-4 space-y-2">
              <p className="text-gray-300">
                An error occurred while rendering this component:
              </p>
              {this.state.error && (
                <div className="rounded bg-gray-800 p-4 font-mono text-sm text-red-300">
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
              )}
              {this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                    Stack trace
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-gray-800 p-4 text-xs text-gray-400">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="rounded-lg bg-gray-700 px-6 py-2 text-white transition-colors hover:bg-gray-600"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
