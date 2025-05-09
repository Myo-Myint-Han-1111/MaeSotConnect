import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Router error caught:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Something went wrong with the application routing.</h2>
          <p>Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 16px",
              background: "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          <p style={{ color: "gray", fontSize: "0.8rem", marginTop: "20px" }}>
            Error details: {this.state.error?.toString()}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// This ErrorBoundary component provides error handling for React application routing. Here's how it works:

// 1. **Component Structure**:
//    - Built as a class component with TypeScript interfaces for props and state
//    - Wraps around other components to catch errors in their rendering or lifecycle methods

// 2. **Error Handling**:
//    - Uses React's error boundary lifecycle methods to detect errors
//    - `getDerivedStateFromError` updates state when an error occurs
//    - `componentDidCatch` logs detailed error information to the console

// 3. **Recovery UI**:
//    - When an error is detected, displays a user-friendly error message
//    - Shows a reload button that refreshes the page
//    - Includes error details (in smaller text) for debugging purposes

// 4. **Implementation**:
//    - Applied in index.tsx to wrap the entire application
//    - Specifically targets routing errors as indicated in the error message
//    - Maintains the normal application flow when no errors occur

// This component improves application reliability by preventing white screens or crashes when routing errors occur, giving users a way to recover from errors instead.
