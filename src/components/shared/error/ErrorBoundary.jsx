import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-600 p-10">
          🚫 เกิดข้อผิดพลาดในการแสดงผล กรุณารีเฟรชหน้าหรือแจ้งผู้ดูแลระบบ
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
