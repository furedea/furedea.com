# ADR-0002: Deploy with Cloudflare Pages

- Status: Accepted
- Date: 2026-08-01

In the context of publishing the static Astro website at `furedea.com`, facing the need for automatic deployments, preview builds, TLS, and apex-domain hosting, we decided for Cloudflare Pages with GitHub integration and against manual uploads to the POSL server or a separate runtime server, to keep deployment aligned with the existing static build and Cloudflare-managed domain, accepting dependence on Cloudflare for production delivery.
