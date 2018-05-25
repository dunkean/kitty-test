var Crawler = require("node-webcrawler");
var url = require('url');
var fs = require('fs');
var request = require('request');
var cheerioTableparser = require('cheerio-tableparser');
var products = {};
var slug = require('slugify');

String.prototype.collapse = function () {
    return this.replace(/ +(?= )/g,'');
};


function productList(error, result, $) {
    if(error){
        console.log(error);
    }else{
        console.log($("title").text());
        console.log("**************************");
        var img_produits = $('[title=PRODUITS]');
        console.log(img_produits.text());
        img_produits.each(function (i, elem) {
            //var name = $(this).children('.title').text().trim().collapse();
            //var small_desc = $(this).children('abstract').text().replace('\n','').replace('\t','').trim().collapse();
            //console.log($(this).text());
           /* var url = $(this).attr('href').trim();
            var img = $(this).children('img').attr('src').trim();
            products[slug(name)] = {
                name: name,
                small_desc: small_desc,
                url: url,
                thumbnail_url: img
            };
            //productCrawler.queue(url);
            //return false;*/
        });
    }
}

function productPage(error, result, $) {
    if(error){
        console.log(error);
    }else{
        cheerioTableparser($);
        var title = $("title").text();
        var name = slug(title.split(':')[0].trim().collapse());
        var typeRace = title.split(':')[1].split('|')[0].trim().collapse();
        var type = typeRace.split(' ')[0].trim().collapse();
        var race = typeRace.split(' ')[1].trim().collapse();
        console.log(title + ">" + name);

        products[name].type = type;
        products[name].race = race;
        products[name].img_url = $('meta[property="og:image"]').attr('content').trim();
        
        //avantages
        products[name].atouts = [];
        $('.atout_txt').each(function (i, elem) {
            var text = $(this).text().collapse();
            var title = $(this).children('h3').text().trim().collapse();
            var subText = text.replace(title,'');
            products[name].atouts.push({title:title, text:subText});
        });

        //conditionnement
        products[name].conditionnement = [];
        $('.rond').each(function (i, elem) {
            products[name].conditionnement.push($(this).text().trim().collapse());
        });

        //imgs
        products[name].img_set = [];
        var imgs = ($('.icon-contrat').nextUntil('div').next().children('img').attr('srcset')).split(", ");
        imgs.forEach(x=>{products[name].img_set.push(x.split(' ')[0].trim());});

        //conseils
        products[name].conseils = [];
        var conseils = $('.icon-contrat').nextUntil('ul').next();
        conseils.find('li').each(function (i, elem) {
            products[name].conseils.push($(this).text().trim().collapse());
        });

        //composition
        products[name].composition = $('.rations_table').eq(0).find('p').text().trim();

        //rations
        products[name].rations = $('.rations_table').eq(1).find('table').parsetable(true,true,true);
    }
}

function saveProducts() {
    fs.writeFile('./RoyalCanin.json', JSON.stringify(products, null, "  "), 'utf8', function(err){
        console.log(err);
    });   
};

var listCrawler = new Crawler({
    maxConnections : 10,
    callback : productList
});

var productCrawler = new Crawler({
    maxConnections : 10,
    callback : productPage
});

productCrawler.on('drain',function(){
    saveProducts();
    console.log("done");
});

listCrawler.queue('https://www.purina-proplan.fr/chien/all-products');
listCrawler.queue('https://www.purina-proplan.fr/chat/products-selector');
listCrawler.queue('https://www.purina-proplan.fr/veterinarydiets/produits-chat');
listCrawler.queue('https://www.purina-proplan.fr/veterinarydiets/produits-chien');
