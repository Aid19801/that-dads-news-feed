// express server
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var appRouter = (app) => {
    app.get("/", (req, res) => {

        // 1. as soon as you hit root, clear the array
        arrayOfNewsStoryObjects = [];
        console.log('beginning scrape...');
        let morning = []; // clear the morning itinerary
        getIndependent()
            .then(() => {
                console.log('Independent Done...');
                getBBCNews()
                    .then(() => {
                        console.log('BBC Done...');
                        console.log('BBC News and The Independent done! number of stories: ', arrayOfNewsStoryObjects.length);
                        const shuffledStories = shuffleStories(arrayOfNewsStoryObjects);
                        morning = JSON.stringify(shuffledStories); // morning is the freshly shuffled assortment of news stories
                        res.send(morning); // send that as json to root calls.
                    })
            }).catch(err => console.log('err: ', err));
    });
}

appRouter(app);

var server = app.listen(process.env.PORT || 5000, () => {
    console.log("app running on port.", server.address().port);
});


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

                    // create an object that 
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
                const articleElement = $('.half-height');
                $(articleElement).each((index, element) => {

                    let independentNewsObject = {};

                    const org = 'The Independent';
                    const headline = $(element).find('.content').find('h1').text();
                    const blurb = $(element).find('.lead').text().trim();
                    const url = $(element).find('.container-half').find('.content').find('h1').find('a').attr('href');
                    let imgUrl = $(element).find('.image').attr('data-original');

                    if (!imgUrl) {
                        imgUrl = 'https://nyuad.nyu.edu/en/academics/divisions/arts-and-humanities/faculty/salem-al-qassimi/_jcr_content/bio-info/image.adaptive.m1510292743173/394.jpg';
                    }

                    if (!headline || !url) {
                        console.log(' ======== url or headline missing =======')
                        console.log(' ======== URL:', url)
                        console.log(' ======== headline:', headline);
                        return;
                    }

                    Object.assign(independentNewsObject, { org, headline, blurb, url: `https://www.independent.co.uk${url}`, imgUrl, });
                    arrayOfNewsStoryObjects.push(independentNewsObject);
                })
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
