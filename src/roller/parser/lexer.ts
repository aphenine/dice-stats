import { DiceRollable } from "../engine/dice";
import { DiceArrayRollable } from "../engine/dice-array";
import { TotalRollable } from "../engine/functions/total";
import { ArrayRollable, Rollable } from "../engine/rollable";

export interface AstNode {
    type: string;
    name?: string;
    matchedText: string;
    children: Array<AstNode>;
}

const WHITESPACE_CHARS = " \t\n\r";
const SINGLE_DICE_REGEXP = /^d\d+/;
const DICE_ARRAY_REGEXP = /^\d+d\d+/;
const FUNCTION_REGEXP = /^\w+\((?:[\w\d]+\,)*[\w\d]+\)/

function is_whitespace(character: string) {
    return WHITESPACE_CHARS.includes(character[0]);
}

function is_single_dice(text: string) {
    return SINGLE_DICE_REGEXP.test(text)
}

function is_dice_array(text:string) {
    return DICE_ARRAY_REGEXP.test(text)
}

function is_function(text: string) {
    return FUNCTION_REGEXP.test(text)
}

function dice_token(text: string): string | null {
    const match = text.match(SINGLE_DICE_REGEXP);

    if (match === null) {
        return null;
    }

    return match[0];
}

function dice_array_token(text: string): string | null {
    const match = text.match(DICE_ARRAY_REGEXP);

    if (match === null) {
        return null;
    }

    return match[0];
}

function function_token (text:string): string | null {
    const match = text.match(FUNCTION_REGEXP);

    if (match === null) {
        return null;
    }

    return match[0];
}

function parse_dice(node: AstNode) {
    return new DiceRollable(parseInt(node.matchedText.slice(1)))
}

function parse_dice_array(node: AstNode) {
    const parts = node.matchedText.split('d');
    const dice = parseInt(parts[0]);
    const faces = parseInt(parts[1]);

    return new DiceArrayRollable(dice, faces);
}

function parse_function(node: AstNode) {
    console.log("Parse function");
    const args: Array<Rollable> = [];

    if (node.children.length > 1 && node.children.some((c) => c.type === "diceArray")) {
        throw Error(`You must pass either a single dice array or all dice only as function arguments`);
    }

    for (const child of node.children) {
        console.log(child);
        if (child.type === "dice") {
            args.push(parse_dice(child));
        } 
        // else if (child.type === "diceArray") {
        //     args.push(parse_dice_array(child))
        // }
    }

    switch(node.name) {
        case "total":
            console.log("Return total rollable");
            return new TotalRollable(args);
        // case "max":
        //     return new MaxRollable(args);
        // case "min": 
        //     return new MinimumRollable(args);
        // case "thresshold":
        //     return new ThresholdRollable(args);
    }

    return new DiceRollable(6);
}

export class Lexer {
    public testFunctions: Record<string, (text: string) => boolean> = {
        dice: is_single_dice,
        diceArray: is_dice_array,
        function: is_function,
    };

    public tokenFuncs: Record<string, (text: string) => string | null> = {
        dice: dice_token,
        diceArray: dice_array_token,
        function: function_token,
    }

    public whiteSpaceTest = is_whitespace;

    public position = 0;

    public rootNode: AstNode = {
        type: "root",
        matchedText: "",
        children: []
    }

    constructor(public input: string) {
    }

    read(node: AstNode) {
        const testString = this.input.slice(0, this.position + 50);
        const strippedTestString = testString.replace(/\s/g, "");

        const matchedType: Array<string> = [];
        for (const [type, testFunc] of Object.entries(this.testFunctions)) {
            if (testFunc(strippedTestString)) {
                matchedType.push(type)
            }
        }

        if (matchedType.length > 1) {
            throw Error(`${strippedTestString} matched more than one thing`);
        }

        if (matchedType.length === 0) {
            throw Error(`${strippedTestString} did not match anything`)
        }

        const type = matchedType[0];

        const matchedText = this.tokenFuncs[type](testString);

        if (matchedText === null) {
            throw Error(`Failed to tokenise ${matchedText}`);
        }

        const child: AstNode = {
            type,
            matchedText,
            children: [],
        }

        if (type === "function") {
            this.readFunction(child);
        }

        node.children.push(child)

        this.position = this.position + matchedText.length;
    }

    readFunction(node: AstNode) {
        const firstBracket = node.matchedText.indexOf('(');
        const lastBracket = node.matchedText.indexOf(')');

        const funcName = node.matchedText.slice(0,firstBracket);
        const args = node.matchedText.slice(firstBracket + 1, lastBracket);
        const splitArgs = args.split(',');

        node.name = funcName;

        for(const arg of splitArgs) {
            if (is_single_dice(arg)) {
                node.children.push({
                    type: "dice",
                    matchedText: arg,
                    children: [],
                })
            }
            else if (is_dice_array(arg)) {
                node.children.push({
                    type: "diceArray",
                    matchedText: arg,
                    children: [],
                })
            }
            else {
                throw Error(`Bad argument ${arg}`);
            }
        }

        return node;
    }

    isEOF() {
        return this.position + 1 >= this.input.length;
    }

    readWhile() {
        while (!this.isEOF()) {
            this.read(this.rootNode);
        }
    }
}

export class Parser{
    public parserFuncs: Record<string, (node: AstNode) => Rollable | ArrayRollable> = {
        dice: parse_dice,
        diceArray: parse_dice_array,
        function: parse_function,
    }

    constructor(public rootNode: AstNode) {

    }

    parse() {
        return this.rootNode.children.map((node) => {
            return this.parserFuncs[node.type](node);
        })
    }
}
