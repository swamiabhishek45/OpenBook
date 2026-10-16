/**
 * Some PDF / embedding dependencies expect ES2025 `Math.sumPrecise`, which is not
 * available on all Node versions yet.
 */
const mathWithSumPrecise = Math as typeof Math & {
    sumPrecise?: (values: Iterable<number>) => number;
};

if (typeof mathWithSumPrecise.sumPrecise !== "function") {
    mathWithSumPrecise.sumPrecise = (values: Iterable<number>) => {
        let sum = 0;
        for (const value of values) {
            sum += value;
        }
        return sum;
    };
}
