import { ConstantRollable } from "../engine/constant";
import { DiceRollable } from "../engine/dice";
import { DiceArrayRollable } from "../engine/dice-array";
import { FUNCTIONS, describeSignature, matchesSignature } from "../engine/functions";
import { createArithmeticOperator } from "../engine/operators/arithmetic";
import { AnyRollable, Rollable, isArrayRollable, typeName } from "../engine/rollable";
import { AstNode, BinaryNode, CallNode } from "./ast";
import { ParseError } from "./errors";

/** Turns an AST into a rollable engine, checking argument and operand types as it goes. */
export function build(node: AstNode): AnyRollable {
    switch (node.kind) {
        case "dice":
            return new DiceRollable(node.faces);
        case "diceArray":
            return new DiceArrayRollable(node.count, node.faces);
        case "constant":
            return new ConstantRollable(node.value);
        case "call":
            return buildCall(node);
        case "binary":
            return buildBinary(node);
    }
}

function buildCall(node: CallNode): AnyRollable {
    const definition = FUNCTIONS[node.name];
    if (!definition) {
        throw new ParseError(`Unknown function '${node.name}'`, node.position);
    }

    const args = node.args.map(build);
    const types = args.map((arg) => arg.type);

    if (!definition.signatures.some((signature) => matchesSignature(signature, types))) {
        const given = `${node.name}(${types.map(typeName).join(", ")})`;
        const accepted = definition.signatures.map((s) => describeSignature(node.name, s)).join(" or ");
        throw new ParseError(`${given} does not match ${accepted}`, node.position);
    }

    return definition.build(args);
}

function buildBinary(node: BinaryNode): AnyRollable {
    const left = expectScalar(build(node.left), node.left, node.operator);
    const right = expectScalar(build(node.right), node.right, node.operator);

    return createArithmeticOperator(node.operator, left, right);
}

function expectScalar(operand: AnyRollable, source: AstNode, operator: string): Rollable {
    if (isArrayRollable(operand)) {
        throw new ParseError(`'${operator}' requires scalar operands but '${source.text}' is an array`, source.position);
    }
    return operand;
}
