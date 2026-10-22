/** Raised for any input the expression language rejects. */
export class ParseError extends Error {
    constructor(message: string, public readonly position: number) {
        super(`${message} (at position ${position})`);
        this.name = "ParseError";
    }
}
