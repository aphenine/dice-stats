import { ArithmeticOperatorSymbol } from "../engine/operators/arithmetic";
import { AstNode } from "./ast";
import { ParseError } from "./errors";
import { Token, TokenType, tokenize } from "./tokenizer";

/**
 * Recursive-descent parser for the grammar
 *
 *   expression := term (('+' | '-') term)*
 *   term       := dice | diceArray | constant | call
 *   call       := identifier '(' [expression (',' expression)*] ')'
 *
 * The whole input must be exactly one expression.
 */
class Parser {
    private index = 0;

    constructor(private readonly input: string, private readonly tokens: Token[]) {}

    parse(): AstNode {
        const node = this.parseExpression();
        const trailing = this.peek();
        if (trailing.type !== "eof") {
            throw new ParseError(
                `Unexpected '${trailing.text}' after the expression; an input must be a single expression`,
                trailing.position,
            );
        }
        return node;
    }

    private parseExpression(): AstNode {
        let left = this.parseTerm();

        while (this.peek().type === "plus" || this.peek().type === "minus") {
            const operator = this.next().text as ArithmeticOperatorSymbol;
            const right = this.parseTerm();
            left = {
                kind: "binary",
                operator,
                left,
                right,
                position: left.position,
                text: this.textBetween(left.position, right),
            };
        }

        return left;
    }

    private parseTerm(): AstNode {
        const token = this.next();

        switch (token.type) {
            case "dice":
                return { kind: "dice", faces: this.parseFaces(token.text.slice(1), token), ...span(token) };
            case "diceArray": {
                const [count, faces] = token.text.split("d");
                return { kind: "diceArray", count: parseInt(count), faces: this.parseFaces(faces, token), ...span(token) };
            }
            case "constant":
                return { kind: "constant", value: parseInt(token.text), ...span(token) };
            case "identifier":
                return this.parseCall(token);
            case "eof":
                throw new ParseError("Expected an expression but reached the end of the input", token.position);
            default:
                throw new ParseError(`Expected an expression but found '${token.text}'`, token.position);
        }
    }

    private parseCall(name: Token): AstNode {
        this.expect("lparen", `Expected '(' after function name '${name.text}'`);

        const args: AstNode[] = [];
        if (this.peek().type !== "rparen") {
            args.push(this.parseExpression());
            while (this.peek().type === "comma") {
                this.next();
                args.push(this.parseExpression());
            }
        }

        const close = this.expect("rparen", `Missing closing bracket on function ${name.text}(`);

        return {
            kind: "call",
            name: name.text,
            args,
            position: name.position,
            text: this.input.slice(name.position, close.position + 1),
        };
    }

    private parseFaces(digits: string, token: Token): number {
        const faces = parseInt(digits);
        if (faces < 1) {
            throw new ParseError(`'${token.text}' must have at least one face`, token.position);
        }
        return faces;
    }

    private textBetween(start: number, last: AstNode): string {
        return this.input.slice(start, last.position + last.text.length);
    }

    private peek(): Token {
        return this.tokens[this.index];
    }

    private next(): Token {
        const token = this.tokens[this.index];
        if (token.type !== "eof") {
            this.index++;
        }
        return token;
    }

    private expect(type: TokenType, message: string): Token {
        const token = this.peek();
        if (token.type !== type) {
            throw new ParseError(message, token.position);
        }
        return this.next();
    }
}

function span(token: Token) {
    return { text: token.text, position: token.position };
}

/** Parses an expression string into an abstract syntax tree. */
export function parseToAst(input: string): AstNode {
    return new Parser(input, tokenize(input)).parse();
}
