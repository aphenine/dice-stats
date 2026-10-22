import { ParseError } from "./errors";

export type TokenType =
    | "dice"
    | "diceArray"
    | "constant"
    | "identifier"
    | "lparen"
    | "rparen"
    | "comma"
    | "plus"
    | "minus"
    | "eof";

export interface Token {
    type: TokenType;
    text: string;
    position: number;
}

const WHITESPACE = /^\s+/;
const DICE_ARRAY = /^\d+d\d+/;
const DICE = /^d\d+/;
const CONSTANT = /^\d+/;
const IDENTIFIER = /^[A-Za-z_]\w*/;
const MISSING_FACES = /^(\d*)d(?![\w])/;

const PUNCTUATION: Record<string, TokenType> = {
    "(": "lparen",
    ")": "rparen",
    ",": "comma",
    "+": "plus",
    "-": "minus",
};

const PATTERNS: Array<[TokenType, RegExp]> = [
    ["diceArray", DICE_ARRAY],
    ["dice", DICE],
    ["constant", CONSTANT],
    ["identifier", IDENTIFIER],
];

/** Splits an expression into tokens. Whitespace is skipped; the list always ends with `eof`. */
export function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let position = 0;

    while (position < input.length) {
        const rest = input.slice(position);

        const whitespace = rest.match(WHITESPACE);
        if (whitespace) {
            position += whitespace[0].length;
            continue;
        }

        const missingFaces = rest.match(MISSING_FACES);
        if (missingFaces) {
            throw new ParseError(`'${missingFaces[0]}' is missing its number of faces`, position);
        }

        const punctuation = PUNCTUATION[rest[0]];
        if (punctuation) {
            tokens.push({ type: punctuation, text: rest[0], position });
            position += 1;
            continue;
        }

        const matched = PATTERNS.find(([, pattern]) => pattern.test(rest));
        if (!matched) {
            throw new ParseError(`Unexpected character '${rest[0]}'`, position);
        }

        const text = rest.match(matched[1])![0];
        tokens.push({ type: matched[0], text, position });
        position += text.length;
    }

    tokens.push({ type: "eof", text: "", position });
    return tokens;
}
