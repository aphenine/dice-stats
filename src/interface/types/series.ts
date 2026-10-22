export default interface Series {
    id: string;
    label: string;
    /** Individual numeric results; array-typed expressions are flattened into their values. */
    data: Array<number>;
}
