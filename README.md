# dice-stats

A dice roller with a small expression language, a roll engine, and a Next.js
front end that rolls an expression many times and plots the distribution of
results as a histogram.

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

An integer with no `d` after it is a constant. A `d` with no digits after it is
an error.

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
| `threshold(a, t)`            | an array and a scalar             | scalar  | Rolls `a` and `t`, returns how many values in `a` are **greater than or equal to** `t`. |
| `remove(a, n)`               | an array and a scalar             | array   | Rolls `a` and `n`, then drops the `n` lowest values (by numeric value). The remaining values are returned, sorted ascending. `remove(4d6, 1)` is "4d6 drop lowest". If `n` is at least the array length the result is empty. |

Rules that apply to every function:

- The array-or-scalars rule. A function that takes dice takes **either** a
  single array argument **or** a list of scalar arguments. Mixing an array with
  other arguments in the same list, as in `total(3d6, d4)`, is an error. Use
  `total(array(...))` or build the array first.
- Scalar arguments are rolled each time the enclosing function is rolled.
  `threshold(3d6, d4)` compares against a fresh `d4` every sample.
- Unknown function names are an error.
- `array` is a language feature rather than an ordinary function: the lexer
  recognises it by name and gives it its own node type.

### Operators (planned, not yet parsed)

The engine has `AdditionOperator` and `SubtractionOperator` classes for infix
`+` and `-` on scalars, and a stub for a `min` function, but the lexer does
not recognise any of them yet. The intended rules are:

- `+` and `-` are binary, left associative, and operate on scalars only.
  `total(3d6) + 2` and `d20 - 1` are valid; `3d6 + 2` is a type error.
- Function application binds tighter than `+` and `-`.
- `min(...)` and `max(...)` follow the array-or-scalars rule and return a
  scalar.

### Whole expressions

An input must be exactly one expression. Trailing or leading text that is not
part of that expression is an error.

Today the lexer tolerates several juxtaposed top-level expressions
(`d6 d8` lexes as two children of the root) and `parse` silently returns only
the first. That is a gap, not a rule; the single-expression rule above is the
intended behaviour.

### Errors

Parsing reports an error, rather than guessing, when:

- the input, or any argument, does not match exactly one token type;
- a function name is unknown;
- a function's closing bracket is missing;
- argument types do not match the function's signature, including mixing an
  array with other arguments.

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

## Known divergences between the code and these rules

These are places where the current implementation does not yet do what the
rules above say. They are listed so the rules can be treated as the spec.

- `remove` drops the single `n`-th lowest value instead of the `n` lowest
  values, and sorts with the default JavaScript comparator, which is
  lexicographic, so `10` sorts before `2`. It must drop the `n` lowest after a
  numeric sort.
- `parse` returns only the first top-level expression instead of rejecting
  extra input.
- Function signatures are not checked at parse time; wrong argument types fall
  through to runtime casts. An unknown function name currently falls back to a
  `d6` instead of raising an error.
- `+`, `-`, `min` and `max` are not wired into the lexer or parser.
- The mixing check rejects any call with more than one argument when one of
  them is a dice-array token. So `remove(4d6, 1)` and `threshold(3d6, 3)` both
  fail today even though each has exactly one array argument; only
  `array(...)` results get through. The check should instead be driven by each
  function's signature.

## Project layout

- `src/roller/parser` – lexer and parser; `parse.ts` is the entry point.
- `src/roller/engine` – the `Rollable` / `ArrayRollable` interfaces and the
  classes that implement dice, constants, functions and operators.
- `src/roller/services/roller.ts` – the only source of randomness.
- `src/math` – pure numeric helpers (histogram).
- `src/interface` – React components for the page.
- `tests/unit`, `tests/integration` – jest tests mirroring `src/`.
