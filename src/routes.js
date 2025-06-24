import { createCheerioRouter, sleep } from 'crawlee';
import { createRandomSleep, getBaseUrl, getProductIdFromUrl, createProductDescUrl, productDetailPatternUrl } from './helpers/crawler-helper.js';
import { formatContent } from './helpers/content-helper.js';
import { getProductData } from './extracts/product-extract.js';

export const config = {
    pageStart: 1,
    pageEnd: 1,
    delayMin: 500,
    delayMax: 1000,
};

// dùng database lưu trạng thái đã chạy, đang chạy page nào, dừng ở đâu
// hoặc lưu các link đã chạy

const state = {
    page: config.pageStart
};

export const router = createCheerioRouter();

const findProductLinks = async (enqueueLinks, urls = []) => {
    const data = {};
    if (urls && urls.length > 0) {
        data.urls = urls;
    }
    else {
        data.globs = [productDetailPatternUrl()];
    }

    await enqueueLinks({
        label: 'detail',
        strategy: 'same-domain',
        ...data
    });
};

const addNextProductList = async (enqueueLinks, request) => {

    if (state.page <= config.pageEnd) {
        const baseUrl = getBaseUrl(request.loadedUrl);
        const productListUrl = `${baseUrl}/productlist-${state.page}.html`

        await enqueueLinks({
            label: 'product-list',
            strategy: 'same-domain',
            urls: [productListUrl]
        });

        state.page += 1;
    }    
};

router.addDefaultHandler(async ({ request, enqueueLinks, log }) => {
    log.info(`+ Start: ${request.loadedUrl}`);

    await addNextProductList(enqueueLinks, request);
});

router.addHandler('product-list', async ({ request, enqueueLinks, $, log }) => {
    log.info(`+ Product List: ${request.loadedUrl}`);

    try {
        const $muduleProductListElement = $('div[module-title="productListPc"]');
        const moduleProductListJson = decodeURIComponent($muduleProductListElement.attr('module-data'));
        const moduleProductList = JSON.parse(moduleProductListJson);
        const productListSrc = moduleProductList?.mds?.moduleData?.data?.productList || [];
        const productListUrl = productListSrc.map((item) => item.url);

        await findProductLinks(enqueueLinks, productListUrl);
    }
    catch(err) {
    }

    await addNextProductList(enqueueLinks, request);
});

router.addHandler('description', async ({ request, json, log, pushData }) => {
    log.info(`+ Description: ${request.loadedUrl}`);

    const destProduct = request.userData.destProduct;

    try {
        const htmlDescription = json?.data?.productHtmlDescription || '';
        destProduct.content = formatContent(htmlDescription);
        pushData(destProduct);
    }
    catch(err) {
    }

    await sleep(createRandomSleep(config.delayMin, config.delayMax));
});

router.addHandler('detail', async ({ request, enqueueLinks, $, log }) => {
    const url = request.loadedUrl;

    log.info(`+ Detail: ${url}`);

    try {
        // console.time('parse');

        const $scriptDataElement = $('#layout-other').next();
        let dataMatch = /window\.detailData\s*=\s*(.+?);\s*window\.detailData/s.exec($scriptDataElement.text());
        
        // console.timeEnd('parse');

        if (dataMatch) {
            
            const detailData = JSON.parse(dataMatch[1]);
            const destProduct = getProductData(url, $, detailData);

            const descriptionUrl = createProductDescUrl(getProductIdFromUrl(url));

            await enqueueLinks({
                label: 'description',
                forefront: true,
                strategy: 'same-domain',
                urls: [descriptionUrl],
                transformRequestFunction: (request) => {
                    request.userData.destProduct = destProduct;
                    return request;
                }
            });
        }
    }

    catch(err) {
    }

    await sleep(createRandomSleep(config.delayMin, config.delayMax));

    // await findProductLinks(enqueueLinks);
});

/*
+ viết API nhận dữ liệu bên B2B
+ xử lý Việt Hóa

*/