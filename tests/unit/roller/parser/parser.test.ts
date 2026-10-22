import { ParseError } from "@/roller/parser/errors";
import { parseToAst } from "@/roller/parser/parser";

describe("Parser", () => {
    it("parses a single die", () => {
        expect(parseToAst("d6")).toEqual({ kind: "dice", faces: 6, text: "d6", position: 0 });
    });

    it("parses a dice array and a constant", () => {
        expect(parseToAst("3d6")).toEqual({ kind: "diceArray", count: 3, faces: 6, text: "3d6", position: 0 });
        expect(parseToAst("42")).toEqual({ kind: "constant", value: 42, text: "42", position: 0 });
    });

    it("parses nested function calls with whitespace", () => {
        expect(parseToAst("threshold( array(d12, d8) , 3 )")).toEqual({
            kind: "call",
            name: "threshold",
            text: "threshold( array(d12, d8) , 3 )",
            position: 0,
            args: [
                {
                    kind: "call",
                    name: "array",
                    text: "array(d12, d8)",
                    position: 11,
                    args: [
                        { kind: "dice", faces: 12, text: "d12", position: 17 },
                        { kind: "dice", faces: 8, text: "d8", position: 22 },
                    ],
                },
                { kind: "constant", value: 3, text: "3", position: 28 },
            ],
        });
    });

    it("parses + and - left associatively", () => {
        expect(parseToAst("d6 + 2 - d4")).toEqual({
            kind: "binary",
            operator: "-",
            text: "d6 + 2 - d4",
            position: 0,
            left: {
                kind: "binary",
                operator: "+",
                text: "d6 + 2",
                position: 0,
                left: { kind: "dice", faces: 6, text: "d6", position: 0 },
                right: { kind: "constant", value: 2, text: "2", position: 5 },
            },
            right: { kind: "dice", faces: 4, text: "d4", position: 9 },
        });
    });

    it("binds function application tighter than + and -", () => {
        const ast = parseToAst("total(3d6) + max(d4, d6)");

        expect(ast.kind).toBe("binary");
        if (ast.kind !== "binary") return;
        expect(ast.left).toMatchObject({ kind: "call", name: "total" });
        expect(ast.right).toMatchObject({ kind: "call", name: "max" });
    });

    it("allows operators inside function arguments", () => {
        const ast = parseToAst("threshold(3d6, d4 + 1)");

        expect(ast).toMatchObject({
            kind: "call",
            args: [{ kind: "diceArray" }, { kind: "binary", operator: "+" }],
        });
    });

    it("rejects more than one top-level expression", () => {
        expect(() => parseToAst("d6 d8")).toThrow(ParseError);
        expect(() => parseToAst("d6 d8")).toThrow("Unexpected 'd8' after the expression");
        expect(() => parseToAst("d6)")).toThrow("Unexpected ')' after the expression");
    });

    it("rejects a missing closing bracket", () => {
        expect(() => parseToAst("total(d6, d6")).toThrow("Missing closing bracket on function total(");
    });

    it("rejects an identifier without a call", () => {
        expect(() => parseToAst("total")).toThrow("Expected '(' after function name 'total'");
    });

    it("rejects dangling operators and empty input", () => {
        expect(() => parseToAst("d6 +")).toThrow("Expected an expression but reached the end of the input");
        expect(() => parseToAst("")).toThrow("Expected an expression but reached the end of the input");
        expect(() => parseToAst("+ d6")).toThrow("Expected an expression but found '+'");
    });

    it("rejects dice with no faces", () => {
        expect(() => parseToAst("d0")).toThrow("'d0' must have at least one face");
        expect(() => parseToAst("2d0")).toThrow("'2d0' must have at least one face");
    });
});
