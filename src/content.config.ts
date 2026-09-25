import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Which Epicor client the page applies to. Omit on non-article pages (home, about).
				env: z.enum(['kinetic', 'classic', 'both']).optional(),
				// External material the page was informed by, rendered as a Sources list at the bottom.
				sources: z
					.array(z.object({ title: z.string(), url: z.string().url() }))
					.default([]),
			}),
		}),
	}),
};
