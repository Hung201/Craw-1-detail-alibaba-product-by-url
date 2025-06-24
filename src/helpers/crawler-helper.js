export const createRandomSleep = (min, max) => {
    return min + Math.random() * (max - min);
};

export const getBaseUrl = (url) => {
    try {
        const urlParse = new URL(url);
        return urlParse.origin;
    }
    catch (e) {
        return '';
    }
};

export const getDomain = (url) => {
    try {
        const urlParse = new URL(url);
        return urlParse.hostname;
    }
    catch (e) {
        return '';
    }
};

export const getProductIdFromUrl = (url) => {
    const idMatch = /_(\d+)\.html/.exec(url);
    if (idMatch) {
        return idMatch[1];
    }
    return 0;
};

export const createProductDescUrl = (id) => {
    return `https://www.alibaba.com/event/app/mainAction/desc.htm?detailId=${id}&language=en`;  
};

export const productDetailPatternUrl = () => {
    return `https://www.alibaba.com/product-detail/*`;
};