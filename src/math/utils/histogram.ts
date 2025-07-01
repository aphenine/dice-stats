export function histogram(data: number[], size: number): Record<number, number> {
    let min = Infinity;
    let max = -Infinity;

    for (const item of data) {
        if (item < min) min = item;
        else if (item > max) max = item;
    }

    const bins = Math.ceil((max - min + 1) / size);

    console.log(bins);

    // const histogram = new Array(bins).fill(0);
    const histogram: Record<number, number> = {};

    for (const item of data) {
        const value = Math.floor((item) / size);
        if (value in histogram) {

            histogram[value]++;
        } else {
            histogram[value] = 1;
        }
    }

    return histogram;
}