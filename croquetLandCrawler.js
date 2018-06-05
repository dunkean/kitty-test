var Crawler = require("node-webcrawler");
var url = require('url');
var fs = require('fs');
var request = require('request');
var cheerioTableparser = require('cheerio-tableparser');
var cheerio = require('cheerio');
var products = {};
var slug = require('slugify');
var html2json = require('html2json').html2json;
var json2html = require('html2json').json2html;
var base64 = require('base-64');
var util = require('util');

const readFile = util.promisify(fs.readFile);

String.prototype.collapse = function () {
    return this.replace(/ +(?= )/g,'');
};

String.prototype.clean = function () {
    if(this === "" || this == undefined)
      return "";
    else
      return this.trim().replace(/ +(?= )/g,'');
};

function productPage(error, result, $) {
    if(error){
        console.log(error);
    }else{
        cheerioTableparser($);
        //var title = $('.col-main .product-view .fiche-content #productview .content-left .product-description-mobile .title').text();
        var title = $('.product-description .title').text().clean();
        var name = slug(title);
        //products[name] = {};
        console.log(name);
        if(!products.hasOwnProperty(name))
          products[name] = {};
        //console.log(products[name] != null);
        products[name].title = title;
        products[name].brand = $('meta[itemprop="brand"]').attr("content");
        products[name].short_description = $('.product-description .description').text().trim().collapse();
        products[name].race = $('[itemtype="http://schema.org/BreadcrumbList"]').children().eq(1).text().split('\n')[0].trim().collapse();
        var breadcrumb = $('[itemtype="http://schema.org/BreadcrumbList"]').find('span[itemprop="name"]').map(
          function(){return $(this).text();}
        ).toArray().splice(1);
        products[name].breadcrumb = breadcrumb;
        products[name].type = breadcrumb[breadcrumb.length - 1];
        products[name].img75_url = $('.thumb-link img').attr("src");
        products[name].img1980_url = $('.product-image-gallery').find('img').attr('src');
        var productItems = $('.content-tableau-produit-desktop .product-items').map(
          function(){
            return {
              weight: $(this).find('.column.weight').text().trim().collapse(),
              price: $(this).find('.fullprice ').text().trim().collapse(),
              weightprice: $(this).find('.weightprice').text().trim().collapse()
            }
          }
          ).toArray();
        products[name].conditionnement = productItems;
        var sections = $('.collateral-tabs .tab span').map(function(){return $(this).text();}).toArray();
        var sectionsContent = $('.collateral-tabs .tab-content').map(function(){return $(this).html();}).toArray();
        var description = [];
        for(var i=0;i<sections.length;i++) {
          //console.log(sections[i]);
          description.push({title:sections[i], content:base64.encode(sectionsContent[i])});
        }
        products[name].description = description;
        //console.log(JSON.stringify(description));
        products[name].composition_table = $('#product-composition-specs-table').parsetable(true,true,true);
    }
}

async function saveProducts() {
    fs.writeFile(`./CroquetteLand_products${currentProduct}.json`, JSON.stringify(products, null, "  "), 'utf8', function(err){
        console.log(err);
    });
};


async function saveProductList() {
    fs.writeFile('./CroquetteLand_list.json', JSON.stringify(products, null, "  "), 'utf8', function(err){
        console.log(err);
    });
};


function productList(error, result, $) {
    if(error){
        console.log(error);
    }else{
        var img_produits = $('.l-block-search-result-grid-list-item');
        img_produits.each(function (i, elem) {
            var name = $(this).children('.product-item-name').text().trim().collapse();
            var url = $(this).children('link').attr('content').trim();
            var img180_url = $(this).children('.product-image').children('img').attr('src').trim();
            products[slug(name)] = {
                name: name,
                url: url,
                thumbnail_url: img180_url
            };
            //console.log(JSON.stringify(products[slug(name)]));
            //productCrawler.queue(url);
            //return false;
        });
    }
}

var listCrawler = new Crawler({
    maxConnections : 5,
    callback : productList
});

var productCrawler = new Crawler({
    maxConnections : 5,
    callback : productPage
});

productCrawler.on('drain',function(){
    saveProducts();
    if(currentProduct < nbProducts-1) {
      var i;
      products = {};
       for(i = currentProduct; i < Math.min(nbProducts, currentProduct+500); i++) {
            var url = jsonProducts[keysProducts[i]].url;
            products[keysProducts[i]] = jsonProducts[keysProducts[i]];
            productCrawler.queue(url);
        }
        currentProduct = i;
      } else {
        console.log("done scraping");
      }
});

listCrawler.on('drain',function(){
    saveProductList().then(function(){
      console.log("done listing");
      scrapProducts();
    }
    );

});

var nbProducts;
var currentProduct = 0;
var jsonProducts;
var keysProducts;

async function scrap() {
  var i;
   for(i = currentProduct; i < Math.min(nbProducts, currentProduct+500); i++) {
        var url = jsonProducts[keysProducts[i]].url;
        products[keysProducts[i]] = jsonProducts[keysProducts[i]];
        productCrawler.queue(url);
    }
    currentProduct = i;
}

async function scrapProducts() {
  fs.readFile(require.resolve("./CroquetteLand_list.json"), (err, data) => {
    if (err)
      console.log(err);
    else {
      jsonProducts = JSON.parse(data);
      keysProducts = Object.keys(jsonProducts);
      nbProducts = keysProducts.length;
      scrap();
    }
  })

}

async function scrapList() {
  "https://www.croquetteland.com/catalogsearch/result/index/?p=1&q=%"
  for(var page = 1; page < 65; page++) {
    var url = `https://www.croquetteland.com/catalogsearch/result/index/?p=${page}&q=%`;
    listCrawler.queue(url);
  }
}

function simpleLocalTest() {
  var $ = cheerio.load(fs.readFileSync('./test.html'));
  productPage(null,null,$);
  saveProducts();
}

async function mergeJsons() {
  var result = {};
  for (var i = 1; i < 9; i++) {
    try {
      var data = await readFile(require.resolve(`./CrokLandProds (${i}).json`));
      var json = JSON.parse(data);
      var keys = Object.keys(json);
      console.log(i + " " + keys.length);
      for(var key of keys) {
  //      console.log(key);
//        result[key] = {};
        result[key] = json[key];
      }
    }catch(e){
      console.log(e);
    }
  }
  fs.writeFile(`./CroquetteLand_products.json`, JSON.stringify(result, null, "  "), 'utf8', function(err){
      console.log(err);
  });
}

mergeJsons();
//scrapList();
//scrapProducts();
//parseJson();
//simpleLocalTest();
