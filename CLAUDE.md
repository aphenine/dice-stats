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

The app is a single-page Next.js 15 (App Router) tool plus one API route: the user types a dice expression, it is rolled N times, and the resulting distribution is drawn as a Highcharts column histogram. `README.md` is the specification of the expression language; keep it in step with behaviour changes. The code is split into layers that only depend downward:

**`src/roller` – expression language and roll engine (framework-free).**
- `parser/parse.ts` is the public entry point: `parse(input)` returns an `AnyRollable` whose `roll()` produces one sample, or throws `ParseError` (with a `position`).
- Parsing is three stages in three files: `parser/tokenizer.ts` turns the input into tokens; `parser/parser.ts` is a recursive-descent parser producing the AST in `parser/ast.ts` (`expression := term (('+'|'-') term)*`, `term := dice | diceArray | constant | call`); `parser/build.ts` walks the AST, builds engine objects, and type-checks call arguments and operator operands. Every AST node carries its source `text` and `position` for error messages.
- `engine/functions/index.ts` is the function registry: name, accepted signatures (alternatives of fixed params plus an optional variadic `rest` type), and a `build` that returns the engine class. Functions following the array-or-scalars rule normalise a scalar list into a `CreateArrayOperator` via `toArray`, so engine classes like `TotalRollable` only ever take one `ArrayRollable`. To add a function, add a class under `engine/functions/` and one registry entry; the parser is untouched.
- `engine/rollable.ts` defines the discriminated union `AnyRollable = Rollable | ArrayRollable`, distinguished by the literal `type` field (`RollableType.Scalar` / `Array`). Classes declare `readonly type = ...` so the literal type is preserved for narrowing.
- All randomness goes through `services/roller.ts` (`rollerService`); tests make results deterministic with `jest.spyOn(rollerService, "rollDice")`. `services/sample.ts` rolls an engine N times and is shared by the UI and the API.

**`src/app/api/roll/route.ts` – HTTP API.** GET with query params or POST with JSON; validates `expression` and `times`, maps `ParseError` to a 400. Its test uses the `node` jest environment (docblock at the top of the file) because jsdom lacks `Request`.

**`src/math` – pure numeric helpers.** `histogram(data, binSize)` returns a `Record<binLowerBound, count>`.

**`src/interface` – React UI.** `components/dice-stats.tsx` (client component) owns the map of `Series` and builds the Highcharts options in the exported, unit-tested `buildChartOptions`, which aligns every series to one numerically sorted category axis. `components/input-dice-roll.tsx` is one input row: it parses on submit, shows a `ParseError` inline, flattens array results, and reports a `Series` upward via `addSeries`. `src/app/page.tsx` just mounts `DiceStats`.
