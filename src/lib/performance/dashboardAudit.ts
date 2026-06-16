// src/lib/performance/dashboardAudit.ts
interface PerformanceMetric {
	name: string;
	value: number;
	threshold: number;
	passed: boolean;
}

export async function auditDashboardPerformance(): Promise<PerformanceMetric[]> {
	const metrics: PerformanceMetric[] = [];

	// First Contentful Paint
	const fcpEntry = await getFirstContentfulPaint();
	metrics.push({
		name: "First Contentful Paint",
		value: fcpEntry?.startTime || 0,
		threshold: 1800,
		passed: (fcpEntry?.startTime || Number.POSITIVE_INFINITY) < 1800
	});

	// Largest Contentful Paint
	const lcpEntry = await getLargestContentfulPaint();
	metrics.push({
		name: "Largest Contentful Paint",
		value: lcpEntry?.startTime || 0,
		threshold: 2500,
		passed: (lcpEntry?.startTime || Number.POSITIVE_INFINITY) < 2500
	});

	// Time to Interactive
	const tti = await getTimeToInteractive();
	metrics.push({
		name: "Time to Interactive",
		value: tti,
		threshold: 3000,
		passed: tti < 3000
	});

	// Total Blocking Time
	const tbt = await getTotalBlockingTime();
	metrics.push({
		name: "Total Blocking Time",
		value: tbt,
		threshold: 200,
		passed: tbt < 200
	});

	// Cumulative Layout Shift
	const cls = await getCumulativeLayoutShift();
	metrics.push({
		name: "Cumulative Layout Shift",
		value: cls,
		threshold: 0.1,
		passed: cls < 0.1
	});

	return metrics;
}

async function getFirstContentfulPaint(): Promise<PerformanceEntry | null> {
	return new Promise(resolve => {
		if (typeof PerformanceObserver === "undefined") {
			resolve(null);
			return;
		}

		const observer = new PerformanceObserver(list => {
			const entries = list.getEntries();
			const fcp = entries.find(entry => entry.name === "first-contentful-paint");
			if (fcp) {
				observer.disconnect();
				resolve(fcp);
			}
		});

		observer.observe({ type: "paint", buffered: true });

		setTimeout(() => {
			observer.disconnect();
			resolve(null);
		}, 5000);
	});
}

async function getLargestContentfulPaint(): Promise<PerformanceEntry | null> {
	return new Promise(resolve => {
		if (typeof PerformanceObserver === "undefined") {
			resolve(null);
			return;
		}

		const observer = new PerformanceObserver(list => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1];
			if (lastEntry) {
				observer.disconnect();
				resolve(lastEntry);
			}
		});

		observer.observe({ type: "largest-contentful-paint", buffered: true });

		setTimeout(() => {
			observer.disconnect();
			resolve(null);
		}, 5000);
	});
}

async function getTimeToInteractive(): Promise<number> {
	if (typeof performance === "undefined" || !performance.timing) {
		return 0;
	}

	const timing = performance.timing;
	const domInteractive = timing.domInteractive;
	const fetchStart = timing.fetchStart;

	if (!domInteractive || !fetchStart) {
		return 0;
	}

	return domInteractive - fetchStart;
}

async function getTotalBlockingTime(): Promise<number> {
	return new Promise(resolve => {
		if (typeof PerformanceObserver === "undefined") {
			resolve(0);
			return;
		}

		let totalBlockingTime = 0;
		const observer = new PerformanceObserver(list => {
			for (const entry of list.getEntries()) {
				if (entry.entryType === "longtask") {
					totalBlockingTime += entry.duration - 50;
				}
			}
		});

		observer.observe({ type: "longtask", buffered: true });

		setTimeout(() => {
			observer.disconnect();
			resolve(totalBlockingTime);
		}, 10000);
	});
}

async function getCumulativeLayoutShift(): Promise<number> {
	return new Promise(resolve => {
		if (typeof PerformanceObserver === "undefined") {
			resolve(0);
			return;
		}

		let clsValue = 0;
		const observer = new PerformanceObserver(list => {
			for (const entry of list.getEntries()) {
				if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput) {
					clsValue += (entry as PerformanceEntry & { value: number }).value;
				}
			}
		});

		observer.observe({ type: "layout-shift", buffered: true });

		setTimeout(() => {
			observer.disconnect();
			resolve(clsValue);
		}, 10000);
	});
}
