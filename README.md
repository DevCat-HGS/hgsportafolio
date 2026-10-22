# hgsportafolio.site

Código del portafolio de Harol Guerrero Salgado: [hgsportafolio.site](https://hgsportafolio.site). La documentación técnica está en [docs.hgsportafolio.site](https://docs.hgsportafolio.site) y el caso completo, en [hgsportafolio.site/portafolio/](https://hgsportafolio.site/portafolio/).

Este repositorio es un **espejo de solo lectura**: se actualiza solo con cada cambio que llega a producción, un commit aquí por cada commit allá. No recibe pull requests y sus Actions están apagadas; los workflows de `.github/workflows/` están para leerse, y corren en el repositorio de origen.

## Qué hay

- `portfolio/`: el sitio en React 19, TypeScript y Vite, en español e inglés. Contenido en JSON (`src/content/data/`), SEO generado en el build (`seo/`), scripts de imágenes, Lighthouse y la imagen para compartir (`scripts/`), pruebas unitarias (`tests/`) y de navegador con axe y teclado (`e2e/`).
- `.github/workflows/`: los 6 workflows del sitio (CI con Lighthouse y accesibilidad, imágenes, imagen para compartir, enlaces rotos, escaneo de secretos y datos de GitHub).

## Qué no hay, a propósito

El panel de administración, sus pruebas y sus workflows; los datos del CV, y el perfil de GitHub. Por eso aquí hay 6 de los 15 workflows del proyecto, y las pruebas del admin no están en `portfolio/tests/`.

## Correrlo

```bash
cd portfolio
npm ci
npm run dev        # http://localhost:5173
npm test           # pruebas unitarias
npm run build
```

---

The code of Harol Guerrero Salgado's portfolio. This is a read-only mirror, updated on every change that ships: the admin panel, résumé data and GitHub profile live in a private repository and are left out on purpose.
