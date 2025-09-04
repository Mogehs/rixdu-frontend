import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center p-8'>
            <div className='mb-4'>
              <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                Something went wrong
              </h2>
              <p className='text-gray-600 mb-4'>
                We encountered an error while loading this page.
              </p>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                // Clear any profile state that might be causing issues
                window.location.reload();
              }}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
