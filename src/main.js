// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor } from 'apify';
// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { CheerioCrawler } from 'crawlee';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions

import { getProductData } from './extracts/product-extract.js';
import fs from 'fs';
import path from 'path';

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

const { productUrl } = await Actor.getInput() ?? {};

if (!productUrl) {
    throw new Error('Bạn cần nhập productUrl là link sản phẩm Alibaba!');
}

const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
});

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl: 1,
    requestHandlerTimeoutSecs: 120,
    minConcurrency: 1,
    maxConcurrency: 1,
    async requestHandler({ request, $, log, pushData }) {
        const url = request.loadedUrl;
        // Tìm script chứa detailData
        let detailData = null;
        $('script').each((i, el) => {
            const text = $(el).html();
            if (text && text.includes('window.detailData')) {
                const match = /window\.detailData\s*=\s*(\{.*?\});/s.exec(text);
                if (match) {
                    try {
                        detailData = JSON.parse(match[1]);
                    } catch (e) {
                        console.log('Lỗi parse detailData:', e);
                    }
                }
            }
        });
        if (!detailData) {
            log.error('Không tìm thấy detailData trên trang!');
            return;
        }
        const data = getProductData(url, $, detailData);
        await pushData(data);
        log.info('Đã lấy xong dữ liệu sản phẩm!');
    }
});

await crawler.run([productUrl]);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();