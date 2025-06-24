const contentStyle = `
    <style>
        #detail_decorate_root .magic-0 {
            border-bottom-style: solid;
            border-bottom-color: #53647a;
            font-size: 24px;
            color: #53647a;
            font-style: normal;
            border-bottom-width: 2px;
            padding-top: 8px;
            padding-bottom: 4px;
        }

        #detail_decorate_root img {
            max-width: 100%;
        }
    </style>
`;

export const formatContent = (content) => {
    // remove noscript, default style
    content = content.replace(/(<noscript>.*<\/noscript>)|(<style>.*<\/style>)/gi, '');

    // convert data-src to src
    content = content.replace(/src="[^"]+"\s+data-src="([^"]+)"/g, 'src="$1"');

    // add custom style
    return contentStyle + content;
};