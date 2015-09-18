'use strict';

const async = require('async');
const cheerio = require('cheerio');
const request = require('superagent');
const fs = require('fs');
const path = require('path');

const pages = [];

for (let i = 1; i <= 48; i++) {
  pages.push(i);
}

const ranking = [];

let completed = 0;

async.each(pages, (page, callback) => {
  request
    .get(`http://www.mgstage.com/monthly/shiroutotv/list/video/all/${page}/table/date/all/`)
    .set('cookie', 'adc=1')
    .set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36')
    .end((err, res) => {
      if (err) return callback(err);

      const $ = cheerio.load(res.text);

      $('.item_layout_04').each((i, el) => {
        const url = $(el).children('a').attr('href');
        const playCount = $(el).children('span').text().match(/再生回数：([0-9]+)回/)[1];

        ranking.push({
          url: url,
          playCount: playCount
        });
      });

      completed += 1;

      console.log(completed + ' / ' + pages.length);

      callback();
    });
}, err => {
  if (err) throw err;

  ranking.sort((a, b) => {
    return b.playCount - a.playCount;
  });

  fs.writeFile(path.normalize(`${__dirname}/ranking.txt`), JSON.stringify(ranking), err => {
    if (err) throw err;
  });
});
