export const createRandomSleep = (min, max) => {
    return min + Math.random() * (max - min);
}

export const getBaseUrl = (url) => {
    const urlParse = new URL(url);
    return urlParse.origin || '';
}