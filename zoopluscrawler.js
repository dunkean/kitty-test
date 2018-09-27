const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const slug = require('slugify');
var Crawler = require('node-webcrawler');
const moveFile = require('move-file');
var request = require('request');
var url = require("url");
var path = require("path");
var checkImage = require('image-check');
const download = require('image-downloader')
const util = require('util');

const asyncStat = util.promisify(fs.stat);

const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

String.prototype.clean = function () {
    if(this === "" || this == undefined)
      return "";
    else
      return this.trim().replace(/ +(?= )/g,'');
};

function clean(txt){
  if(txt === undefined)
    return "";
  else
    return txt.clean();
}

async function scrap() {
  const browser = await puppeteer.launch({headless: false});
  for(var i = 1; i < 31; i++) {
    try{
      const page = await browser.newPage();
      await page.goto(`http://www.zooplus.fr/esearch.htm#q=%2A%26p=${i}%26npp=192`, {waitUntil: 'networkidle2'});
      let searchHtml = await page.evaluate(() => document.querySelector('#search_result').innerHTML);
      await fs.writeFile(`./zooplusSearch${i}.html`, searchHtml, 'utf8', function(err){
          console.log(err);
      });
      await page.close();
    }catch(e){
      console.log(e);
    }
  }
  browser.close();
};

//scrap();

async function parse() {
  var elements = {};
  for(var i = 1; i < 31; i++) {
    try{
      //TODO variants
        const $ = cheerio.load(fs.readFileSync(`./zooplusSearch${i}.html`));
        $('#exo-result-list li').each(function (i, elem) {
          var elemA = $(this).find('a.exo-prod-url.follow3');
          var elem = {
            title: clean(elemA.attr('title')),
            url: elemA.attr('href'),
            img: $(this).find('.image img').attr('src'),
            desc: clean($(this).find('.summary').text()),
            delivery: clean($(this).find('.delivery-time').text()),
            prices: $(this).find('.variants li').map(
              function(){
                if(clean($(this).find('.variant').text()).substr(2) != "")
                return {
                  name:  clean($(this).find('.variant').text()).substr(2),
                  normal: clean($(this).find('.price .before').text().replace(/Prix habituel|Prix conseillé|À l’unité/,"")),
                  reduced: clean($(this).find('.price .val').text()),
                  unit: clean($(this).find('.price .unit').text())
                };
              }
            ).toArray()
          };
          elements[slug(elem.title)] = elem;
          //return false;
        });
    }catch(e){
      console.log(e);
    }
  }
  delete elements[""];
  console.log(Object.keys(elements).length);
  await fs.writeFile(`./zooplusList.json`, JSON.stringify(elements, null, 2), 'utf8', function(err){
      console.log(err);
  });

}

//parse();


var productCrawler = new Crawler({
    maxConnections : 10,
    callback : productPage
});

function removeSpecChar(name) {
  return
}
async function productPage(error, result, $) {
    if(error){
        console.log(error);
    }else{
      console.log(result.uri);
      var name = urlNameMap[result.uri];
      await fs.writeFile(`./zooplus/${name}.html`, $('body').html(), 'utf8', function(err){
          console.log(err);
      });
    }
}

var zooplusList = require(`./zooplusList.json`);
var urlNameMap = {};

async function scrapAllPages() {
  var keys = Object.keys(zooplusList);
  for(var i in Object.keys(zooplusList)) {
    var url = 'http://www.zooplus.fr/' + zooplusList[keys[i]].url;
    urlNameMap[url] = keys[i];
    console.log(i);
    productCrawler.queue(url);
  }
}
//scrapAllPages();

async function cleanJSON() {
  var keys = Object.keys(zooplusList);
  for(var name of keys) {
    var chain = /(:)|(')|(")/g;
    if(name.match(chain)) {
      /*var cleanName = name.replace(chain, "");
      if(zooplusList[cleanName] != undefined)
        delete zooplusList[name]
        //zooplusList[cleanName] = zooplusList[name];*/
        console.log(name);
    }
  }
  /*await fs.writeFile(`./zooplusList.json`, JSON.stringify(zooplusList, null, 2), 'utf8', function(err){
      console.log(err);
  });*/
}

async function checkIfHtml() {
  var keys = Object.keys(zooplusList);
  for(var name of keys) {
    (async function(name){
      await fs.stat(`./zooplus/${name}.html`, async function(err, stat) {
        if(err == null) {
            //console.log('File exists');
        } else {
          console.log(name);
          /*var url = 'http://www.zooplus.fr' + zooplusList[name].url;
          urlNameMap[url] = name;
          productCrawler.queue(url);*/
        }
      });
    }(name));
  }
}
//checkIfHtml();
//cleanJSON();

async function cleanFiles() {
  var folder = './zooplus/';
  fs.readdir(folder, (err, files) => {
    files.forEach(file => {
      var name = file.replace('.html','');
      if(zooplusList[name] == undefined) {
        //console.log(name);
        (async () => {
            await moveFile('./zooplus/' + file, './zooplus/discarded/' + file);
            //console.log('File moved');
        })();
      }
    });
  })
}

//cleanFiles();


async function parseProductFile() {
  var folder = './zooplus/';
  var data = {};
  fs.readdir(folder, (err, files) => {
    //files = files.slice(0,2);
    files.forEach(
      file => {
      var product_name = file.replace('.html','');
      const $ = cheerio.load(fs.readFileSync('./zooplus/' + file));
      try{
          var obj = {};
          obj.name = clean($('.pd__title meta[itemprop="name"]').attr('content').trim());
          obj.brand = clean($('.pd__title meta[itemprop="brand"]').attr('content'));
          obj.meta_description = $('.product__description meta[itemprop="description"]').attr('content');
          obj.livraison = $('.additional__costs__info small').eq(0).text().replace('Lire la suite','').trim();
          obj.breadcrumb = $('.breadcrumb .greentextsmall').map(
            function(){
              var txt = clean($(this).text());
              if(txt != '/')
                return txt;
            }
          ).toArray().slice(1);
          obj.imgs = $('.js-vertical__thumbnail').map(
            function(){
              return $(this).find('img').attr('src')
            }
          ).toArray();
          obj.prices = $('.product__variants .product__offer').map(
            function(){
              return {
                name: clean($(this).find('.product__varianttitle').text()).split('\n')[0],
                gtin13: $('meta[itemprop="gtin13"]').attr('content'),
                price: $(this).find('meta[itemprop="price"]').attr('content'),
                currency: $(this).find('meta[itemprop="priceCurrency"]').attr('content'),
                unit: clean($(this).find('.product__smallprice__text').eq(1).text().replace(/\n/g,''))
              };
            }
          ).toArray();
        }catch(e){
          console.log('########################################');
          console.log(product_name);
          console.log(e);
        }
        try{
          obj.description = entities.encode($('#description-panel .information__tab__content article').html());
        }catch(e){
          console.log('-------desc ---------');
          console.log(product_name);
          console.log(e);
        }
        try{
          obj.ingredients = entities.encode($('#ingredients-panel .information__tab__content article').html());
        }catch(e){
          console.log('-------ing ---------');
          console.log(product_name);
          console.log(e);
        }
          try{
          obj.feedingrecommandation = entities.encode($('#feedingrecommendation-panel .information__tab__content article').html());
        }catch(e){
          console.log('-------reco ---------');
          console.log(product_name);
          console.log(e);
        }
          console.log(product_name);
          zooplusList[product_name].content = obj;
    }
  );
  const ordered = {};
  Object.keys(zooplusList).sort().forEach(function(key) {
    ordered[key] = zooplusList[key];
  });

    fs.writeFile(`./zooplusProducts.json`, JSON.stringify(ordered, null, 2), 'utf8', function(err){
      console.log(err);
    });
});
}

//parseProductFile();

const products = require('./zooplusProducts.json');

// var download = function(uri, filename, callback){
//   try{
//     request.head(uri, function(err, res, body){
//       /*console.log('content-type:', res.headers['content-type']);
//       console.log('content-length:', res.headers['content-length']);*/
//       request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//     });
//   }catch(e) {
//     console.log(e);
//   }
// };

//http://shop-cdn.shpp.ext.zooplus.io/bilder/
//http://media17.mediazs.com/bilder/



async function assertImg(img_url, img_name, size) {
  try{
    img_url = img_url.replace('/50/','/'+size+'/');

    await fs.stat(`./zooplus/img${size}/${img_name}`, async function(err, stat) {
      if(err == null) {
        console.log("testing " + img_name + " " + stat.size);
        if(stat.size < 500) {
          console.log("-------------------");
          return false;
        }
        await checkImage(`./zooplus/img${size}/${img_name}`).then((data) => {
            const width = data.width;
            const height = data.height;
            if(width < size ||height < size)
              return false;
        }).catch((err) => {
            // handle error
        });
        return true;
      } else {
        return false;
      }
    });
  } catch(e) {
    console.log(e);
    return false;
  }
  return false;
}



async function checkImg() {
  for (var i = 500; i < 1000; i++) {
    var key = Object.keys(products)[i];
    var imgs_url = products[key].content.imgs;
    var exists = true;
    for (img_url of imgs_url) {
      var img_name = path.basename(url.parse(img_url).pathname);
      if( !assertImg(img_url, img_name, 60) ) console.log("60: " + i + ">" + key);
      // if( !assertImg(img_url, img_name, 300) ) console.log("200: " + i + ">" + key);
      // if( !assertImg(img_url, img_name, 1000) ) console.log("1000: " + i + ">" + key);
    }
    if(!exists)
      console.log("ERROR: " + i + ">" + key);
  }
}

var queue = [];

async function dequeue() {
  if(queue.length == 0)
    console.log("FINISHED");
  else {
    var options = queue.pop();
    console.log(`poping ${options.dest}`);

    try{
      res = await asyncStat(options.dest);
      console.log('already done.');
      dequeue();
    }
    catch(e) {
      download.image(options).then(
        ({ filename, image }) => {
            console.log('File saved to', filename)
            console.log(`${queue.length} remaining.`)
            dequeue();
          }
        ).catch((err) => {
            console.error(err)
        })
    }
  }
}

async function dl(img_url, img_name, size) {

    img_url = img_url.replace('/50/','/'+size+'/');
    const options = {
      url: 'http:' + img_url,
      dest: `./zooplus/img${size}/${img_name}`
    }
    var res;
    try{
      res = await asyncStat(`./zooplus/img${size}/${img_name}`);
    }
    catch(e) {
      queue.push(options);
      console.log(`pushing missing ${img_name}`);
    }
    finally {
      if(res) {
        if(res.size < 10 ) {
          queue.push(options);
          console.log(`pushing too small ${img_name}`);
        }
      }
    }
}

async function launchDL() {
    var min = 0;
    var max = Object.keys(products).length;
    for (var i = min; i < max; i++) {
      var key = Object.keys(products)[i];
      // console.log(i + ">" + key);
      var imgs_url = products[key].content.imgs;
      for (img_url of imgs_url) {
        var img_name = path.basename(url.parse(img_url).pathname);
        console.log(`preparing ${img_name}`);
        await dl(img_url, img_name, 60);
        await dl(img_url, img_name, 300);
        await dl(img_url, img_name, 1000);
      }
    }
    console.log(`Objects ${max-min}/${Object.keys(products).length} > ${queue.length} imgs`);
    dequeue();
    dequeue();
    dequeue();
}
//checkImg();
launchDL();
