import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-50 mb-2">
              Kutilmagan xato yuz berdi
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Ilovada xatolik yuz berdi. Sahifani qayta yuklang yoki bosh
              sahifaga qayting.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-400 bg-[#0F172A] rounded-lg p-3 mb-6 overflow-auto max-h-32 text-left">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-[#3D3DC4] text-white text-sm font-semibold hover:bg-[#3D3DC4]/80 transition-colors"
              >
                Qayta yuklash
              </button>
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.href = "/dashboard";
                }}
                className="px-4 py-2 rounded-xl bg-[#334155] text-slate-300 text-sm font-semibold hover:bg-[#475569] transition-colors"
              >
                Bosh sahifaga
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
