export default function Loading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6">
      <div className="text-center" role="status" aria-live="polite">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent-100 border-t-accent-600" />
        <p className="mt-3 text-sm text-ink-2">Đang tải dữ liệu…</p>
      </div>
    </main>
  );
}
