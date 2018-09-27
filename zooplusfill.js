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

const products = require('./zooplusProducts.json');

const brandIDs = {};
const categoryIDs = {};
//################## BRANDS ####################
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

/*async function createBrand(name) {
  var id = await api.createBrand(name);
  uploadImageToBrand(id,`./brands/${name}.jpg`);
}*/

async function initBrands() {
  await api.deleteAllBrands();
  const brands = [];
  Object.keys(products).forEach(function(key) {
    console.log(key);
    const brand = products[key].content.brand;
    if(!brands.includes(brand))
      brands.push(brand);
  });
  for(brand of brands)
    brandIDs[brand] = await api.createBrand(brand);

}


//##################### CATEGORIES ###################

var forbidden = ["bons plans", "whiskas", "marques", "sélection", "herrmann", "advance", "Nutro",
                  "Nova", "Markus", "Purizon"];

function filterCat(path) {
  var list = path.split("##").filter(txt => txt != "");
  var out;
  for (var i = 0; i < list.length; i++) {
    out = list[i];
    for (var j = 0; j < forbidden.length; j++) {
      out += ("-" + forbidden[j]);
      if( forbidden[j].toLowerCase().includes(list[i].toLowerCase()) ||
          list[i].toLowerCase().includes(forbidden[j].toLowerCase()) )
          return true;
    }
  //  console.log(out);
  }
  return false;
}
async function initCategories() {
  forbidden = forbidden.concat(Object.keys(brandIDs)).filter(txt => txt != "").sort();
/*  fs.writeFile(`./zooplusTags.json`, JSON.stringify(forbidden, null, 2), 'utf8', function(err){
    console.log(err);
  });*/
  await api.deleteAllCategories();
  const categories = [];
  const keys = Object.keys(products);

  try {
    for(var key of keys) {
      const breadcrumb = products[key].content.breadcrumb;
      var lastCategory = "";
      for (var i = 0; i < breadcrumb.length; i++) {
        var category = breadcrumb[i];
        var path = lastCategory+"##"+category;
        if(!categories.includes(path) && !filterCat(path)) {
          if(i > 0) {
              categoryIDs[path] = await api.createCategory(category, categoryIDs[lastCategory]);
          } else {
            categoryIDs[path] = await api.createCategory(category);
          }
          console.log(path);
        }
        categories.push(path);
        lastCategory = path;
      }
    }
  } catch(e) {
    console.log(e);
  }
}

//###################### STORES ###################

async function initStores() {
}


//###################### PRODUCTS ###################

function productFromJson(product, price, pubPrice)
{
  return {
    "name" : product.title,
    "description" : product.content.description,
    "small_description": product.desc,
    "ingredients": product.content.ingredients,
    "feedingrecommandation": product.content.feedingrecommandation,
    "meta_description" : product.content.meta_description,
    "meta_title" : product.title,
    "tags" : [],
    "attributes" : product.content.breadcrumb,
    "enabled" : true,
    "discontinued" : false,
    "slug" : slug(product.title),
    "sku" : price.gtin13,
    "code" : price.gtin13,
    "tax_class" : "none",
    "related_product_ids" : [],
    "prices" : [],
    "cost_price" : price.price,
    "regular_price" : pubPrice.price,
    "sale_price" : pubPrice.price,
    "quantity_inc" : 0,
    "quantity_min" : 0,
    "weight" : 0,
    "stock_quantity" : 10000,
    "position" : null,
    "date_stock_expected" : null,
    "date_sale_from" : null,
    "date_sale_to" : null,
    "stock_tracking" : false,
    "category_id" : categoryIDs[product.content.breadcrumb[0]],
    "category_ids" : product.content.breadcrumb.map(k=>{return categoryIDs[k]}),
    "packaging": price.name,
    "brand_id": brandIDs[product.content.brand]
  };
};


async function initProducts() {
  const brandList = await cez.brands.list();
  brandList.json.map(x=>{brandIDs[x.name] = x.id;})
  const catList = await cez.productCategories.list();
  catList.json.map(x=>{categoryIDs[x.name] = x.id;})
  await api.deleteAllProducts();
  try {
    var keys = Object.keys(products);
    for (var i = 0; i < 5/*keys.length*/; i++) {
      var key = keys[i];
      const product = products[key];
      for (price of product.content.prices) {
        console.log(product.content.brand + "   " +brandIDs[product.content.brand]);
        var pubPrice = product.prices.map(k=>{if(k.name == price.name) return k;});
        var JSONProduct = productFromJson(product, price, pubPrice);
        var id = cez.products.create(JSONProduct);
        //updload image
      }
    }
  } catch(e) {
    console.log(e);
  }
}

async function init() {
  /*await initBrands();
  await initCategories();*/
  await initProducts();
/*  await api.deleteAllProducts();
  await initRCProducts();*/
  //initStores();
  //logAttributes();
  //await test_client();
  //console.log(count());
}
console.log("INIT");

init();
