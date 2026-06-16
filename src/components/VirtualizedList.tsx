// src/components/ui/VirtualizedList.tsx

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";

interface VirtualizedListProps<T> {
	items: T[];
	renderItem: (item: T, index: number) => React.ReactNode;
	estimateSize?: number;
	className?: string;
	overscan?: number;
	loading?: boolean;
	loadingComponent?: React.ReactNode;
	emptyComponent?: React.ReactNode;
}

export function VirtualizedList<T>({
	items,
	renderItem,
	estimateSize = 80,
	className = "h-[400px]",
	overscan = 5,
	loading = false,
	loadingComponent,
	emptyComponent
}: VirtualizedListProps<T>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver(entries => {
			const entry = entries[0];
			if (entry) {
				setDimensions({
					width: entry.contentRect.width,
					height: entry.contentRect.height
				});
			}
		});

		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	const rowVirtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => containerRef.current,
		estimateSize: () => estimateSize,
		overscan,
		measureElement: undefined
	});

	if (loading) {
		return loadingComponent ? <>{loadingComponent}</> : null;
	}

	if (items.length === 0 && emptyComponent) {
		return <>{emptyComponent}</>;
	}

	return (
		<div
			className={`overflow-auto ${className}`}
			ref={containerRef}
			style={{
				height: "100%",
				maxHeight: dimensions.height
			}}
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: "100%",
					position: "relative"
				}}
			>
				{rowVirtualizer.getVirtualItems().map(virtualItem => {
					const item = items[virtualItem.index];
					return (
						<div
							key={virtualItem.key}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(${virtualItem.start}px)`
							}}
						>
							{renderItem(item, virtualItem.index)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
