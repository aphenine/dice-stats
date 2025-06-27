import { CONSTANT_REGEXP, DICE_ARRAY_REGEXP, FUNCTION_REGEXP, SINGLE_DICE_REGEXP, WHITESPACE_CHARS } from "./regexps";

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

function is_constant(text:string) {
    return CONSTANT_REGEXP.test(text);
}

export {
    is_whitespace,
    is_constant,
    is_single_dice,
    is_dice_array,
    is_function,
}