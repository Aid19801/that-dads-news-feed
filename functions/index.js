
// server
const functions = require('firebase-functions');
const express = require('express');
var bodyParser = require('body-parser');
const app = express();

const { getIndependent, getBBCNews, shuffleStories } = require('./utils')

app.get('/api', (req, res) => {
    
    setTimeout(() => {
        let morning = JSON.stringify({ jordan: 'peterson', peter: 'jordy' });
        res.send(morning);
    }, 1000)

});


app.get('/api-cached', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600')

    console.log('beginning scrape...');

    const arr = [{ foo: 'bar' }, { bar: 'foo' }];
    let json = JSON.stringify(arr);
    res.send(json);

})

exports.app = functions.https.onRequest(app);
