// lib/seo.ts
export const seo = ({
	title = "Pediatric Clinic Management System - Comprehensive Child Healthcare",
	description = "Complete pediatric clinic management system for tracking patient growth, immunizations, developmental milestones, and medical records. Streamline your pediatric practice with digital health records.",
	keywords = "pediatric clinic, child healthcare, growth tracking, immunization records, developmental milestones, medical records, clinic management, electronic health records",
	image = "https://your-pediatric-clinic.com/og-image.jpg",
	url = "https://your-pediatric-clinic.com/",
	siteName = "Pediatric Clinic Manager",
	twitterSite = "@yourclinic",
	twitterCreator = "@yourclinic"
}: {
	title?: string;
	description?: string;
	image?: string;
	keywords?: string;
	url?: string;
	siteName?: string;
	twitterSite?: string;
	twitterCreator?: string;
}) => {
	const tags = [
		{ title: `${title} | Pediatric Clinic Management` },
		{ name: "description", content: description },
		{ name: "keywords", content: keywords },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:creator", content: twitterCreator },
		{ name: "twitter:site", content: twitterSite },
		{ name: "twitter:url", content: url },
		{ name: "og:type", content: "website" },
		{ name: "og:title", content: title },
		{ name: "og:description", content: description },
		{ name: "og:url", content: url },
		{ name: "og:site_name", content: siteName },
		...(image
			? [
					{ name: "twitter:image", content: image },
					{ name: "twitter:card", content: "summary_large_image" },
					{ name: "og:image", content: image }
				]
			: [])
	];

	return tags;
};
