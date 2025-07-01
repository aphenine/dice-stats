import { Lexer } from "@/roller/parser/lexer";

describe("Lexer test", () => {
    it("should lex a smple dice", () => {
        const lexer = new Lexer("d6");

        lexer.readWhile();

        expect(lexer.rootNode).toEqual(
            {
                "children": [
                    {
                        "children": [],
                        "matchedText": "d6",
                    "type": "dice",
                    },
                ],
                "matchedText": "",
                "type": "root",
            }
        );
    })
});