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


interface IBlobInfo {
    blob: Blob;
    name: string;
    type: string;
}

/* Convert file to blob */
export const convertFileToBlob = (file: File): Promise<IBlobInfo> => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onloadend = (e: any) => {
            const blob = new Blob([e.target.result], {type: file.type});
            resolve({
                blob,
                name: file.name,
                type: file.type,
            });
        };
        fileReader.onerror = (err) => {
            reject(err);
        };
        fileReader.readAsArrayBuffer(file);
    });
};
