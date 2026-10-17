# logo-fun-www

Strony informacyjne aplikacji Logo Fun (GitHub Pages z gałęzi `main`, folder `/`):

- https://nowickiadvisory.github.io/logo-fun-www/
- https://nowickiadvisory.github.io/logo-fun-www/polityka-prywatnosci/
- https://nowickiadvisory.github.io/logo-fun-www/usun-konto/
- https://nowickiadvisory.github.io/logo-fun-www/regulamin/

Czysty statyczny HTML (`lang="pl"`), bez JavaScriptu, zewnętrznych czcionek, analityki, ciasteczek i zasobów
z innych domen — strona dla rodziców aplikacji z kategorii Kids.

## Skąd treść

Bloki tekstu (markdown) są w `tresc/` — źródło: kontrakt T098 w `ops.contract` projektu Logo Fun
(polityka prywatności wersja 1.0 zatwierdzona decyzją D48). Strony HTML generuje `scripts/build.mjs`:

```
node scripts/build.mjs 2026-10-17     # data publikacji = data scalenia PR
```

Zasady konwersji: pierwsza linia bloku = `<h1>` (bez `**`), każda kolejna niepusta linia = `<p>`,
`**x**` = `<strong>`, `[tekst](url)` = `<a>`. Placeholdery: `{DATA_PUBLIKACJI}`, `{AKAPIT_DOSTAWCY}`.
Treści nie zmieniamy ręcznie w HTML — zmiana tylko w `tresc/` i ponowny build.

## Testy

```
npm test          # test treści + zakazy (skrypty, zasoby i linki do innych domen)
npm run validate  # walidacja HTML (html-validate)
```

Test treści: tekst strony bez znaczników = tekst bloku po podstawieniu placeholderów i usunięciu znaczników
markdown (normalizacja wyłącznie białych znaków).

## Etapy

- E1 (ten stan): polityka prywatności 1.0, „Usuń konto”, strona główna, zalążek regulaminu.
- E2: regulamin — po zatwierdzeniu tekstu (klucz `regulamin_zatwierdzony`).
- E3: polityka 1.1 — po T096 (umowy powierzenia).
