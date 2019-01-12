/* Get 4 bits resolution from 8bits */
export const to4bitResolution = (input: number[]): number[] => {
    const output: number[] = [];
    input.forEach((bar, index) => {
        const temp = Math.floor(bar / 16);
        const i = Math.floor(index / 2);
        if (index % 2 === 0) {
            output[i] = temp;
        } else {
            output[i] = (output[i] << 4) | temp;
        }
    });
    return output;
};

/* Get 8 bits resolution from 4bits */
export const from4bitResolution = (input: number[]): number[] => {
    const output: number[] = [];
    input.forEach((bar, index) => {
        const i1 = bar % 16;
        const i2 = Math.floor(bar / 16);
        output.push(i1, i2);
    });
    return output;
};
