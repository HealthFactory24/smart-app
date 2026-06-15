import { createIsomorphicFn } from "@tanstack/react-start";

import type { DbDoctor, DbPatient } from "../db/schema";
import { getEagerImageCount } from "./get-eager-image-count";
import { getOptimizedUrl } from "./image-optimization";

export interface SeenSetManager {
	isSeen: (src: string) => boolean;
	markSeen: (src: string) => void;
}

export type PrefetchImage = {
	src: string;
	srcset?: string | null;
	sizes?: string | null;
	loading?: string;
	width?: number;
	height?: number;
	quality?: number;
	alt?: string;
};

/**
 * Prefetch patient profile images for quick loading in lists and dashboards
 */
export const prefetchPatientImages = createIsomorphicFn().client(
	async (patients: DbPatient[], seenManager: SeenSetManager) => {
		const eagerCount = getEagerImageCount();
		let count = 0;
		const images: PrefetchImage[] = patients
			.filter(patient => patient.image)
			.map(patient => ({
				src: getOptimizedUrl(patient.image ?? "/placeholder-patient.webp", 64, 64, 70),
				alt: `${patient.firstName} ${patient.lastName}`,
				loading: count++ < eagerCount ? "eager" : "lazy",
				width: 64,
				height: 64,
				quality: 70
			}));

		prefetchImages(images, seenManager);
	}
);

/**
 * Prefetch doctor profile images for appointments and directory
 */
export const prefetchDoctorImages = createIsomorphicFn().client(
	async (doctors: DbDoctor[], seenManager: SeenSetManager) => {
		const eagerCount = getEagerImageCount();
		let count = 0;
		const images: PrefetchImage[] = doctors
			.filter(doctor => doctor.img)
			.map(doctor => ({
				src: getOptimizedUrl(doctor.img ?? "/placeholder-doctor.webp", 64, 64, 70),
				alt: `Dr. ${doctor.name}`,
				loading: count++ < eagerCount ? "eager" : "lazy",
				width: 64,
				height: 64,
				quality: 70
			}));

		prefetchImages(images, seenManager);
	}
);

/**
 * Prefetch medical record document thumbnails or icons
 */
export const prefetchMedicalRecordImages = createIsomorphicFn().client(
	async (records: Array<{ id: string; thumbnailUrl?: string; type: string }>, seenManager: SeenSetManager) => {
		const eagerCount = getEagerImageCount();
		let count = 0;
		const images: PrefetchImage[] = records
			.filter(record => record.thumbnailUrl)
			.map(record => ({
				src: getOptimizedUrl(record.thumbnailUrl ?? "/placeholder-medical.webp", 48, 48, 65),
				alt: `Medical record ${record.type}`,
				loading: count++ < eagerCount ? "eager" : "lazy",
				width: 48,
				height: 48,
				quality: 65
			}));

		prefetchImages(images, seenManager);
	}
);

/**
 * Prefetch vital signs chart thumbnails or trend images
 */
export const prefetchVitalSignsCharts = createIsomorphicFn().client(
	async (
		vitalSignsData: Array<{ patientId: string; chartUrl?: string; date: Date }>,
		seenManager: SeenSetManager
	) => {
		const eagerCount = getEagerImageCount();
		let count = 0;
		const images: PrefetchImage[] = vitalSignsData
			.filter(data => data.chartUrl)
			.map(data => ({
				src: getOptimizedUrl(data.chartUrl ?? "/placeholder-chart.webp", 400, 300, 60),
				alt: `Vital signs chart for patient ${data.patientId}`,
				loading: count++ < eagerCount ? "eager" : "lazy",
				width: 400,
				height: 300,
				quality: 60
			}));

		prefetchImages(images, seenManager);
	}
);

/**
 * Prefetch service/feature icons for the clinic services page
 */
export const prefetchServiceIcons = createIsomorphicFn().client(
	async (services: Array<{ id: string; name: string; iconUrl?: string }>, seenManager: SeenSetManager) => {
		const eagerCount = getEagerImageCount();
		let count = 0;
		const images: PrefetchImage[] = services
			.filter(service => service.iconUrl)
			.map(service => ({
				src: getOptimizedUrl(service.iconUrl ?? "/placeholder-service.webp", 48, 48, 80),
				alt: service.name,
				loading: count++ < eagerCount ? "eager" : "lazy",
				width: 48,
				height: 48,
				quality: 80
			}));

		prefetchImages(images, seenManager);
	}
);

/**
 * Prefetch immunization chart images
 */
export const prefetchImmunizationImages = createIsomorphicFn().client(
	async (
		immunizations: Array<{ id: string; vaccineName: string; chartUrl?: string }>,
		seenManager: SeenSetManager
	) => {
		const eagerCount = getEagerImageCount();
		let count = 0;
		const images: PrefetchImage[] = immunizations
			.filter(imm => imm.chartUrl)
			.map(imm => ({
				src: getOptimizedUrl(imm.chartUrl ?? "/placeholder-immunization.webp", 300, 200, 65),
				alt: `${imm.vaccineName} immunization chart`,
				loading: count++ < eagerCount ? "eager" : "lazy",
				width: 300,
				height: 200,
				quality: 65
			}));

		prefetchImages(images, seenManager);
	}
);

/**
 * Prefetch growth chart thumbnails for pediatric tracking
 */
export const prefetchGrowthChartImages = createIsomorphicFn().client(
	async (growthData: Array<{ patientId: string; chartUrl?: string; date: Date }>, seenManager: SeenSetManager) => {
		const eagerCount = getEagerImageCount();
		let count = 0;
		const images: PrefetchImage[] = growthData
			.filter(data => data.chartUrl)
			.map(data => ({
				src: getOptimizedUrl(data.chartUrl ?? "/placeholder-growth.webp", 400, 300, 60),
				alt: `Growth chart for patient ${data.patientId}`,
				loading: count++ < eagerCount ? "eager" : "lazy",
				width: 400,
				height: 300,
				quality: 60
			}));

		prefetchImages(images, seenManager);
	}
);

/**
 * Generic prefetch function for any image array
 */
export function prefetchImages(images: PrefetchImage[] | undefined, seenManager: SeenSetManager) {
	if (!images || images.length === 0) return;

	for (const image of images) {
		if (image.loading === "lazy" || seenManager.isSeen(image.src)) continue;

		const img = new Image();
		img.decoding = "async";
		img.fetchPriority = "low";
		if (image.sizes) img.sizes = image.sizes;
		if (image.srcset) img.srcset = image.srcset;
		if (image.alt) img.alt = image.alt;

		seenManager.markSeen(image.src);
		img.src = image.src;
	}
}

/**
 * Helper to prefetch all images for a patient dashboard at once
 */
export const prefetchPatientDashboardImages = createIsomorphicFn().client(
	async (
		data: {
			patient: DbPatient;
			doctor?: DbDoctor;
			recentAppointments?: Array<{ doctor?: DbDoctor }>;
		},
		seenManager: SeenSetManager
	) => {
		const images: PrefetchImage[] = [];

		// Patient profile image
		if (data.patient.image) {
			images.push({
				src: getOptimizedUrl(data.patient.image, 128, 128, 75),
				alt: `${data.patient.firstName} ${data.patient.lastName}`,
				loading: "eager",
				width: 128,
				height: 128,
				quality: 75
			});
		}

		// Doctor image
		if (data.doctor?.img) {
			images.push({
				src: getOptimizedUrl(data.doctor.img, 64, 64, 70),
				alt: `Dr. ${data.doctor.name}`,
				loading: "eager",
				width: 64,
				height: 64,
				quality: 70
			});
		}

		// Appointment doctor images
		if (data.recentAppointments) {
			let count = 0;
			const eagerCount = getEagerImageCount();
			for (const apt of data.recentAppointments) {
				if (apt.doctor?.img) {
					images.push({
						src: getOptimizedUrl(apt.doctor.img, 48, 48, 65),
						alt: `Dr. ${apt.doctor.name}`,
						loading: count++ < eagerCount ? "eager" : "lazy",
						width: 48,
						height: 48,
						quality: 65
					});
				}
			}
		}

		prefetchImages(images, seenManager);
	}
);
