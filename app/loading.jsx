export default function Loading() {
  return (
    <div className="flex flex-col gap-8 py-8 animate-pulse">
      <div className="h-10 w-48 rounded-xl bg-garis/60" />
      <div className="h-36 w-full rounded-3xl bg-garis/40" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl border border-garis bg-permukaan p-3">
            <div className="aspect-square w-full rounded-xl bg-garis/60" />
            <div className="h-3 w-3/4 rounded bg-garis/60 mt-1" />
            <div className="h-4 w-1/2 rounded bg-garis/80" />
          </div>
        ))}
      </div>
    </div>
  );
}
