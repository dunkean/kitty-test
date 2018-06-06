const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const slug = require('slugify');

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

parse();
