import { ConstantRollable } from "../engine/constant";
import { DiceRollable } from "../engine/dice";
import { DiceArrayRollable } from "../engine/dice-array";
import { ThresholdRollable } from "../engine/functions/threshold";
import { TotalRollable } from "../engine/functions/total";
import { ArrayRollable, Rollable } from "../engine/rollable";
import { is_constant, is_dice_array, is_function, is_single_dice, is_whitespace } from "./lexer/matchers";
import { CONSTANT_REGEXP, DICE_ARRAY_REGEXP, SINGLE_DICE_REGEXP } from "./lexer/regexps";

export interface AstNode {
    type: string;
    name?: string;
    matchedText: string;
    children: Array<AstNode>;
}

function constant_token(text:string) {
    const match = text.match(CONSTANT_REGEXP);

    if (match === null) {
        return null;
    }

    return match[0];
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

function findMatchingBracket(text: string): number | null {
    let stack = 0
    let pos = 0;
    for(const char of text) {
        if (char === '(') {
            stack += 1
        }
        if (char === ')') {
            stack -= 1
            if (stack === 0) {
                return pos
            }
        }
        pos++;
    }
    return null;
}

function function_token(text:string): string | null {
    const firstBracket = text.indexOf('(');
    const name = text.slice(0, firstBracket);
    const fromFirstBracket = text.slice(firstBracket);
    const lastBracket = findMatchingBracket(fromFirstBracket);
    if (lastBracket === null) {
        throw Error(`Missing closing bracket on function ${name}(`);
    }

    return text.slice(0, firstBracket + lastBracket + 1)
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

function parse_constant(node: AstNode) {
    const value = parseInt(node.matchedText);

    return new ConstantRollable(value);
}

function parse_function(node: AstNode) {
    const args: Array<Rollable> = [];

    if (node.children.length > 1 && node.children.some((c) => c.type === "diceArray")) {
        throw Error(`You must pass either a single dice array or all dice only as function arguments`);
    }

    for (const child of node.children) {
        if (child.type === "dice") {
            args.push(parse_dice(child));
        }
        if (child.type === 'array') {
            args.push(parse_function(child));
        }
        if (child.type === 'constant') {
            args.push(parse_constant(child));
        }
    }

    switch(node.name) {
        case "total":
            return new TotalRollable(args);
        // case "max":
        //     return new MaxRollable(args);
        // case "min": 
        //     return new MinimumRollable(args);
        case "thresshold":
            return new ThresholdRollable(args.slice(0, -1), args[args.length-1]);
    }

    return new DiceRollable(6);
}

function splitTakingIntoAccountBrackets(s: string): Array<string> {
    let current='';
    let parenthesis=0;
    const results = [];
    for(let i=0, l=s.length; i<l; i++){ 
        if(s[i] == '('){ 
            parenthesis++; 
            current=current+'(';
        }else if(s[i]==')' && parenthesis > 0){ 
            parenthesis--;
            current=current+')';
        }else if(s[i] ===',' && parenthesis == 0){
            results.push(current);
            current=''
        }else{
            current=current+s[i];
        }   
    }
    if(current !== ''){
        results.push(current)
    }
    return results
}

export class Lexer {
    public testFunctions: Record<string, (text: string) => boolean> = {
        constant: is_constant,
        dice: is_single_dice,
        diceArray: is_dice_array,
        function: is_function,
    };

    public tokenFuncs: Record<string, (text: string) => string | null> = {
        constant: constant_token,
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

    constructor(public input: string, node?: AstNode) {
        console.log(input);
        if (!node) {
            this.rootNode = {
                type: "root",
                matchedText: "",
                children: []
            }
        } else {
            this.rootNode = node;
        }
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
            throw Error(`${strippedTestString} matched more than one thing: ${matchedType}`);
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
            // Check for special functions that are also language features
            if (child.name=== "array") {
                child.type = "array";
                child.name = undefined;
            }
        }

        node.children.push(child)

        this.position = this.position + matchedText.length;
    }

    readFunction(node: AstNode) {
        const firstBracket = node.matchedText.indexOf('(');
        const name = node.matchedText.slice(0, firstBracket);
        const fromFirstBracket = node.matchedText.slice(firstBracket);
        const lastBracket = findMatchingBracket(fromFirstBracket);

        const insideBrackets = fromFirstBracket.slice(1, lastBracket!);

        const args = splitTakingIntoAccountBrackets(insideBrackets).map(x => x.trim());

        console.log(args);
        node.name = name

        for(const arg of args) {
            const subLexer = new Lexer(arg, node);
            subLexer.readWhile();
        }

        return node;
    }

    isEOF() {
        return this.position + 1 > this.input.length;
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
        array: parse_dice_array,
    }

    constructor(public rootNode: AstNode) {

    }

    parse() {
        return this.rootNode.children.map((node) => {
            return this.parserFuncs[node.type](node);
        })
    }
}
