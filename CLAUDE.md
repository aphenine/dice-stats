# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node 20.19.2 and Yarn 1.22.22 are pinned via Volta in `package.json`.

```bash
yarn dev                                 # Next.js dev server with Turbopack on http://localhost:3000
yarn build                               # production build
yarn lint                                # next lint (eslint-config-next core-web-vitals + typescript)
yarn test                                # all jest tests
yarn jest tests/unit/math                # one directory / file (path substring match)
yarn jest -t "parse a single die"        # one test by name
```

Jest is configured through `next/jest` (`jest.config.ts`) with `testEnvironment: jsdom`, so the `@/*` alias (`./src/*`) resolves in tests without extra setup. Tests live under `tests/unit/**` and `tests/integration/**`, mirroring `src/`.

## Architecture

The app is a single-page Next.js 15 (App Router) tool: the user types a dice expression, it is rolled N times, and the resulting distribution is drawn as a Highcharts column histogram. The code is split into three layers that only depend downward:

**`src/roller` – expression language and roll engine (framework-free).**
- `parser/parse.ts` is the public entry point: `parse(input)` returns a `Rollable | ArrayRollable` whose `roll()` produces one sample.
- `parser/lexer.ts` holds both the `Lexer` and the `Parser`. The lexer does not scan character by character; it tests the whole remaining input against the regexps in `parser/lexer/regexps.ts` (via `parser/lexer/matchers.ts`), requires exactly one token type to match, consumes it, and repeats. A `function` token (`name(` … matching `)`) is split on top-level commas by `utils/split.ts` and each argument is lexed recursively by a sub-`Lexer` into the same AST node. `array(...)` is lexed as a function and then re-typed to an `array` node.
- The `Parser` walks the AST and builds engine objects from `engine/`. Function names are mapped to classes in `parse_function` (`total`, `remove`, `threshold`); adding a language function means adding a class under `engine/functions/` and a `case` there.
- `engine/rollable.ts` defines the two core interfaces: `Rollable` (scalar `roll(): number`) and `ArrayRollable` (`roll(): number[]`), distinguished at runtime by `RollableType`. Function classes use that `type` to decide whether their arguments are a single dice array or a list of scalars.
- All randomness goes through `services/roller.ts` (`rollerService`), so tests can mock a single place.

**`src/math` – pure numeric helpers.** `histogram(data, binSize)` returns a `Record<bin, count>`; the chart feeds `Object.entries` of this straight into a category x-axis.

**`src/interface` – React UI.** `components/dice-stats.tsx` (client component) owns the map of `Series` (`types/series.ts`) and the Highcharts options; `components/input-dice-roll.tsx` is one input row that calls `parse`, rolls `times` samples, and reports a `Series` upward via the `addSeries` callback. `src/app/page.tsx` just mounts `DiceStats`.

## Expression language (as currently supported)

- `d6` – single die (scalar), `3d6` – dice array, bare integer – constant.
- `total(d6, d6)` or `total(3d6)` – sum; `array(d12, d8)` – build an array from scalars; `threshold(array(...), 3)` – count of dice ≥ threshold; `remove(3d6, 1)` – drop the Nth-lowest die.
- A function receives either exactly one dice array or only scalar arguments; mixing throws.
- Infix `+`/`-` operators exist as engine classes (`engine/operators/`) but are not yet wired into the lexer; `engine/compound/min.ts` is an unfinished stub.
