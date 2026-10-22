import { ArithmeticOperatorSymbol } from "../engine/operators/arithmetic";

interface BaseNode {
    /** The source text this node was parsed from, used in error messages. */
    text: string;
    position: number;
}

export interface DiceNode extends BaseNode {
    kind: "dice";
    faces: number;
}

export interface DiceArrayNode extends BaseNode {
    kind: "diceArray";
    count: number;
    faces: number;
}

export interface ConstantNode extends BaseNode {
    kind: "constant";
    value: number;
}

export interface CallNode extends BaseNode {
    kind: "call";
    name: string;
    args: AstNode[];
}

export interface BinaryNode extends BaseNode {
    kind: "binary";
    operator: ArithmeticOperatorSymbol;
    left: AstNode;
    right: AstNode;
}

export type AstNode = DiceNode | DiceArrayNode | ConstantNode | CallNode | BinaryNode;
