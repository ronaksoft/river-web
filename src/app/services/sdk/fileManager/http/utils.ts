/* Convert Uint8array to base64 */
export const uint8ToBase64 = (u8a: Uint8Array) => {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        // @ts-ignore
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return btoa(c.join(''));
};

/* Convert ArrayBuffer to base64 */
export const arrayBufferToBase64 = (arr: ArrayBuffer) => {
    const u8a = new Uint8Array(arr);
    return uint8ToBase64(u8a);
};

/* Convert Uint8array to base64 */
export const base64ToU8a = (base64: string) => {
    // @ts-ignore
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
};
