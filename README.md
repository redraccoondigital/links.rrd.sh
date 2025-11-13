# links.rrd.sh

A simple linktree alternative for your team, built with Bun and deployed to GitHub Pages.

## Setup

1. Edit [links.yaml](links.yaml) to add your team members and their links
2. Replace placeholder assets in `assets/profiles/` and `assets/icons/` with real images
3. Build the site:
   ```bash
   bun run build
   ```

## Development

Build and watch for changes:
```bash
bun run dev
```

## Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### GitHub Pages Setup

1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Add a CNAME file with your custom domain if needed
4. Configure your DNS to point to GitHub Pages

For the custom domain `links.rrd.sh`, create a [CNAME file](./CNAME) in the root with:
```
links.rrd.sh
```

Then configure your DNS with a CNAME record:
```
links.rrd.sh → your-username.github.io
```

## Structure

- `links.yaml` - Configuration for all pages and links
- `build.js` - Static site generator
- `assets/` - Profile pictures and link icons
- `dist/` - Generated static site (created on build)
