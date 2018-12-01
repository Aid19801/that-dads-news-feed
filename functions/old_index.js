
// server
const functions = require('firebase-functions');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api', (request, response) => {
    
    console.log('beginning scrape...');

    arrayOfNewsStoryObjects = [];
    let morning = [];

     getIndependent()
         .then((indy) => {
             console.log('Independent Scraped | Length of Stories: ', indy.length);
             getBBCNews()
                 .then((bbc) => {
                     console.log('BBC Scraped | Length of Stories: ', bbc.length);
                     const shuffledStories = shuffleStories(arrayOfNewsStoryObjects);
                     morning = JSON.stringify(shuffledStories);
                     console.log('BBC News & The Independent complete | 🤠 number of stories 💩: ', morning);
                     response.send(morning);
                 })
         }).catch(err => console.log('err: ', err));
});


// app.get('/api-cached', (request, response) => {
//     response.set('Cache-Control', 'public, max-age=300, s-maxage=600')
// })

exports.app = functions.https.onRequest(app);


// web scraper
const rp = require('request-promise');
const cheerio = require('cheerio');
let arrayOfNewsStoryObjects = [];

const optionsBBC = {
    uri: `https://www.bbc.co.uk/search?q=Dads&filter=news&suggid=`,
    transform: function (body) {
        return cheerio.load(body);
    }
};

const getBBCNews = () => {

    return new Promise((resolve, reject) => {
        rp(optionsBBC)
            .then(($) => {

                // capture the shared element that all useful bits feed-up into
                const articleElement = $('.search-results').find('li').find('article');

                $(articleElement).each((index, element) => {
                    let bbcNewsObject = {};

                    const org = 'BBC';
                    let headline = $(element).find('div').find('h1').find('a').text();
                    let blurb = $(element).find('div').find('.short').text();
                    let url = $(element).find('div').find('h1').find('a').attr('href');
                    let imgUrl = $(element).find('a').find('picture').find('img').attr('src');

                    // if image isnt there, put a placeholder in.
                    if (!imgUrl) {
                        imgUrl = 'https://nyuad.nyu.edu/en/academics/divisions/arts-and-humanities/faculty/salem-al-qassimi/_jcr_content/bio-info/image.adaptive.m1510292743173/394.jpg';
                    }

                    // if headline or URL are missing, abort adding this story to the feed.
                    if (!headline || !url) {
                        console.log(' ======== url or headline missing =======')
                        console.log(' ======== URL:', url)
                        console.log(' ======== headline:', headline);
                        return;
                    }

                    // create an object that assigns all the elements of a news story into one
                    // happy object 😎
                    Object.assign(bbcNewsObject, { org, headline, blurb, url, imgUrl });

                    // push it to main array of news stories
                    arrayOfNewsStoryObjects.push(bbcNewsObject);

                    // return for next scrape to use/add to
                    resolve(arrayOfNewsStoryObjects);
                });
                // log out the array.
                // console.log('arrayOfNewsStoryObjects: ', arrayOfNewsStoryObjects);
            })
            .catch((err) => {
                console.log('BBC News Scraping Error ====>> ', err);
                reject(err);
            });
    })
}

const optionsIndependent = {
    uri: `https://www.independent.co.uk/extras/indybest/kids`,
    transform: function (body) {
        return cheerio.load(body);
    }
};

const getIndependent = () => {
    return new Promise((resolve, reject) => {
        rp(optionsIndependent)
            .then(($) => {
                const articleElement = $('.articles').find('.article')
                $(articleElement).each((index, element) => {

                    // newsobject slowly gets filled with scrape info.
                    let IndyNewsObject = {};

                    // SOURCE
                    let org = 'Indy';

                    // URL / LINK FOR THE STORY
                    let linkFromIndy = $(element).find('a').attr('href');
                    let url = `https://www.independent.co.uk${linkFromIndy}`;

                    // HEADLINE
                    let headlinePrefix = $(element).find('.content').find('.capsules').find('a').find('span').text().trim();
                    let headlineMain = $(element).find('.content').find('a').find('.headline').text();

                    // IMAGE
                    let imgUrl = $(element).find('a').find('.amp-img').attr('src');


                    // if image isnt there, put a placeholder in.
                    if (!imgUrl) {
                        imgUrl = 'https://nyuad.nyu.edu/en/academics/divisions/arts-and-humanities/faculty/salem-al-qassimi/_jcr_content/bio-info/image.adaptive.m1510292743173/394.jpg';
                    }

                    // if headline or URL are missing, abort adding this story to the feed.
                    if (!headlinePrefix || !url) {
                        console.log('headline or url are missing, aborting');
                        return;
                    }

                    Object.assign(IndyNewsObject, {
                        org: 'Indy',
                        url: url,
                        headline: headlinePrefix + ': ' + headlineMain.replace(/\n/g, '').trim(),
                        imgUrl: imgUrl,
                    })

                    // push it to main array of news stories
                    arrayOfNewsStoryObjects.push(IndyNewsObject);
                })
                
                // return for next scrape to use/add to
                resolve(arrayOfNewsStoryObjects);
            })
            .catch((err) => reject(err));
    })
}

const shuffleStories = (arr) => {
    let shuffled = arr.map((each) => ({
            sort: Math.random(), value: each,
        })
    ).sort((a, b) => a.sort - b.sort)
        .map((each) => {
            return each.value;
        });
    return shuffled;
};
