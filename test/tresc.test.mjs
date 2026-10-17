// Test treści (kontrakt T098): tekst strony bez znaczników = tekst bloku po podstawieniu placeholderów
// i usunięciu znaczników markdown, z normalizacją wyłącznie białych znaków.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { BASE, MAIL, podstaw } from '../scripts/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const czytaj = (p) => readFileSync(join(root, p), 'utf8');
const bialeZnaki = (s) => s.replace(/\s+/g, ' ').trim();
const odmarkdown = (s) =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
const tekstHtml = (html) =>
  bialeZnaki(
    html
      .replace(/<\/(p|h1|li|ul)>/g, ' ') // granice bloków = odstęp; znaczniki inline znikają bez śladu
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&'),
  );
const main = (html) => /<main>([\s\S]*)<\/main>/.exec(html)[1];

const STRONY = [
  'index.html',
  'polityka-prywatnosci/index.html',
  'usun-konto/index.html',
  'regulamin/index.html',
];

test('polityka prywatności: tekst strony = blok kontraktu', () => {
  const html = czytaj('polityka-prywatnosci/index.html');
  const data = /\(wersja 1\.0, (20\d\d-\d\d-\d\d)\)/.exec(html)?.[1];
  assert.ok(data, 'data publikacji w nagłówku');
  const oczekiwany = bialeZnaki(odmarkdown(podstaw(czytaj('tresc/polityka.md'), data)));
  assert.equal(tekstHtml(main(html)), oczekiwany);
});

test('usuń konto: tekst strony = blok kontraktu', () => {
  const html = czytaj('usun-konto/index.html');
  const oczekiwany = bialeZnaki(odmarkdown(podstaw(czytaj('tresc/usun-konto.md'), '')));
  assert.equal(tekstHtml(main(html)), oczekiwany);
});

test('regulamin (E1): tylko nagłówek i jedno zdanie', () => {
  assert.equal(
    tekstHtml(main(czytaj('regulamin/index.html'))),
    'Regulamin Logo Fun Regulamin opublikujemy przed udostępnieniem aplikacji.',
  );
});

test('strona główna: nagłówek, opis i trzy linki', () => {
  const html = czytaj('index.html');
  assert.equal(
    tekstHtml(main(html)),
    'Logo Fun Gry wspierające ćwiczenia wymowy dzieci w wieku 5–10 lat. Polityka prywatności Regulamin Usuń konto',
  );
});

test('każda strona: lang=pl, charset, viewport, stopka z trzema linkami i mailto', () => {
  for (const p of STRONY) {
    const html = czytaj(p);
    assert.match(html, /<html lang="pl">/, p);
    assert.match(html, /<meta charset="utf-8">/, p);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/, p);
    for (const sciezka of ['polityka-prywatnosci/', 'regulamin/', 'usun-konto/'])
      assert.ok(html.includes(`href="${BASE}${sciezka}"`), `${p}: link ${sciezka}`);
    assert.ok(html.includes(`href="mailto:${MAIL}"`), `${p}: mailto`);
  }
});

test('zero skryptów, zasobów i linków do innych domen (strona dla rodziców aplikacji Kids)', () => {
  for (const p of [...STRONY, 'style.css']) {
    const tekst = czytaj(p);
    assert.doesNotMatch(tekst, /<script/i, `${p}: skrypt`);
    assert.doesNotMatch(tekst, /@import|url\(|@font-face/i, `${p}: zewnętrzny zasób CSS`);
  }
  for (const p of STRONY) {
    const html = czytaj(p);
    assert.doesNotMatch(html, /\ssrc=/i, `${p}: src=`);
    for (const m of html.matchAll(/href="([^"]*)"/g)) {
      const url = m[1];
      const ok =
        url.startsWith('mailto:') || url.startsWith(BASE) || url === 'style.css' || url === '../style.css';
      assert.ok(ok, `${p}: niedozwolony href ${url}`);
    }
  }
});
