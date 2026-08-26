export default function ProductSkeleton() {
  return (
    <article className="flex flex-col" aria-hidden="true">
      <div className="aspect-[3/4] overflow-hidden border border-line bg-surface animate-pulse" />
      <div className="mt-[16px] flex items-baseline justify-between gap-[14px] border-t border-line px-[2px] pt-[16px]">
        <div className="h-[18px] w-2/3 rounded bg-surface animate-pulse" />
        <div className="h-[12px] w-[48px] rounded bg-surface animate-pulse" />
      </div>
    </article>
  )
}
