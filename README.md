# Epiglossary

An unofficial, community-written guide to Epicor Kinetic and Epicor 10, built with [Astro Starlight](https://starlight.astro.build).

Live site: https://beans-real.github.io/Epiglossary/

## Working on the site

```sh
npm install
npm run dev      # local preview at http://localhost:4321/Epiglossary/
npm run build    # production build into ./dist
```

- Pages live in `src/content/docs/`, one Markdown file per page. The folder decides the section:
  `kinetic/`, `classic/`, `platform/`, `processes/`, `reference/`.
- New area folders need an entry in `src/sidebar.mjs`.
- Every page must follow [STYLE_GUIDE.md](STYLE_GUIDE.md): written in your own words, with no company,
  customer or personal identifiers, and an `env` of `kinetic`, `classic` or `both`.

Pushing to `main` deploys automatically via GitHub Actions.

Epiglossary is not affiliated with, endorsed by, or supported by Epicor Software Corporation.
