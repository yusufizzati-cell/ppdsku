export function QuizLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-navy-200 border-t-primary-600" />
        <p className="text-sm text-navy-500">Memuat bank soal...</p>
      </div>
    </div>
  );
}
