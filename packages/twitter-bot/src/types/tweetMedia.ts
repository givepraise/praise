interface IMediaPublicMetrics {
	view_count: number;
}

interface IMediaVariant {
	bit_rate: number;
	content_type: string;
	url: string;
}

export interface IMedia {
	media_key: string;
	type: string;
	url?: string;
	preview_image_url?: string;
	variants?: IMediaVariant[];
	duration_ms?: number;
	height?: number;
	width?: number;
	alt_text?: string;
	public_metrics?: IMediaPublicMetrics;
}
