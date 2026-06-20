# Stable URL Guidelines for Curated Resources

When adding URLs to any curated data (e.g., `data/onet/*.json` or seed files used by `contextBuilder.ts`), follow these rules:

1. **Prefer evergreen / top‑level URLs**
   - Use a home‑page or search page instead of a deep course page.
   - Example: `https://www.coursera.org/search?query=search` instead of a specific course URL.

2. **Prefer official documentation roots**
   - Use `https://developer.mozilla.org/en-US/docs/Web/JavaScript` rather than a sub‑section that may be re‑structured later.

3. **Prefer GitHub repositories** when the content is open‑source.

4. **If only a specific article exists**, add a short `fallbackSearchTerm` field that will be used by `generateFallbackSearchUrl` if the link later breaks.

These guidelines help keep the RAG context reliable and reduce hallucinated or stale links.
