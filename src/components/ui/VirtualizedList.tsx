import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { calculateVirtualizedRange, type VirtualizedListConfig } from '../../utils/performance';
import { usePerformance } from '../../hooks/usePerformance';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
  threshold?: number;
  loading?: boolean;
  loadingComponent?: React.ComponentType;
  emptyComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  columnsCount?: number;
  overscan?: number;
  className?: string;
  gap?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    title: string;
    width: number;
    render?: (value: any, item: T, index: number) => React.ReactNode;
  }>;
  rowHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  getRowKey?: (item: T, index: number) => string | number;
  headerHeight?: number;
  stickyHeader?: boolean;
}

// Memoized list item wrapper
const ListItem = memo<{
  children: React.ReactNode;
  style: React.CSSProperties;
  className?: string;
}>(({ children, style, className }) => (
  <div className={className} style={style}>
    {children}
  </div>
));

ListItem.displayName = 'VirtualizedListItem';

// Enhanced virtual list with performance optimizations
export const VirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey,
  threshold = 0.8,
  loading = false,
  loadingComponent: LoadingComponent,
  emptyComponent: EmptyComponent,
  errorComponent: ErrorComponent,
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualizedListProps<T>) => {
  const { measureRenderTime } = usePerformance();
  const [scrollTop, setScrollTop] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate visible range with memoization
  const { startIndex, endIndex, visibleRange } = useMemo(() => {
    const config: VirtualizedListConfig = {
      itemHeight,
      containerHeight,
      overscan,
      threshold
    };
    
    return calculateVirtualizedRange(scrollTop, items.length, config);
  }, [scrollTop, items.length, itemHeight, containerHeight, overscan, threshold]);

  // Generate visible items with performance tracking
  const visibleItems = useMemo(() => {
    const endMeasure = measureRenderTime('VirtualizedList-visibleItems');
    
    try {
      const result = items.slice(startIndex, endIndex + 1).map((item, index) => {
        const actualIndex = startIndex + index;
        const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex;
        
        return {
          key,
          item,
          index: actualIndex,
          style: {
            position: 'absolute' as const,
            top: actualIndex * itemHeight,
            height: itemHeight,
            width: '100%',
            left: 0
          }
        };
      });
      
      endMeasure();
      return result;
    } catch (err) {
      setError(err as Error);
      endMeasure();
      return [];
    }
  }, [items, startIndex, endIndex, itemHeight, getItemKey, measureRenderTime]);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const newScrollTop = target.scrollTop;
    
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);

    // Track scrolling state
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);

    // Check if end reached
    if (onEndReached) {
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      const threshold = scrollHeight * endReachedThreshold;
      
      if (newScrollTop + clientHeight >= threshold) {
        onEndReached();
      }
    }
  }, [onScroll, onEndReached, endReachedThreshold]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Error retry handler
  const retryHandler = useCallback(() => {
    setError(null);
  }, []);

  // Render error state
  if (error && ErrorComponent) {
    return <ErrorComponent error={error} retry={retryHandler} />;
  }

  // Render loading state
  if (loading && LoadingComponent) {
    return <LoadingComponent />;
  }

  // Render empty state
  if (items.length === 0 && EmptyComponent) {
    return <EmptyComponent />;
  }

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ key, item, index, style }) => (
          <ListItem key={key} style={style}>
            {renderItem(item, index)}
          </ListItem>
        ))}
      </div>
    </div>
  );
};

// Virtual grid component for card layouts
export const VirtualizedGrid = <T,>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  columnsCount,
  overscan = 5,
  className = '',
  gap = 16,
  getItemKey
}: VirtualizedGridProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { measureRenderTime } = usePerformance();

  // Calculate columns automatically if not provided
  const columns = columnsCount || Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rows = Math.ceil(items.length / columns);
  const rowHeight = itemHeight + gap;

  // Calculate visible range for grid
  const { startIndex: startRow, endIndex: endRow } = useMemo(() => {
    const config: VirtualizedListConfig = {
      itemHeight: rowHeight,
      containerHeight,
      overscan
    };
    
    return calculateVirtualizedRange(scrollTop, rows, config);
  }, [scrollTop, rows, rowHeight, containerHeight, overscan]);

  // Generate visible items for grid
  const visibleItems = useMemo(() => {
    const endMeasure = measureRenderTime('VirtualizedGrid-visibleItems');
    
    const result = [];
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        
        if (index < items.length) {
          const item = items[index];
          const key = getItemKey ? getItemKey(item, index) : index;
          
          result.push({
            key,
            item,
            index,
            style: {
              position: 'absolute' as const,
              top: row * rowHeight,
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight
            }
          });
        }
      }
    }
    
    endMeasure();
    return result;
  }, [items, startRow, endRow, columns, itemWidth, itemHeight, gap, rowHeight, getItemKey, measureRenderTime]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const totalHeight = rows * rowHeight;

  return (
    <div
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight, width: containerWidth }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ key, item, index, style }) => (
          <div key={key} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Virtual table component with fixed headers
export const VirtualizedTable = <T,>({
  data,
  columns,
  rowHeight,
  containerHeight,
  overscan = 5,
  className = '',
  onRowClick,
  getRowKey,
  headerHeight = 48,
  stickyHeader = true
}: VirtualizedTableProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { measureRenderTime } = usePerformance();

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const config: VirtualizedListConfig = {
      itemHeight: rowHeight,
      containerHeight: containerHeight - (stickyHeader ? headerHeight : 0),
      overscan
    };
    
    return calculateVirtualizedRange(scrollTop, data.length, config);
  }, [scrollTop, data.length, rowHeight, containerHeight, headerHeight, stickyHeader, overscan]);

  // Generate visible rows
  const visibleRows = useMemo(() => {
    const endMeasure = measureRenderTime('VirtualizedTable-visibleRows');
    
    const result = data.slice(startIndex, endIndex + 1).map((item, index) => {
      const actualIndex = startIndex + index;
      const key = getRowKey ? getRowKey(item, actualIndex) : actualIndex;
      
      return {
        key,
        item,
        index: actualIndex,
        style: {
          position: 'absolute' as const,
          top: actualIndex * rowHeight + (stickyHeader ? headerHeight : 0),
          height: rowHeight,
          width: '100%',
          left: 0
        }
      };
    });
    
    endMeasure();
    return result;
  }, [data, startIndex, endIndex, rowHeight, headerHeight, stickyHeader, getRowKey, measureRenderTime]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const totalHeight = data.length * rowHeight + (stickyHeader ? headerHeight : 0);

  return (
    <div
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Sticky header */}
      {stickyHeader && (
        <div
          className="absolute top-0 left-0 right-0 z-10 bg-gray-800 border-b border-gray-700"
          style={{ height: headerHeight }}
        >
          <div className="flex">
            {columns.map((column) => (
              <div
                key={column.key}
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-300"
                style={{ width: column.width }}
              >
                {column.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table body */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleRows.map(({ key, item, index, style }) => (
          <div
            key={key}
            className={`flex border-b border-gray-700 hover:bg-gray-800/50 ${onRowClick ? 'cursor-pointer' : ''}`}
            style={style}
            onClick={() => onRowClick?.(item, index)}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className="flex items-center px-4 py-3 text-sm text-gray-300"
                style={{ width: column.width }}
              >
                {column.render
                  ? column.render((item as any)[column.key], item, index)
                  : (item as any)[column.key]
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook for virtual scrolling state management
export const useVirtualScrolling = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const range = useMemo(() => {
    const config: VirtualizedListConfig = {
      itemHeight,
      containerHeight,
      overscan
    };
    
    return calculateVirtualizedRange(scrollTop, itemCount, config);
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  return {
    scrollTop,
    setScrollTop,
    ...range,
    scrollToIndex,
    scrollToTop
  };
};

export default VirtualizedList; 