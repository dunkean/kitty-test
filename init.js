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
  await api.createCategory("Pâtées", subId);
  await api.createCategory("Friandises", subId);
  subId = await api.createCategory("Soins", id);
  await api.createCategory("Anti-parasites", subId);
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
  await api.createCategory("Troubles hépatiques", subId);

  id = await api.createCategory("Chat");
  subId = await api.createCategory("Nourriture", id);
  await api.createCategory("Croquettes", subId);
  await api.createCategory("Pâtées", subId);
  await api.createCategory("Friandises", subId);
  subId = await api.createCategory("Soins", id);
  await api.createCategory("Nourriture Véto", subId);
  await api.createCategory("Anti-parasites", subId);
  await api.createCategory("Vitamines", subId);
  await api.createCategory("Cosmétiques", id);

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
  await api.createCategory("Soins", id);
}


/****** CALLS *********/
async function init() {
  await api.deleteAllCategories();
  await initCategoryDatabase();
  await api.deleteAllProducts();
  await initRCProducts();
}

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

function productFromRCJson(obj, weight, category)
{
  var txt = obj.small_desc + '<p>' + JSON.stringify(obj.composition) + '<p>' + JSON.stringify(obj.atouts) + '<p>' + JSON.stringify(obj.conseils);
  txt = txt.replace(/\{|\}|_|\[|\|"text"|"]/g,'');
  return {
    "name" : obj.name + ' ' + weight,
    "description" : obj.small_desc + '<p>' + JSON.stringify(obj.composition) + '<p>' + JSON.stringify(obj.atouts),
    "meta_description" : obj.small_desc,
    "meta_title" :  obj.name,
    "tags" : [obj.type],
    "attributes" : [],
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

var json = require('./RoyalCanin.json');

async function initRCProducts() {
  for (var key in json) {
    var obj = json[key];
    var categoryId = await api.getCategory(obj.race);
    for(var i in obj.conditionnement) {
      var weight = obj.conditionnement[i];
      var product = productFromRCJson(obj, weight, categoryId);
      var res = await cez.products.create(product);
      console.log(res.json.id);
      uploadImageToProduct(res.json.id, obj);
    }
  }
}

init();



/*

Marque : Royal canin / Proplan /hill’s/ vibac/ Spécific


Affection du bas appareil urinaire
Convalescence et soins intensifs
Dermatose et dépilation
Diabète
Gestion du poids
Hygiène bucco-dentaire
Insuffisance cardiaque
Insuffisances rénales
Intolérance alimentaire
Mobilité articulaire
Stress et Anxiété
Troubles digestifs
Troubles hépatiques
*/
