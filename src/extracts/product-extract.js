import { getBaseUrl } from '../helpers/crawler-helper.js';

export const getImageData = (mediaItem) => {
    return mediaItem.imageUrl;
};

export const getVideoData = (mediaItem) => {
    const video = mediaItem.videoUrl.hd || mediaItem.videoUrl.sd || mediaItem.videoUrl.ld; 
    return {
        id: mediaItem.id,
        duration: mediaItem.duration,
        width: mediaItem.width,
        height: mediaItem.height,
        cover: mediaItem.videoCoverUrl,
        url: video.videoUrl
    };
};

export const getProductData = (url, $, detailData) => {
    const { globalData: { product, seo, seller } } = detailData;
    const title = product.subject;

    // meta
    const keywords = seo.keyWord? seo.keyWord.split('\n') : [];
    const categoryNames = seo.breadCrumb.pathList.map((item) => item.hrefObject.name).filter((name) => name !== 'Home');
    // seller

    const destSeller = {
        company: {
            id: seller.companyId,
            name: seller.companyName,
            type: seller.companyBusinessType,
            years: seller.companyJoinYears,
            logo: (seller.companyLogoFileUrlSmall || '').replace('_80x80.png', ''),
            logoSmall: seller.companyLogoFileUrlSmall || '',
            employeesCount: seller.employeesCount,
            url: seller.companyProfileUrl,
            homeUrl: getBaseUrl(seller.homeUrl),
            bgImg: seller.bgImg,
            feedbackUrl: seller.feedbackUrl,
            subDomain: seller.subDomain
        },
        contact: {
            name: seller.contactName,
            jobTitle: seller.jobTitle,
            image: (seller.accountPortraitImage && seller.accountPortraitImage['200x200']) || '',
        },
        verified: seller.verifiedManufactruers,
        medalIcon: seller.medalIcon,
        highlight: seller.showCompanyHighLight,
        responseTime: seller.responseTimeText,
        ratingReviews: seller.supplierRatingReviews,
        leadSupplier: seller.leadSupplier,
        authCards: seller.authCards,
        businessTypeAuth: seller.isCompanyBusinessTypeAuth,
    };
    
    // media
    
    const thumbnail = $('link[rel="preload"][as="image"]').attr('href');
    const images = [];
    const videos = [];

    const mediaItems = product.mediaItems || [];
    for (const mediaItem of mediaItems) {
        if (mediaItem.type === 'image') {
            images.push(getImageData(mediaItem));
        }
        else if (mediaItem.type === 'video') {
            videos.push(getVideoData(mediaItem));
        }
    }

    // price

    const price = { list: [] };
    const srcPrices = product.price?.productLadderPrices || [];
    let priceMin = -1;
    let priceMax = -1;
    for (const srcPrice of srcPrices) {
        if (priceMin === -1) {
            priceMin = srcPrice.dollarPrice;
        }
        else if (priceMin > srcPrice.dollarPrice) {
            priceMin = srcPrice.dollarPrice;
        }
        if (priceMax === -1) {
            priceMax = srcPrice.dollarPrice;
        }
        else if (priceMax < srcPrice.dollarPrice) {
            priceMax = srcPrice.dollarPrice;

        }
        price.list.push({ dollarPrice: srcPrice.dollarPrice });
    }
    
    price.min = { dollarPrice: priceMin };
    price.max = { dollarPrice: priceMax };

    // basic properties
    const basicProperties = {};
    const srcBasicProperties = product.productBasicProperties || [];
    for (const srcBasicProperty of srcBasicProperties) {
        basicProperties[srcBasicProperty.attrName] = {
            name: srcBasicProperty.attrName,
            value: srcBasicProperty.attrValue,
        };
    }

    // industry properties
    const industryProperties = {};
    const srcIndustryProperties = product.productKeyIndustryProperties || [];
    for (const srcIndustryProperty of srcIndustryProperties) {
        industryProperties[srcIndustryProperty.attrName] = {
            name: srcIndustryProperty.attrName,
            value: srcIndustryProperty.attrValue,
        };
    }

    // other properties
    const otherProperties = {};
    const srcOtherProperties = product.productOtherProperties || [];
    for (const srcOtherProperty of srcOtherProperties) {
        otherProperties[srcOtherProperty.attrName] = {
            name: srcOtherProperty.attrName,
            value: srcOtherProperty.attrValue
        };
    }

    // sku
    const srcSku = product.sku || {};

    const sku = {
        firstSkuId: srcSku.firstSkuId,
        attributes: {},
        skuInfoMap: srcSku.skuInfoMap,
    };
    
    for (const skuAttr of srcSku.skuAttrs || []) {
        sku.attributes[skuAttr.id] = {
            id: skuAttr.id,
            name: skuAttr.name,
            type: skuAttr.type,
            values: skuAttr.values
        };
    }

    return {
        id: product.productId,
        categoryId: product.productCategoryId,
        url,
        title,
        thumbnail,
        videos,
        images,
        price,
        basicProperties,
        industryProperties,
        otherProperties,
        sku,
        categoryNames,
        keywords,
        seller: destSeller,
    };
};