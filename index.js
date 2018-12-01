// express server
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

const { getIndependent, getBBCNews, shuffleStories } = require('./utils')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function getAllNews() {
    let news = [];
    try {
        let bbc = await getBBCNews();
        let indy = await getIndependent();
        news = bbc.concat(indy);
        console.log('news length: ', news.length);
    } catch (error) {
        console.log('getAllNews error: ', error);
    }
    return news;
}

const newsAsJson = getAllNews();


var appRouter = (app) => {

    // root gets all stories afresh and shuffles them
    app.get("/morning", async (req, res) => {
        const newsAsJson = await getAllNews();
        const shuffled = shuffleStories(newsAsJson);
        res.send(JSON.stringify(shuffled))
    });

    // cache just gets fresh stories array & cache's it
    app.get("/afternoon", async (req, res) => {
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        // cacheing - public (server), max age we can store this on user browser
        // smaxage is how long we store on server.
        const newsAsJson = await getAllNews();
        res.send(JSON.stringify(newsAsJson));
    });
}

appRouter(app);

var server = app.listen(process.env.PORT || 5000, () => {
    console.log("app running on port.", server.address().port);
});


