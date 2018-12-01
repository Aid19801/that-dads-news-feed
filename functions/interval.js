const fs = require('fs')

let count = 0;

setInterval(() => {

    let data = [];

    data.push({ headline: '2 this is a mock headline', url: 'http:sfblksb.com', imgUrl: 'https://img.org/2842y48' });
    data.push({ headline: '3 this is a mock headline', url: 'http:sfblksb.com', imgUrl: 'https://img.org/2842y48' });

    fs.writeFile('./functions/api.json', JSON.stringify(data), (err) => {
        if(err) {
            console.log(err)
        }
    });

    
    console.log('done')
}, 1000);