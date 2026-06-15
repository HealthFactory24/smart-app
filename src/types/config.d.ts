/* eslint-disable */
/** biome-ignore-all lint/suspicious/noExplicitAny: <ok> */
// Generated for local development with Bun and LibSQL
// Supports both Cloudflare Workers and local development environments

export interface GlobalProps {
	mainModule: typeof import("../../data/server");
}

export interface Env {
	CACHE: KVNamespace;
	BUCKET: R2Bucket;
	// Use local LibSQL for development, D1 for production
	tanstack_fast_db: D1Database | LocalLibSQLDatabase;
	CART_READ_LIMITER: RateLimit;
	CART_WRITE_LIMITER: RateLimit;
	API_LIMITER: RateLimit;
	AUTH_SECRET: string;
	// Local development flags
	ENVIRONMENT?: "development" | "production";
	DATABASE_URL?: string;
}

// Local LibSQL Database interface for development
interface LocalLibSQLDatabase {
	prepare(query: string): LocalLibSQLPreparedStatement;
	batch<T = unknown>(statements: LocalLibSQLPreparedStatement[]): Promise<D1Result<T>[]>;
	exec(query: string): Promise<D1ExecResult>;
}

interface LocalLibSQLPreparedStatement {
	bind(...values: unknown[]): this;
	first<T = unknown>(colName?: string): Promise<T | null>;
	run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
	all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
	raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<T[] | [string[], ...T[]]>;
}

// D1 interfaces for production
interface D1Meta {
	duration: number;
	size_after: number;
	rows_read: number;
	rows_written: number;
	last_row_id: number;
	changed_db: boolean;
	changes: number;
	served_by_region?: string;
	served_by_primary?: boolean;
	timings?: {
		sql_duration_ms: number;
	};
	total_attempts?: number;
}

interface D1Response {
	success: true;
	meta: D1Meta & Record<string, unknown>;
	error?: never;
}

type D1Result<T = unknown> = D1Response & {
	results: T[];
};

interface D1ExecResult {
	count: number;
	duration: number;
}

interface D1Database {
	prepare(query: string): D1PreparedStatement;
	batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
	exec(query: string): Promise<D1ExecResult>;
	withSession(constraintOrBookmark?: string): D1DatabaseSession;
}

interface D1DatabaseSession {
	prepare(query: string): D1PreparedStatement;
	batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
	getBookmark(): string | null;
}

interface D1PreparedStatement {
	bind(...values: unknown[]): this;
	first<T = unknown>(colName?: string): Promise<T | null>;
	run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
	all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
	raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<T[] | [string[], ...T[]]>;
}

// KV namespace interface
interface KVNamespace<Key extends string = string> {
	get(key: Key, options?: Partial<KVNamespaceGetOptions<undefined>>): Promise<string | null>;
	get(key: Key, type: "text"): Promise<string | null>;
	get<ExpectedValue = unknown>(key: Key, type: "json"): Promise<ExpectedValue | null>;
	get(key: Key, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
	get(key: Key, type: "stream"): Promise<ReadableStream | null>;
	put(
		key: Key,
		value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
		options?: KVNamespacePutOptions
	): Promise<void>;
	delete(key: Key): Promise<void>;
	list<Metadata = unknown>(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult<Metadata, Key>>;
	getWithMetadata<Metadata = unknown>(
		key: Key,
		options?: Partial<KVNamespaceGetOptions<undefined>>
	): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
}

interface KVNamespaceGetOptions<Type> {
	type: Type;
	cacheTtl?: number;
}

interface KVNamespacePutOptions {
	expiration?: number;
	expirationTtl?: number;
	metadata?: any | null;
}

interface KVNamespaceListOptions {
	limit?: number;
	prefix?: string | null;
	cursor?: string | null;
}

interface KVNamespaceListKey<Metadata, Key extends string = string> {
	name: Key;
	expiration?: number;
	metadata?: Metadata;
}

type KVNamespaceListResult<Metadata, Key extends string = string> =
	| {
			list_complete: false;
			keys: KVNamespaceListKey<Metadata, Key>[];
			cursor: string;
			cacheStatus: string | null;
	  }
	| {
			list_complete: true;
			keys: KVNamespaceListKey<Metadata, Key>[];
			cacheStatus: string | null;
	  };

interface KVNamespaceGetWithMetadataResult<Value, Metadata> {
	value: Value | null;
	metadata: Metadata | null;
	cacheStatus: string | null;
}

// R2 bucket interface
interface R2Bucket {
	head(key: string): Promise<R2Object | null>;
	get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
	put(
		key: string,
		value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
		options?: R2PutOptions
	): Promise<R2Object>;
	delete(keys: string | string[]): Promise<void>;
	list(options?: R2ListOptions): Promise<R2Objects>;
}

interface R2Object {
	readonly key: string;
	readonly version: string;
	readonly size: number;
	readonly etag: string;
	readonly httpEtag: string;
	readonly uploaded: Date;
	readonly httpMetadata?: R2HTTPMetadata;
	readonly customMetadata?: Record<string, string>;
	readonly range?: R2Range;
	readonly storageClass: string;
	writeHttpMetadata(headers: Headers): void;
}

interface R2ObjectBody extends R2Object {
	readonly body: ReadableStream;
	readonly bodyUsed: boolean;
	arrayBuffer(): Promise<ArrayBuffer>;
	bytes(): Promise<Uint8Array>;
	text(): Promise<string>;
	json<T>(): Promise<T>;
	blob(): Promise<Blob>;
}

interface R2GetOptions {
	onlyIf?: R2Conditional | Headers;
	range?: R2Range | Headers;
	ssecKey?: ArrayBuffer | string;
}

interface R2PutOptions {
	onlyIf?: R2Conditional | Headers;
	httpMetadata?: R2HTTPMetadata | Headers;
	customMetadata?: Record<string, string>;
	md5?: ArrayBuffer | ArrayBufferView | string;
	storageClass?: string;
	ssecKey?: ArrayBuffer | string;
}

interface R2Conditional {
	etagMatches?: string;
	etagDoesNotMatch?: string;
	uploadedBefore?: Date;
	uploadedAfter?: Date;
}

type R2Range =
	| {
			offset: number;
			length?: number;
	  }
	| {
			offset?: number;
			length: number;
	  }
	| {
			suffix: number;
	  };

interface R2HTTPMetadata {
	contentType?: string;
	contentLanguage?: string;
	contentDisposition?: string;
	contentEncoding?: string;
	cacheControl?: string;
	cacheExpiry?: Date;
}

interface R2ListOptions {
	limit?: number;
	prefix?: string;
	cursor?: string;
	delimiter?: string;
	startAfter?: string;
	include?: ("httpMetadata" | "customMetadata")[];
}

type R2Objects = {
	objects: R2Object[];
	delimitedPrefixes: string[];
} & (
	| {
			truncated: true;
			cursor: string;
	  }
	| {
			truncated: false;
	  }
);

// Rate limit interface
interface RateLimitOptions {
	key: string;
}

interface RateLimitOutcome {
	success: boolean;
}

interface RateLimit {
	limit(options: RateLimitOptions): Promise<RateLimitOutcome>;
}

// Base Worker types
interface ExecutionContext<Props = unknown> {
	waitUntil(promise: Promise<any>): void;
	passThroughOnException(): void;
	readonly props: Props;
}

export interface ExportedHandler<Env = unknown> {
	fetch?: (request: Request, env: Env, ctx: ExecutionContext) => Response | Promise<Response>;
	scheduled?: (controller: ScheduledController, env: Env, ctx: ExecutionContext) => void | Promise<void>;
	queue?: (batch: MessageBatch<unknown>, env: Env, ctx: ExecutionContext) => void | Promise<void>;
}

interface ScheduledController {
	readonly scheduledTime: number;
	readonly cron: string;
	noRetry(): void;
}

interface MessageBatch<Body = unknown> {
	readonly messages: readonly Message<Body>[];
	readonly queue: string;
	retryAll(options?: QueueRetryOptions): void;
	ackAll(): void;
}

interface Message<Body = unknown> {
	readonly id: string;
	readonly timestamp: Date;
	readonly body: Body;
	readonly attempts: number;
	retry(options?: QueueRetryOptions): void;
	ack(): void;
}

interface QueueRetryOptions {
	delaySeconds?: number;
}

// Request and Response types
type BodyInit = ReadableStream<Uint8Array> | string | ArrayBuffer | ArrayBufferView | Blob | URLSearchParams | FormData;

interface Response {
	status: number;
	statusText: string;
	headers: Headers;
	ok: boolean;
	redirected: boolean;
	url: string;
	clone(): Response;
	arrayBuffer(): Promise<ArrayBuffer>;
	text(): Promise<string>;
	json<T>(): Promise<T>;
	blob(): Promise<Blob>;
	body: ReadableStream | null;
	bodyUsed: boolean;
}

declare let Response: {
	prototype: Response;
	new (body?: BodyInit | null, init?: ResponseInit): Response;
	error(): Response;
	redirect(url: string, status?: number): Response;
	json(any: any, init?: ResponseInit): Response;
};

interface ResponseInit {
	status?: number;
	statusText?: string;
	headers?: HeadersInit;
}

type HeadersInit = Headers | Iterable<Iterable<string>> | Record<string, string>;

interface Headers {
	get(name: string): string | null;
	has(name: string): boolean;
	set(name: string, value: string): void;
	append(name: string, value: string): void;
	delete(name: string): void;
	forEach(callback: (value: string, key: string, parent: Headers) => void): void;
}

declare let Headers: {
	prototype: Headers;
	new (init?: HeadersInit): Headers;
};

interface Request {
	method: string;
	url: string;
	headers: Headers;
	body: ReadableStream | null;
	bodyUsed: boolean;
	clone(): Request;
	arrayBuffer(): Promise<ArrayBuffer>;
	text(): Promise<string>;
	json<T>(): Promise<T>;
	blob(): Promise<Blob>;
}

declare let Request: {
	prototype: Request;
	new (input: string | Request, init?: RequestInit): Request;
};

interface RequestInit {
	method?: string;
	headers?: HeadersInit;
	body?: BodyInit | null;
}

// Fetch function
declare function fetch(input: string | Request, init?: RequestInit): Promise<Response>;

// Utility functions
declare function btoa(data: string): string;
declare function atob(data: string): string;
declare function setTimeout(callback: (...args: any[]) => void, msDelay?: number): number;
declare function clearTimeout(timeoutId: number | null): void;
declare function setInterval(callback: (...args: any[]) => void, msDelay?: number): number;
declare function clearInterval(timeoutId: number | null): void;

// Console
interface Console {
	log(...data: any[]): void;
	error(...data: any[]): void;
	warn(...data: any[]): void;
	info(...data: any[]): void;
	debug(...data: any[]): void;
}

declare const console: Console;

// Crypto
interface Crypto {
	getRandomValues<T extends Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array>(
		buffer: T
	): T;
	randomUUID(): string;
	subtle: SubtleCrypto;
}

interface SubtleCrypto {
	digest(algorithm: string | object, data: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer>;
}

declare const crypto: Crypto;

// Text encoding
interface TextEncoder {
	encode(input?: string): Uint8Array;
	encoding: string;
}

interface TextDecoder {
	decode(input?: ArrayBuffer | ArrayBufferView): string;
	encoding: string;
	fatal: boolean;
	ignoreBOM: boolean;
}

declare let TextEncoder: {
	prototype: TextEncoder;
	new (): TextEncoder;
};

declare let TextDecoder: {
	prototype: TextDecoder;
	new (label?: string, options?: { fatal?: boolean; ignoreBOM?: boolean }): TextDecoder;
};

// URL
interface URL {
	href: string;
	protocol: string;
	host: string;
	hostname: string;
	port: string;
	pathname: string;
	search: string;
	hash: string;
	origin: string;
	searchParams: URLSearchParams;
	toString(): string;
}

declare let URL: {
	prototype: URL;
	new (url: string | URL, base?: string | URL): URL;
};

interface URLSearchParams {
	append(name: string, value: string): void;
	delete(name: string): void;
	get(name: string): string | null;
	has(name: string): boolean;
	set(name: string, value: string): void;
	toString(): string;
}

declare let URLSearchParams: {
	prototype: URLSearchParams;
	new (init?: string | URLSearchParams | Record<string, string>): URLSearchParams;
};

// Additional utility types
interface Blob {
	readonly size: number;
	readonly type: string;
	slice(start?: number, end?: number, type?: string): Blob;
	arrayBuffer(): Promise<ArrayBuffer>;
	text(): Promise<string>;
	stream(): ReadableStream;
}

declare let Blob: {
	prototype: Blob;
	new (blobParts?: (ArrayBuffer | ArrayBufferView | Blob | string)[], options?: { type?: string }): Blob;
};

interface File extends Blob {
	readonly name: string;
	readonly lastModified: number;
}

declare let File: {
	prototype: File;
	new (
		fileBits: (ArrayBuffer | ArrayBufferView | Blob | string)[],
		fileName: string,
		options?: { type?: string; lastModified?: number }
	): File;
};

interface FormData {
	append(name: string, value: string | Blob, fileName?: string): void;
	delete(name: string): void;
	get(name: string): string | File | null;
	has(name: string): boolean;
	set(name: string, value: string | Blob, fileName?: string): void;
}

declare let FormData: {
	prototype: FormData;
	new (): FormData;
};

// ReadableStream types
interface ReadableStream<R = any> {
	getReader(): ReadableStreamDefaultReader<R>;
	cancel(reason?: any): Promise<void>;
	pipeTo(destination: WritableStream<R>): Promise<void>;
	tee(): [ReadableStream<R>, ReadableStream<R>];
	locked: boolean;
}

interface ReadableStreamDefaultReader<R = any> {
	read(): Promise<ReadableStreamReadResult<R>>;
	releaseLock(): void;
	closed: Promise<void>;
	cancel(reason?: any): Promise<void>;
}

type ReadableStreamReadResult<R> =
	| {
			done: false;
			value: R;
	  }
	| {
			done: true;
			value?: undefined;
	  };

declare let ReadableStream: {
	prototype: ReadableStream;
	new <R = any>(underlyingSource?: object, strategy?: object): ReadableStream<R>;
};

interface WritableStream<W = any> {
	getWriter(): WritableStreamDefaultWriter<W>;
	close(): Promise<void>;
	abort(reason?: any): Promise<void>;
	locked: boolean;
}

interface WritableStreamDefaultWriter<W = any> {
	write(chunk?: W): Promise<void>;
	close(): Promise<void>;
	abort(reason?: any): Promise<void>;
	ready: Promise<void>;
	closed: Promise<void>;
	releaseLock(): void;
	desiredSize: number | null;
}

declare let WritableStream: {
	prototype: WritableStream;
	new <W = any>(underlyingSink?: object, strategy?: object): WritableStream<W>;
};

/** Bun and Node.js compatibility */
declare const Bun: {
	sql(query: TemplateStringsArray | string): any;
	readonly env: Record<string, string>;
};

declare module "bun:sqlite" {
	export class Database {
		constructor(filename: string, options?: { readonly?: boolean; create?: boolean });
		prepare(query: string): Statement;
		exec(query: string): void;
		close(): void;
	}

	export class Statement {
		run(...params: any[]): { changes: number; lastInsertRowid: number };
		get(...params: any[]): any;
		all(...params: any[]): any[];
		bind(...params: any[]): Statement;
	}
}

// Helper function to detect environment
declare function isDevelopment(): boolean;
