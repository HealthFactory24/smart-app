import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [{ title: "About" }]
	}),
	component: AboutPage
});

function AboutPage() {
	return (
		<div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
			<div className='mx-auto max-w-3xl'>
				<div className='mb-12 text-center'>
					<h1 className='font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>About</h1>
					<p className='mt-4 text-lg text-muted-foreground'>Learn more about this project</p>
				</div>
				<div className='space-y-8'>
					<section className='rounded-2xl border bg-card p-8 shadow-sm'>
						<h2 className='mb-4 font-semibold text-foreground text-xl'>Open-Source Project</h2>
						<p className='text-lg text-muted-foreground leading-relaxed'>
							This is an open-source admin dashboard starter built with modern web technologies. It
							provides a solid foundation for building powerful admin interfaces and dashboards. The
							source code is freely available for developers to use, modify, and distribute.
						</p>
					</section>
					<section className='rounded-2xl border bg-card p-8 shadow-sm'>
						<h2 className='mb-4 font-semibold text-foreground text-xl'>Demo Purpose</h2>
						<p className='text-lg text-muted-foreground leading-relaxed'>
							This application serves as a demo for demonstration purposes. It showcases the features,
							components, and capabilities of the admin dashboard starter. Feel free to explore the
							interface, test the functionality, and evaluate if it meets your project requirements.
						</p>
					</section>
					<section className='rounded-2xl border bg-card p-8 shadow-sm'>
						<h2 className='mb-4 font-semibold text-foreground text-xl'>Data Privacy</h2>
						<p className='text-lg text-muted-foreground leading-relaxed'>
							We take your privacy seriously. No personal data is misused, shared, or sold to third
							parties. Any information collected during your use of this demo application is used solely
							for the purpose of providing the demonstration experience and is handled in accordance with
							best practices for data protection.
						</p>
					</section>
				</div>
				<div className='mt-12 text-center'>
					<p className='text-muted-foreground text-sm'>
						Built with TanStack Start, Tailwind CSS, and shadcn/ui
					</p>
				</div>
			</div>
		</div>
	);
}
