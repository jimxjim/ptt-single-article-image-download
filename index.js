const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const download = require('image-downloader');

if (!fs.existsSync('./img')) {
  fs.mkdirSync('./img');
}

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question(`Type PTT article link to download images: `, (link) => {

  const baseURL = link;

  let folderName = baseURL.split('/Beauty/')[1].replace('.html', '');

  axios.get(`${baseURL}`, { headers: { Cookie: "over18=1;" } })
  .then((search) => {
    const searchHTML = cheerio.load(search.data);
    const searchArr = [];
    searchHTML('#main-content > a[rel=nofollow]').each((i, elm) => {
      if (searchHTML(elm).attr('href').search('imgur') !== -1) {
        searchArr.push(searchHTML(elm).attr('href'));
      }
    });
    searchHTML('.article-meta-value', '.article-metaline').each((i, elm) => {
      if (i === 1) folderName = searchHTML(elm).text();
    });
    if (!fs.existsSync(`./img/${folderName}`)) {
      fs.mkdirSync(`./img/${folderName}`);
    }    
    return(searchArr);
  })
  .then(arr => {
    arr
    .reduce((p, c) => {
      return p.then(() => {
        const name = c.split('imgur.com/')[1];
        const id = name.split('.')[0];
        const hasFormat = (/^[A-Za-z|0-9]+.(jpg|png|gif|jpeg)$/).test(name);
        download.image({ url: `https://i.imgur.com/${hasFormat ? name : `${name}.jpg`}`, dest: `/Users/jim/Work/pttOver/img/${folderName}/${hasFormat ? name : `${name}.jpg`}`, extractFilename: false })
        .then(({ filename }) => {
          console.log('Saved to', filename);
          Promise.resolve();
        })
        .catch((err) => console.error(err))
        Promise.resolve();
      })
    }, Promise.resolve());
    Promise.resolve();
  })
  .catch(error => {
    console.log(error);
    Promise.resolve(error);
  });
  readline.close()
})
