import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: 'white', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Something went wrong.</h1>
          <div style={{ padding: '10px', background: '#ffe6e6', border: '1px solid red', borderRadius: '5px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Error:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#cc0000' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </div>
          <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px' }}>
             <h3 style={{ margin: '0 0 10px 0' }}>Stack Trace:</h3>
             <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
             </pre>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
