// Content links and images are written root-relative (e.g. /platform/bpm/overview/, /images/x.png) so
// pages don't depend on where the site is hosted. This Sätteri hast plugin prefixes them with Astro's
// `base` at build time.
export function baseLinksPlugin(base = '/') {
	const prefix = base.replace(/\/$/, '');
	const needsPrefix = (url) =>
		prefix &&
		typeof url === 'string' &&
		url.startsWith('/') &&
		!url.startsWith('//') &&
		!url.startsWith(prefix + '/');

	return {
		name: 'epiglossary-base-links',
		element: [
			{
				filter: ['a'],
				visit(node, ctx) {
					const href = node.properties?.href;
					if (needsPrefix(href)) ctx.setProperty(node, 'href', prefix + href);
				},
			},
			{
				filter: ['img'],
				visit(node, ctx) {
					const src = node.properties?.src;
					if (needsPrefix(src)) ctx.setProperty(node, 'src', prefix + src);
				},
			},
		],
	};
}
