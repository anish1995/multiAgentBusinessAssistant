type ApiUnavailableBannerProps = {
  message: string;
};

export function ApiUnavailableBanner({ message }: ApiUnavailableBannerProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-amber-900">Backend unavailable</p>
        <p className="mt-1 text-sm text-amber-800/90">{message}</p>
        <p className="mt-3 inline-flex rounded-lg bg-white/70 px-3 py-1.5 font-mono text-xs text-amber-900 ring-1 ring-amber-200">
          cd backend &amp;&amp; mvn spring-boot:run
        </p>
      </div>
    </div>
  );
}
