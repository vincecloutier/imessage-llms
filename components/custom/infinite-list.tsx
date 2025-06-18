'use client'

import { cn } from '@/lib/utils'
import {
  SupabaseQueryHandler,
  SupabaseTableData,
  SupabaseTableName,
  useInfiniteQuery,
} from '@/hooks/use-infinite-query'
import * as React from 'react'

interface InfiniteListProps<TableName extends SupabaseTableName> {
  tableName: TableName
  columns?: string
  pageSize?: number
  trailingQuery?: SupabaseQueryHandler<TableName>
  renderItem: (item: SupabaseTableData<TableName>, index: number) => React.ReactNode
  className?: string
  renderNoResults?: () => React.ReactNode
  renderEndMessage?: () => React.ReactNode
  renderSkeleton?: (count: number) => React.ReactNode
  scrollDirection?: 'up' | 'down'
}

const DefaultNoResults = () => (
  <div className="text-center text-muted-foreground py-10">No results.</div>
)

const DefaultEndMessage = () => (
  <div className="text-center text-muted-foreground py-4 text-sm">You&apos;ve reached the end.</div>
)

const defaultSkeleton = (count: number) => (
//   <div className="flex flex-col gap-2 px-4">
//     {Array.from({ length: count }).map((_, index) => (
//       <div key={index} className="h-4 w-full bg-muted animate-pulse" />
//     ))}
//   </div>
    <div className="h-4 w-full bg-muted animate-pulse" />
)

export function InfiniteList<TableName extends SupabaseTableName>({
  tableName,
  columns = '*',
  pageSize = 20,
  trailingQuery,
  renderItem,
  className,
  renderNoResults = DefaultNoResults,
  renderEndMessage = DefaultEndMessage,
  renderSkeleton = defaultSkeleton,
  scrollDirection = 'down',
}: InfiniteListProps<TableName>) {
  const [data, setData] = React.useState<SupabaseTableData<TableName>[]>([])
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const previousScrollHeight = React.useRef<number>(0)

  const { isFetching, hasMore, fetchNextPage, isSuccess } = useInfiniteQuery({
    tableName,
    columns,
    pageSize,
    trailingQuery,
    scrollDirection,
    onDataChange: (newData) => {
      previousScrollHeight.current = scrollContainerRef.current?.scrollHeight || 0
      setData(newData)
    },
  })

  // Ref for the scrolling container
  const loadMoreSentinelRef = React.useRef<HTMLDivElement>(null)
  const observer = React.useRef<IntersectionObserver | null>(null)

  React.useEffect(() => {
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          fetchNextPage()
        }
      },
      {
        root: scrollContainerRef.current, // Use the scroll container for scroll detection
        threshold: 0.1, // Trigger when 10% of the target is visible
        rootMargin: '0px 0px 100px 0px', // Trigger loading a bit before reaching the end
      }
    )

    if (loadMoreSentinelRef.current) {
      observer.current.observe(loadMoreSentinelRef.current)
    }

    return () => {
      if (observer.current) observer.current.disconnect()
    }
  }, [isFetching, hasMore, fetchNextPage])

  React.useLayoutEffect(() => {
    if (scrollDirection === 'up' && isFetching) {
      const scrollContainer = scrollContainerRef.current
      if (scrollContainer) {
        const newScrollHeight = scrollContainer.scrollHeight
        const heightDifference = newScrollHeight - previousScrollHeight.current
        if (heightDifference > 0) {
          scrollContainer.scrollTop += heightDifference
        }
      }
    }
  }, [data, isFetching, scrollDirection])

  return (
    <div ref={scrollContainerRef} className={cn('relative h-full overflow-auto scrollbar-hide', className)}>
      <div>
        {scrollDirection === 'up' && hasMore && <div ref={loadMoreSentinelRef} style={{ height: '1px' }} />}

        {isSuccess && data.length === 0 && renderNoResults()}

        {data.map((item, index) => renderItem(item, index))}

        {isFetching && renderSkeleton && renderSkeleton(pageSize)}

        {scrollDirection === 'down' && hasMore && <div ref={loadMoreSentinelRef} style={{ height: '1px' }} />}

        {!hasMore && data.length > 0 && renderEndMessage()}
      </div>
    </div>
  )
}
