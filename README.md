# Rotina Mídia

Homepage da Rotina Mídia (produtora audiovisual, Luanda / São Paulo).

Stack: React 19, Vite 7, Tailwind CSS 4, Motion, Lenis, Three.js, GSAP. Gestor de pacotes: Bun.

```sh
bun install
bun run dev      # http://localhost:5173
bun run build    # gera dist/
```

Deploy: Render, Static Site `rotina-midia` (build `bun install && bun run build`, publish `dist`).

Páginas (Vite multi-page):

- `/` escolha de proposta (`src/home`)
- `/proposta-1/` Cartaz (`src/p1`)
- `/proposta-2/` Tempo, em Three.js + GSAP (`src/p2`)

- Conteúdo (trabalhos, filmografia, depoimentos, contactos): `src/shared/data.ts`
- Imagens: `public/img` (WebP 720/1280/1920)
- Decisões de design: `DESIGN.md`; contexto do produto: `PRODUCT.md`
