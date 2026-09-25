// Sidebar layout. Each section maps to a folder under src/content/docs; each area to a subfolder whose
// pages are listed automatically. Areas (and loose pages) only appear once they have content, so a new
// area can be declared here before anyone has written it.
import fs from 'node:fs';

const docsDir = new URL('./content/docs/', import.meta.url);
const hasPages = (dir) => {
	try {
		return fs.readdirSync(new URL(dir + '/', docsDir)).some((f) => /\.mdx?$/.test(f));
	} catch {
		return false;
	}
};
const pageExists = (slug) => ['.md', '.mdx'].some((ext) => fs.existsSync(new URL(slug + ext, docsDir)));

const sections = [
	{
		label: 'Kinetic',
		dir: 'kinetic',
		areas: [
			['Application Studio', 'application-studio'],
			['MES', 'mes'],
			['Administration', 'administration'],
		],
	},
	{
		label: 'Classic (E10)',
		dir: 'classic',
		pages: [['Migrating to Kinetic', 'classic/migrating-to-kinetic']],
		areas: [
			['Customization', 'customization'],
			['Dashboards', 'dashboards'],
			['MES', 'mes'],
			['Administration', 'administration'],
		],
	},
	{
		label: 'Platform',
		dir: 'platform',
		areas: [
			['BPM', 'bpm'],
			['Epicor Functions', 'functions'],
			['BAQ', 'baq'],
			['Reporting', 'reporting'],
			['REST API', 'rest-api'],
			['DMT', 'dmt'],
			['Bartender & Labels', 'bartender'],
			['System Admin', 'system-admin'],
		],
	},
	{
		label: 'Processes',
		dir: 'processes',
		areas: [
			['Jobs & Manufacturing', 'jobs-manufacturing'],
			['Scheduling', 'scheduling'],
			['Inventory', 'inventory'],
			['Purchasing', 'purchasing'],
			['Sales & Shipping', 'sales-shipping'],
			['Finance', 'finance'],
			['Quality & RMA', 'quality-rma'],
			['Serial Numbers', 'serial-numbers'],
		],
	},
];

const sectionItems = (s) => [
	...(s.pages ?? []).filter(([, slug]) => pageExists(slug)).map(([label, slug]) => ({ label, slug })),
	...s.areas
		.filter(([, dir]) => hasPages(`${s.dir}/${dir}`))
		.map(([label, dir]) => ({
			label,
			collapsed: true,
			items: [{ autogenerate: { directory: `${s.dir}/${dir}` } }],
		})),
];

export const sidebar = [
	{
		label: 'Start Here',
		items: [
			{ label: 'About Epiglossary', slug: 'start/about' },
			{ label: 'Kinetic vs Classic', slug: 'start/kinetic-vs-classic' },
		],
	},
	...sections.map((s) => ({ label: s.label, items: sectionItems(s) })).filter((s) => s.items.length > 0),
	{
		label: 'Reference',
		items: [{ autogenerate: { directory: 'reference' } }],
	},
];
