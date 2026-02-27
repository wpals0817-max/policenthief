"use client";

import { Component, ReactNode } from "react";
import Card from "./Card";
import Button from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: error.stack,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // 에러 로깅 서비스로 전송 (Sentry 등)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
          <Card variant="default" padding="lg" className="max-w-md text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              오류가 발생했습니다
            </h1>
            <p className="text-gray-400 mb-4">
              예상치 못한 문제가 발생했습니다.
              <br />
              다시 시도해주세요.
            </p>

            {this.state.error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-left">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={this.handleReload}
              >
                🔄 새로고침
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={this.handleReset}
              >
                🏠 홈으로 돌아가기
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                  개발자 정보 (스택 트레이스)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-black/50 p-2 rounded overflow-x-auto max-h-40">
                  {this.state.errorInfo}
                </pre>
              </details>
            )}
          </Card>
        </main>
      );
    }

    return this.props.children;
  }
}
