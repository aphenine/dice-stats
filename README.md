# dice-stats

A dice roller with a small expression language, a roll engine, a Next.js
front end that rolls an expression many times and plots the distribution of
results as a histogram, and a JSON API for rolling expressions over HTTP.

## Getting started

Node 20.19.2 and Yarn 1.22.22 are pinned via Volta.

```bash
yarn dev      # http://localhost:3000
yarn test     # jest
yarn lint
yarn build
```

## The dice expression language

An expression is a string such as `d6`, `3d6`, `total(3d6)` or
`threshold(array(d12, d8, d6), 3)`. Parsing it produces an **engine**: an
object with a `roll()` method. Every call to `roll()` draws fresh random
numbers and returns one sample.

### Values and types

Every expression has one of two types, and the type is fixed at parse time:

| Type       | `roll()` returns | Examples                         |
|------------|------------------|----------------------------------|
| **scalar** | `number`         | `d6`, `4`, `total(...)`, `threshold(...)` |
| **array**  | `number[]`       | `3d6`, `array(...)`, `remove(...)` |

Functions declare the types they accept and the type they return. Passing an
array where a scalar is required, or vice versa, is a parse error, not a
runtime surprise.

### Whitespace

Whitespace (space, tab, newline, carriage return) is insignificant everywhere.
`total( d6 , d6 )` and `total(d6,d6)` are the same expression. Whitespace is
not allowed *inside* a token, so `3 d6` is not a dice array.

### Tokens

Matching is case sensitive and uses a lowercase `d`.

| Token          | Pattern          | Meaning                                                      | Type   |
|----------------|------------------|--------------------------------------------------------------|--------|
| **die**        | `d<faces>`       | One die with `faces` sides, rolled once. Result is in `1..faces`. | scalar |
| **dice array** | `<count>d<faces>`| `count` independent dice with `faces` sides.                 | array  |
| **constant**   | `<integer>`      | A fixed non-negative integer. `roll()` always returns it.    | scalar |
| **function**   | `<name>(<args>)` | A named operation applied to comma separated arguments.      | per function |

`<faces>`, `<count>` and `<integer>` are one or more decimal digits. A digit
run immediately followed by `d` is always the start of a dice array, never a
constant, so `3d6` is one token and `3` alone is a constant.

An integer with no `d` after it is a constant. A `d` with no digits after it
is an error, and so is a die with zero faces (`d0`, `2d0`).

### Functions

A function call is a name, an opening bracket, zero or more comma separated
argument expressions, and the matching closing bracket. Arguments may be any
expression, including other function calls, so calls nest arbitrarily. Commas
inside nested brackets belong to the inner call. A missing closing bracket is
an error that names the function.

The defined functions are:

| Function                     | Arguments                         | Returns | Semantics |
|------------------------------|-----------------------------------|---------|-----------|
| `array(s1, s2, ...)`         | one or more scalars               | array   | Rolls each argument and collects the results, in order. This is how dice with different face counts are grouped together. |
| `total(a)` / `total(s1, s2, ...)` | one array, **or** one or more scalars | scalar | Sum of all rolled values. |
| `min(a)` / `min(s1, s2, ...)` | one array, **or** one or more scalars | scalar | Smallest rolled value. |
| `max(a)` / `max(s1, s2, ...)` | one array, **or** one or more scalars | scalar | Largest rolled value. |
| `threshold(a, t)`            | an array and a scalar             | scalar  | Rolls `a` and `t`, returns how many values in `a` are **greater than or equal to** `t`. |
| `remove(a, n)`               | an array and a scalar             | array   | Rolls `a` and `n`, then drops the `n` lowest values (by numeric value). The remaining values are returned, sorted ascending. `remove(4d6, 1)` is "4d6 drop lowest". If `n` is at least the array length the result is empty. |
| `lowest(a, n)`               | an array and a scalar             | array   | Rolls `a` and `n`, then keeps only the `n` lowest values, sorted ascending. `lowest(4d4, 2)` gives the two lowest of four d4. If `n` is at least the array length every value is kept. |
| `highest(a, n)`              | an array and a scalar             | array   | Rolls `a` and `n`, then keeps only the `n` highest values, sorted ascending. `total(highest(4d6, 3))` is another way to write "4d6 drop lowest". |

Rules that apply to every function:

- The array-or-scalars rule. A function that takes dice takes **either** a
  single array argument **or** a list of scalar arguments. Mixing an array with
  other arguments in the same list, as in `total(3d6, d4)`, is an error. Use
  `total(array(...))` or build the array first.
- Scalar arguments are rolled each time the enclosing function is rolled.
  `threshold(3d6, d4)` compares against a fresh `d4` every sample.
- Unknown function names are an error.
- Functions are defined in one registry (`src/roller/engine/functions/index.ts`)
  that pairs each name with its accepted signatures and the engine class it
  builds. Adding a function means adding an engine class and one registry
  entry; the parser needs no change.

### Operators

- `+` and `-` are binary, left associative, and operate on scalars only.
  `total(3d6) + 2` and `d20 - 1` are valid; `3d6 + 2` is a type error.
- Function application binds tighter than `+` and `-`, and operators may
  appear inside function arguments: `threshold(3d6, d4 + 1)`.
- There is no multiplication, division, unary minus or bracketed grouping.

### Whole expressions

An input must be exactly one expression. Trailing or leading text that is not
part of that expression is an error (`d6 d8` is rejected).

### Errors

Parsing throws a `ParseError` (with a `position` into the input) rather than
guessing when:

- the input contains a character outside the language, or a `d` with no face
  count;
- a function name is unknown, or an identifier is not followed by `(`;
- a function's closing bracket is missing;
- argument types do not match any of the function's signatures, including
  mixing an array with other arguments;
- an operand of `+` or `-` is an array;
- there is more than one top-level expression, or none.

Error messages name the offending text, e.g.
`total(array, scalar) does not match total(array) or total(scalar, scalar...)`.

### Examples

| Expression                              | Type   | One sample might be |
|-----------------------------------------|--------|---------------------|
| `d6`                                    | scalar | `4`                 |
| `3d6`                                   | array  | `[2, 6, 3]`         |
| `total(3d6)`                            | scalar | `11`                |
| `total(d6, d6, 2)`                      | scalar | `9`                 |
| `array(d12, d8, d6, d4)`                | array  | `[7, 8, 1, 4]`      |
| `threshold(array(d12, d8, d6, d4), 5)`  | scalar | `2`                 |
| `remove(4d6, 1)`                        | array  | `[3, 4, 6]`         |
| `total(remove(4d6, 1))`                 | scalar | `13` (the classic "4d6 drop lowest") |
| `max(2d20) + 5`                         | scalar | `22` (advantage with a +5 modifier) |
| `highest(4d4, 2)`                       | array  | `[3, 4]`            |
| `total(lowest(2d20, 1))`                | scalar | `7` (disadvantage)  |
| `min(d6, d8, d10)`                      | scalar | `2`                 |

## HTTP API

```
GET  /api/roll?expression=total(3d6)&times=10
POST /api/roll   { "expression": "total(3d6)", "times": 10 }
```

`times` is optional and defaults to 1; it must be an integer from 1 to
100000. A successful response is:

```json
{ "expression": "total(3d6)", "type": "scalar", "times": 2, "samples": [11, 7] }
```

`type` is the expression's static type; for an `array` expression each
sample is a list of numbers. Invalid input gets a `400` with
`{ "error": "<parse error message>" }`.

## Web UI

Each row takes an expression and a number of rolls. Scalar expressions are
plotted as a histogram of their results. Array expressions are flattened, so
the histogram shows the distribution of the individual dice values. Parse
errors are shown under the row.

## Project layout

- `src/roller/parser` – tokenizer, recursive-descent parser (to an AST) and
  the builder that type-checks the AST into an engine; `parse.ts` is the entry
  point.
- `src/roller/engine` – the `Rollable` / `ArrayRollable` interfaces, the
  classes that implement dice, constants, functions and operators, and the
  function registry.
- `src/roller/services/roller.ts` – the only source of randomness;
  `sample.ts` rolls an engine N times.
- `src/math` – pure numeric helpers (histogram).
- `src/interface` – React components for the page.
- `src/app/api/roll` – the HTTP route.
- `tests/unit`, `tests/integration` – jest tests mirroring `src/`.
