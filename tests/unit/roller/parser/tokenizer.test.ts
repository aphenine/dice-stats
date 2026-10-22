import { ParseError } from "@/roller/parser/errors";
import { tokenize } from "@/roller/parser/tokenizer";

describe("Tokenizer", () => {
    it("recognises every token type and skips whitespace", () => {
        const tokens = tokenize(" total( 3d6 , d4 ) + 2 - d8\n");

        expect(tokens.map((t) => [t.type, t.text])).toEqual([
            ["identifier", "total"],
            ["lparen", "("],
            ["diceArray", "3d6"],
            ["comma", ","],
            ["dice", "d4"],
            ["rparen", ")"],
            ["plus", "+"],
            ["constant", "2"],
            ["minus", "-"],
            ["dice", "d8"],
            ["eof", ""],
        ]);
    });

    it("records the position of each token", () => {
        const tokens = tokenize("d6 + 10");

        expect(tokens.map((t) => t.position)).toEqual([0, 3, 5, 7]);
    });

    it("treats a digit run followed by d as a dice array, never a constant", () => {
        expect(tokenize("12d20")[0]).toMatchObject({ type: "diceArray", text: "12d20" });
    });

    it("rejects a die without a face count", () => {
        expect(() => tokenize("d")).toThrow(ParseError);
        expect(() => tokenize("3d")).toThrow("'3d' is missing its number of faces");
        expect(() => tokenize("total(d, 2)")).toThrow("'d' is missing its number of faces");
    });

    it("rejects characters outside the language", () => {
        expect(() => tokenize("d6 * 2")).toThrow("Unexpected character '*' (at position 3)");
    });
});
