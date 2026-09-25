// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import { baseLinksPlugin } from './src/plugins/base-links.mjs';
import { sidebar } from './src/sidebar.mjs';

const site = 'https://beans-real.github.io';
const base = '/Epiglossary';

// https://astro.build/config
export default defineConfig({
	site,
	base,
	markdown: {
		processor: satteri({ hastPlugins: [baseLinksPlugin(base)] }),
	},
	integrations: [
		starlight({
			title: 'Epiglossary',
			description:
				'An unofficial, community-written guide to Epicor Kinetic and Epicor 10: BPMs, Application Studio, BAQs, reporting and the business processes behind them.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/beans-real/Epiglossary' }],
			editLink: { baseUrl: 'https://github.com/beans-real/Epiglossary/edit/main/' },
			lastUpdated: true,
			customCss: ['./src/styles/custom.css'],
			components: {
				PageTitle: './src/components/PageTitle.astro',
				MarkdownContent: './src/components/MarkdownContent.astro',
			},
			sidebar,
		}),
	],
});
