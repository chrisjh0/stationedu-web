import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { hasError: true, message };
  }

  handleReload = () => {
    this.setState({ hasError: false, message: "" });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">error_outline</span>
          <h2 className="text-xl font-semibold text-on-surface mb-2">Something went wrong</h2>
          <p className="text-secondary text-sm mb-6 max-w-sm">
            An unexpected error occurred on this page. Your other pages are not affected.
          </p>
          <button
            onClick={this.handleReload}
            className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-full font-medium text-sm hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
