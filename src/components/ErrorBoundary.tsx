import React from 'react';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  // explicitly declare fields so TS recognizes them even without full React types
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // log to external service if desired
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
          <p className="mt-4 text-gray-600">
            Please refresh the page or try again later.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
