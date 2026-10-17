// Generuje strony statyczne z bloków tresc/*.md (kontrakt T098: markdown → HTML wg prostych reguł).
// Użycie: node scripts/build.mjs [RRRR-MM-DD]  (data publikacji = data scalenia PR; domyślnie dziś).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const BASE = 'https://nowickiadvisory.github.io/logo-fun-www/';
export const MAIL = 'milany2020+logofun@gmail.com';
export const AKAPIT_DOSTAWCY =
  'Dane przechowujemy u dostawcy chmury Supabase na serwerach we Frankfurcie (UE). Kody logowania wysyła w naszym imieniu dostawca poczty e-mail.';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Treść bloku po podstawieniu placeholderów (jeszcze z markdownem). */
export function podstaw(md, data) {
  return md.replaceAll('{DATA_PUBLIKACJI}', data).replaceAll('{AKAPIT_DOSTAWCY}', AKAPIT_DOSTAWCY);
}

/** Inline: **pogrubienie** i [tekst](url) → HTML (reszta z escapowaniem). */
function inline(linia) {
  let out = '';
  let i = 0;
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  for (let m; (m = re.exec(linia)); ) {
    out += esc(linia.slice(i, m.index));
    out += m[1] !== undefined ? `<strong>${esc(m[1])}</strong>` : `<a href="${m[3]}">${esc(m[2])}</a>`;
    i = re.lastIndex;
  }
  return out + esc(linia.slice(i));
}

/** Pierwsza linia = <h1> (bez **), każda kolejna niepusta linia = <p>. */
export function mdNaHtml(md) {
  const linie = md.split('\n').filter((l) => l.trim() !== '');
  const [pierwsza, ...reszta] = linie;
  const h1 = pierwsza.replace(/\*\*/g, '');
  return [`<h1>${esc(h1)}</h1>`, ...reszta.map((l) => `<p>${inline(l)}</p>`)].join('\n');
}

const STOPKA = `<footer>
<nav aria-label="Strony">
<a href="${BASE}polityka-prywatnosci/">Polityka prywatności</a> ·
<a href="${BASE}regulamin/">Regulamin</a> ·
<a href="${BASE}usun-konto/">Usuń konto</a>
</nav>
<p><a href="mailto:${MAIL}">${MAIL}</a></p>
</footer>`;

export function strona(tytul, tresc, css) {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tytul)}</title>
<link rel="stylesheet" href="${css}style.css">
</head>
<body>
<main>
${tresc}
</main>
${STOPKA}
</body>
</html>
`;
}

export function zbuduj(data) {
  const pol = mdNaHtml(podstaw(readFileSync(join(root, 'tresc/polityka.md'), 'utf8'), data));
  const usun = mdNaHtml(podstaw(readFileSync(join(root, 'tresc/usun-konto.md'), 'utf8'), data));
  const index = `<h1>Logo Fun</h1>
<p>Gry wspierające ćwiczenia wymowy dzieci w wieku 5–10 lat.</p>
<ul>
<li><a href="${BASE}polityka-prywatnosci/">Polityka prywatności</a></li>
<li><a href="${BASE}regulamin/">Regulamin</a></li>
<li><a href="${BASE}usun-konto/">Usuń konto</a></li>
</ul>`;
  const regulamin = `<h1>Regulamin Logo Fun</h1>
<p>Regulamin opublikujemy przed udostępnieniem aplikacji.</p>`;
  return {
    'index.html': strona('Logo Fun', index, ''),
    'polityka-prywatnosci/index.html': strona('Polityka prywatności Logo Fun', pol, '../'),
    'usun-konto/index.html': strona('Usuń konto w aplikacji Logo Fun', usun, '../'),
    'regulamin/index.html': strona('Regulamin Logo Fun', regulamin, '../'),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = process.argv[2] ?? new Date().toISOString().slice(0, 10);
  if (!/^20\d\d-\d\d-\d\d$/.test(data)) throw new Error('Data publikacji: RRRR-MM-DD');
  for (const [plik, html] of Object.entries(zbuduj(data))) writeFileSync(join(root, plik), html);
  console.log(`Zbudowano 4 strony, data publikacji ${data}`);
}
