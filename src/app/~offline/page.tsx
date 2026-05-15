export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="text-8xl">📡</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">You&apos;re Offline</h1>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            Langor AI needs an internet connection for AI conversations and live battles.
            Check your connection and try again.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
