const api = require('./filler-api.js');
var CezerinClient = require('cezerin-client');
var slug = require('slugify');
var FormData = require('form-data');
var url = require("url");
var pathSolver = require("path");
var fs = require('fs');

const cez = new CezerinClient({
  apiBaseUrl: 'http://localhost:3001/api/v1',
  apiToken: 'TestToken'
});

async function initCategoryDatabase() {
  var id; var subId;
  id = await api.createCategory("Chien");
  subId = await api.createCategory("Nourriture", id);
  await api.createCategory("Croquettes", subId);
  await api.createCategory("Boites", subId);
  await api.createCategory("Autre", subId);
  subId = await api.createCategory("Véto", id);
  await api.createCategory("En bonne santé", subId);
  await api.createCategory("En cours de traitement", subId);
  /*await api.createCategory("Anti-parasites", subId);
  await api.createCategory("Vitamines", subId);
  await api.createCategory("Cosmétiques", id);
  subId = await api.createCategory("Nourriture Véto", subId);
  await api.createCategory("Affection du bas appareil urinaire", subId);
  await api.createCategory("Convalescence et soins intensifs", subId);
  await api.createCategory("Dermatose et dépilation", subId);
  await api.createCategory("Diabète", subId);
  await api.createCategory("Gestion du poids", subId);
  await api.createCategory("Hygiène bucco-dentaire", subId);
  await api.createCategory("Insuffisance cardiaque", subId);
  await api.createCategory("Insuffisances rénales", subId);
  await api.createCategory("Intolérance alimentaire", subId);
  await api.createCategory("Mobilité articulaire", subId);
  await api.createCategory("Stress et Anxiété", subId);
  await api.createCategory("Troubles digestifs", subId);
  await api.createCategory("Troubles hépatiques", subId);*/

  id = await api.createCategory("Chat");
  subId = await api.createCategory("Nourriture", id);
  await api.createCategory("Croquettes", subId);
  await api.createCategory("Boites", subId);
  await api.createCategory("Autre", subId);
  subId = await api.createCategory("Véto", id);
  await api.createCategory("En bonne santé", subId);
  await api.createCategory("En cours de traitement", subId);
  /*
  subId = await api.createCategory("Nourriture", id);
  await api.createCategory("Croquettes", subId);
  await api.createCategory("Pâtées", subId);
  await api.createCategory("Friandises", subId);
  subId = await api.createCategory("Soins", id);
  await api.createCategory("Nourriture Véto", subId);
  await api.createCategory("Anti-parasites", subId);
  await api.createCategory("Vitamines", subId);
  await api.createCategory("Cosmétiques", id);*/
/*
  id = await api.createCategory("Rongeurs & Co");
  await api.createCategory("Lapins", id);
  await api.createCategory("Furets", id);
  await api.createCategory("Cochons d'inde", id);
  await api.createCategory("Hamster", id);
  await api.createCategory("Autres", id);
  await api.createCategory("Soins", id);

  id = await api.createCategory("Oiseaux");
  await api.createCategory("Nourriture", id);
  await api.createCategory("Soins", id);

  id = await api.createCategory("Poissons");
  await api.createCategory("Nourriture", id);
  await api.createCategory("Soins", id);*/
}


/****** CALLS *********/
function ID() {
  return Math.random().toString(36).substr(2, 9);
};

function PRICE() {
  return Math.floor(Math.random() * 100) / 10 + 1;
};

function COUNT() {
  return Math.floor(Math.random() * 100) + 1;
};

var d = new Date();
var year = d.getFullYear();
var month = d.getMonth();
var day = d.getDate();
var toDate = new Date(year + 2, month, day);
var fromDate = d;

var json = require('./RoyalCanin.json');
var jsonAttr = require('./RC_categories.json');

function getAttributes(obj) {
  var attr = [];
  for(var attrName in obj.category_codes) {
    for(var catName in jsonAttr.attributes) {
      if(jsonAttr.attributes[catName][obj.category_codes[attrName]] != undefined)
        attr.push({name:catName, value:jsonAttr.attributes[catName][obj.category_codes[attrName]]});
    }
  }
  attr.push({name:"Marque", value:"Royal Canin"});
  return attr;
}

function productFromRCJson(obj, weight, category)
{
  var attrib = getAttributes(obj);
  console.log(attrib);
  var txt = obj.small_desc + '<p>' + JSON.stringify(obj.composition) + '<p>' + JSON.stringify(obj.atouts) + '<p>' + JSON.stringify(obj.conseils);
  txt = txt.replace(/\{|\}|_|\[|\|"text"|"]/g,'');
  return {
    "name" : obj.name,
    "description" : obj.small_desc + '<p>' + JSON.stringify(obj.composition) + '<p>' + JSON.stringify(obj.atouts),
    "meta_description" : obj.small_desc,
    "meta_title" :  obj.name,
    "tags" : [obj.type],
    "attributes" : attrib,
    "enabled" : true,
    "discontinued" : false,
    "slug" : slug(obj.name),
    "sku" : ID(),
    "code" : ID(),
    "tax_class" : "none",
    "related_product_ids" : [],
    "prices" : [],
    "cost_price" : PRICE(),
    "regular_price" : PRICE(),
    "sale_price" : PRICE(),
    "quantity_inc" : COUNT(),
    "quantity_min" : COUNT(),
    "weight" : weight,
    "stock_quantity" : COUNT(),
    "position" : null,
    "date_stock_expected" : null,
    "date_sale_from" : fromDate,
    "date_sale_to" : toDate,
    "stock_tracking" : false,
    "stock_preorder" : false,
    "stock_backorder" : false,
    "category_id" : category,
    "category_ids" : [],
    "packaging": weight
  };
};

function uploadImageToProduct(id, obj) {
  var path = './dls/' + pathSolver.basename(url.parse(obj.img_url).pathname);
	var form = new FormData();
	form.append('file', fs.createReadStream(path));
	cez.products.images.upload(id, form)
	.then((result) => {console.log(result);})
	.catch(err => {console.log(err)});
};

async function initRCProducts() {
  for (var key in json) {
    var obj = json[key];
    var categoryId = await api.getCategory(obj.race);
    var categoryId = await api.getCategory(obj.race);

    if(obj.conditionnement.length == 0) {
      var weight = "";
      var product = productFromRCJson(obj, weight, categoryId);
      var res = await cez.products.create(product);
      uploadImageToProduct(res.json.id, obj);
    } else {
      for(var i in obj.conditionnement) {
        var weight = obj.conditionnement[i];
        var product = productFromRCJson(obj, weight, categoryId);
        var res = await cez.products.create(product);
        uploadImageToProduct(res.json.id, obj);
      }
    }
  }
}


async function logAttributes() {
  var cat = [];
  for (var key in json) {
    var obj = json[key];
    for(var i in obj.category_codes) {
      var val = obj.category_codes[i];
      if(!cat.includes(val))
        cat.push(val);
    }
  }
  cat.sort();
  fs.writeFile('./RC_categories_raw.json', JSON.stringify(cat, null, "  "), 'utf8', function(err){
      console.log(err);
  });
}

function count() {
   var count=0;
   for(var prop in json) {
      if (json.hasOwnProperty(prop)) {
         count+=json[prop].conditionnement.length;
         if(json[prop].conditionnement.length == 0)
            console.log(json[prop].name);
      }
   }
   return count;
}

async function test_client() {
  var categoryId = await api.getCategory("Chien");
  console.log(categoryId);
  var nbProducts = await cez.products.list();
  console.log(nbProducts.json.data.length);
}

function uploadImageToBrand(id, path) {
	var form = new FormData();
	form.append('file', fs.createReadStream(path));
	cez.brands.uploadImage(id, form)
	.then((result) => {console.log(result);})
	.catch(err => {console.log(err)});
};

async function createBrand(name) {
  var id = await api.createBrand(name);
  uploadImageToBrand(id,`./brands/${name}.jpg`);
}

async function initBrands() {
  await api.deleteAllBrands();
  await createBrand("Royal Canin");
  await createBrand("Hills");
  await createBrand("Proplan");
  await createBrand("Spécific");
  await createBrand("Virbac");
}

async function initStores() {
  await api.createBrand("Amazon");
  await api.createBrand("BlaBlaBla");
}

async function init() {
  await api.deleteAllCategories();
  await initCategoryDatabase();
  await api.deleteAllProducts();
  await initRCProducts();
  await initBrands();
  //initStores();
  //logAttributes();
  //await test_client();
  //console.log(count());
}
//test_client();
init();
