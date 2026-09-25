## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Content rules

Epiglossary is a public wiki. Before writing or editing any page in `src/content/docs/`, read and follow
[STYLE_GUIDE.md](STYLE_GUIDE.md). In particular: never paste source text verbatim, never publish company,
customer or personal identifiers, and set `env` (kinetic | classic | both) in every article's frontmatter.
Link between pages with root-relative URLs (`/platform/bpm/overview/`); the base path is added at build time.
