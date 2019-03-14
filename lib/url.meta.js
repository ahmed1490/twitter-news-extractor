const fetch = require("node-fetch");
const {getMetadata, metadataRuleSets} = require('page-metadata-parser');
const domino = require('domino');
var async = require('async');

//check metadataRuleSets for existing rulesets

function parseParallel(shortUrls, logCallback = ()=>{}, concurrency=10) {

    const metadataByUrl = {};

    //todo: optimize - skip processing when a url is already processed

    async function processUrl(index, next) {
        const shortUrl = shortUrls[index];
        let response, metadata, html, doc;
        try {
            response = await fetch(shortUrl);
            html = await response.text();
        } catch(err) {
            console.log("ERROR parsing:",index, shortUrl, err);
            return next(err);
        }
        
        doc = domino.createWindow(html).document;
        metadata = getMetadata(doc, shortUrl);
        metadata.finalUrl = response.url; //expanded url when urls were shortened

        metadataByUrl[shortUrl] = metadata;

        if (metadata.finalUrl !== shortUrl) {
            console.log("SUCCESS shortUrl:", index, shortUrl, metadata.finalUrl);
        }
        next();
    };

    const q = async.queue(function abc(index, callback){
        processUrl(index, callback);
    }, concurrency);

    return new Promise((resolve, reject) => {
        q.drain = function() {
            console.log('ALL URLS HAVE BEEN PROCESSED');
            resolve(metadataByUrl);
        };

        //add items
        let i = 0;
        while (i< shortUrls.length){
            q.push(i, (function (i) {
                return function(err) {
                    if(err){
                        console.log('ERROR Pushing ',i, shortUrls[i], err);
                        logCallback(i);
                        // reject(err);
                    } else {
                        console.log("done i:", i);
                    }
                }
            })(i));
            i++;
        }
    });
}

module.exports = parseParallel;

/* default metadataRuleSets 
    { description, icon, image, keywords, title, language, type, url, provider}
    https://github.com/mozilla/page-metadata-parser/blob/b4ca23afced5dcfa9cea5cdc2ed2ddda58bf27d4/parser.js#L64

*/



/*function usingPageMetadataParser(){
    const fetch = require("node-fetch");
    const {getMetadata, metadataRuleSets} = require('page-metadata-parser');
    const domino = require('domino');

    let url = 'https://www.aljazeera.com/programmes/countingthecost/2019/03/silatech-empowers-mena-youth-hh-sheikha-moza-bint-nasser-190309091053836.html'
    let url1 = 'https://www.woorank.com/en/blog/dublin-core-metadata-for-seo-and-usability'; //fails with html-metadata

    async function load(){
        let startDate = new Date();
        const response = await fetch(url);
        const html = await response.text();
        const doc = domino.createWindow(html).document;

        const customDescriptionRuleSet = metadataRuleSets.description;
        customDescriptionRuleSet.rules.push([
            ['meta[property="twitter:title"]', element => element.getAttribute('content')],
            ['meta[property="twitter:image"]', element => element.getAttribute('content')],
            ['meta[property="og:image:width"]', element => element.getAttribute('content')],
        ]);

        const metadata = getMetadata(doc, url);
        // const metadata = getMetadata(doc, url, {description: customDescriptionRuleSet});

        let endDate = new Date();
        console.log('metadata', (endDate - startDate) / 1000, metadata);
    }
    load(); //0.7, 1.0, 1.195secs, 3.4, 2.1 for 'http://ow.ly/1Tcp30nYV0d'

    
    const result = {
        description:
            "Sheikha Moza bint Nasser discusses Silatech's efforts to boost youth employment in the MENA region.",
        icon:
            'https://www.aljazeera.com/mritems/assets/images/touch-icon-ipad-retina.png',
        image:
            'https://www.aljazeera.com/mritems/Images/2019/3/9/a4938c76931548c88378a46c0db8f502_18.jpg',
        keywords: undefined,
        title:
            'How Silatech empowers MENA youth: HH Sheikha Moza bint Nasser',
        language: undefined,
        type: undefined,
        url:
            'https://www.aljazeera.com/programmes/countingthecost/2019/03/silatech-empowers-mena-youth-hh-sheikha-moza-bint-nasser-190309091053836.html',
        provider: 'aljazeera'
    };
  
}*/


/*
function usingHTMLMetada(){
    const scrape = require('html-metadata');
    let url = 'https://www.aljazeera.com/programmes/countingthecost/2019/03/silatech-empowers-mena-youth-hh-sheikha-moza-bint-nasser-190309091053836.html'
    let url1 = 'https://www.woorank.com/en/blog/dublin-core-metadata-for-seo-and-usability'; //fails with html-metadata

    let startDate = new Date();
    scrape(url).then(function(metadata){
        let endDate = new Date();
        console.log('metadata', (endDate - startDate) / 1000, metadata);
    });
    //took 0.9, 1.2, 1.47secs, 1.8secs for 'http://ow.ly/1Tcp30nYV0d'

    const result = {
        general:
        {
            appleTouchIcons: [[Object], [Object], [Object], [Object]],
            canonical:
                'https://www.aljazeera.com/programmes/countingthecost/2019/03/silatech-empowers-mena-youth-hh-sheikha-moza-bint-nasser-190309091053836.html',
            description:
                "Sheikha Moza bint Nasser discusses Silatech's efforts to boost youth employment in the MENA region.",
            title:
                'How Silatech empowers MENA youth: HH Sheikha Moza bint Nasser | Qatar | Al Jazeera'
        },
        jsonLd:
            [{
                '@context': 'http://schema.org',
                '@type': 'Article',
                mainEntityOfPage:
                    'https://www.aljazeera.com/programmes/countingthecost/2019/03/silatech-empowers-mena-youth-hh-sheikha-moza-bint-nasser-190309091053836.html',
                headline:
                    'How Silatech empowers MENA youth: HH Sheikha Moza bint Nasser',
                datePublished: '09 Mar 2019 12:24 GMT',
                dateModified: '09 Mar 2019 12:22 GMT',
                description:
                    "Sheikha Moza bint Nasser discusses Silatech's efforts to boost youth employment in the MENA region.",
                author: [Object],
                publisher: [Object],
                image: [Object]
            },
            {
                '@context': 'http://schema.org',
                '@type': 'VideoObject',
                name:
                    'How Silatech empowers MENA youth: HH Sheikha Moza bint Nasser',
                description:
                    "Sheikha Moza bint Nasser discusses Silatech's efforts to boost youth employment in the MENA region.",
                thumbnailUrl:
                    'https://www.aljazeera.com/mritems/imagecache/mbdxxlarge/mritems/Images/2019/3/9/a4938c76931548c88378a46c0db8f502_18.jpg',
                uploadDate: '09 Mar 2019 12:22 GMT',
                publisher: [Object]
            }],
        openGraph:
        {
            title:
                'How Silatech empowers MENA youth: HH Sheikha Moza bint Nasser',
            description:
                "Sheikha Moza bint Nasser discusses Silatech's efforts to boost youth employment in the MENA region.",
            internalurl:
                'https://www.aljazeera.com/programmes/countingthecost/2019/03/silatech-empowers-mena-youth-hh-sheikha-moza-bint-nasser-190309091053836.html',
            url:
                'https://www.aljazeera.com/programmes/countingthecost/2019/03/silatech-empowers-mena-youth-hh-sheikha-moza-bint-nasser-190309091053836.html',
            image:
            {
                url:
                    'https://www.aljazeera.com/mritems/Images/2019/3/9/a4938c76931548c88378a46c0db8f502_18.jpg',
                width: '1000',
                height: '562'
            }
        },
        twitter:
        {
            image:
                'https://www.aljazeera.com/mritems/Images/2019/3/9/a4938c76931548c88378a46c0db8f502_18.jpg',
            card: 'summary_large_image',
            site: '@AJEnglish'
        }
    };
}
*/