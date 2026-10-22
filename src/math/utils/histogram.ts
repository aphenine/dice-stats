/**
 * Counts values into bins of width `size`. Keys are each bin's lower bound,
 * so with `size` 1 the keys are the values themselves.
 */
export function histogram(data: number[], size: number): Record<number, number> {
    const counts: Record<number, number> = {};

    for (const item of data) {
        const bin = Math.floor(item / size) * size;
        counts[bin] = (counts[bin] ?? 0) + 1;
    }

    return counts;
}
