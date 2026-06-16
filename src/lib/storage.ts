// lib/storage.ts
import * as Minio from "minio";

// Initialize MinIO client
export const minioClient = new Minio.Client({
	endPoint: process.env.MINIO_ENDPOINT || "localhost",
	port: Number(process.env.MINIO_PORT) || 9000,
	useSSL: process.env.MINIO_USE_SSL === "true",
	accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
	secretKey: process.env.MINIO_SECRET_KEY || "minioadmin"
});

const BUCKET_NAME = "clinic-avatars";
const PRESIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

// Ensure bucket exists on startup
export async function ensureBucket() {
	const exists = await minioClient.bucketExists(BUCKET_NAME);
	if (!exists) {
		await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
		// Set bucket policy for public read (optional - use presigned URLs for security)
		const policy = {
			Version: "2012-10-17",
			Statement: [
				{
					Effect: "Allow",
					Principal: { AWS: ["*"] },
					Action: ["s3:GetObject"],
					Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
				}
			]
		};
		await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
	}
}

// Generate presigned URL for upload
export async function getPresignedUploadUrl(objectName: string, _contentType: string): Promise<string> {
	await ensureBucket();
	return minioClient.presignedPutObject(BUCKET_NAME, objectName, PRESIGNED_URL_EXPIRY);
}

// Generate presigned URL for download/view
export async function getPresignedDownloadUrl(objectName: string): Promise<string> {
	return minioClient.presignedGetObject(BUCKET_NAME, objectName, PRESIGNED_URL_EXPIRY);
}

// Delete an object
export async function deleteObject(objectName: string): Promise<void> {
	await minioClient.removeObject(BUCKET_NAME, objectName);
}

// Get object info
export async function getObjectInfo(objectName: string) {
	return minioClient.statObject(BUCKET_NAME, objectName);
}

// Upload file directly (server-side)
export async function uploadFile(objectName: string, fileBuffer: Buffer, contentType: string) {
	await ensureBucket();
	return minioClient.putObject(BUCKET_NAME, objectName, fileBuffer, undefined, {
		"Content-Type": contentType
	});
}
