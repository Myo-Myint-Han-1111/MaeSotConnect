"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class DebugErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("🔥 EXACT ERROR LOCATION:", error);
    console.log("🔥 COMPONENT STACK:", errorInfo.componentStack);
    console.log("🔥 ERROR STACK:", error.stack);

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200">
          <h2 className="text-red-800 font-bold">Component Error Caught</h2>
          <details className="mt-4">
            <summary className="cursor-pointer">
              Click for detailed error info
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
