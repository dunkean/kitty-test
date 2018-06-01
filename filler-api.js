var request = require('request');
var fs = require('fs');
var FormData = require('form-data');
var http = require('http');
var CezerinClient = require('cezerin-client');
var slug = require('slug');


const api = new CezerinClient({
  apiBaseUrl: 'http://localhost:3001/api/v1',
  apiToken: 'TestToken'
});

/************ CATEGORIES ************/
//create category
//* api.productCategories.retrieve(id)
//* api.productCategories.create(data)
//* api.productCategories.update(id, data)
//* api.productCategories.delete(id)
//* api.productCategories.uploadImage(categoryId, formData)
// api.productCategories.deleteImage(id)
//* api.productCategories.list()


// getCategory("dog").then(id=>{console.log(id);});
// createCategory("SAMPLE").then(id=>{
//   uploadImageToCategory(id, randomImage("SAMPLE"));
// });

exports.deleteAllCategories = async function() {
  api.productCategories.list({}).then((result) => {
      result.json.forEach(e=>{
        api.productCategories.delete(e.id);
      });
  });
}

exports.createCategory = async function(name, parentId) {
  var category = {
    "name" : name,
    "description" :  `Description of the category ${name} which is a category !`,
    "meta_description" : `The category ${name} deals with ${name} stuff.`,
    "meta_title" : name,
    "slug" : slug(name)
  };
  if(parentId != null)
    category.parent_id = parentId;
  const x = await api.productCategories.create(category);
  return x.json.id;
};



function uploadImageToCategory(id, path) {
	var form = new FormData();
	form.append('file', fs.createReadStream(path));
	api.productCategories.uploadImage(id, form)
	.then((result) => {console.log(result);})
	.catch(err => {console.log(err)});
};

exports.getCategory = async function(name) {
  var id;
  const x = await api.productCategories.list();
  x.json.forEach(
  	e=>{ if(e.name == name) id = e.id; }
  );
  return id;
};

async function getAllCategoriesId() {
  var l = [];
  const x = await api.productCategories.list();
  x.json.forEach(
    e=>{ l.push(e.id); }
  );
  return l;
};

async function getAllCategories() {
  var l = [];
  const x = await api.productCategories.list();
  x.json.forEach(
    e=>{ l.push(e); }
  );
  return l;
};

function randomImage(folder) {
	var imgNumber = Math.floor(Math.random()*650) + 1;
	return `D:/Workspace_web/cezerin_tests/${folder}/images\(${imgNumber}\).png`;
}

function setParentCategory(childId, parentId) {
   api.productCategories.update(childId, {parent_id: parentId});
}

/********************* BRANDS ******************************/

exports.deleteAllBrands = async function() {
  api.brands.list({}).then((result) => {
      result.json.forEach(e=>{
        console.log(e.id);
        api.brands.delete(e.id);
      });
  });
}

exports.createBrand = async function(name, parentId) {
  var brand = {
    "name" : name,
    "description" :  `Description of the brand ${name} which is a brand !`,
    "meta_description" : `The brand ${name} deals with ${name} stuff.`,
    "meta_title" : name,
    "slug" : slug(name)
  };
  if(parentId != null)
    brand.parent_id = parentId;
  const x = await api.brands.create(brand);
  return x.json.id;
};



function uploadImageToBrand(id, path) {
	var form = new FormData();
	form.append('file', fs.createReadStream(path));
	api.brands.uploadImage(id, form)
	.then((result) => {console.log(result);})
	.catch(err => {console.log(err)});
};

exports.getBrand = async function(name) {
  var id;
  const x = await api.brands.list();
  x.json.forEach(
  	e=>{ if(e.name == name) id = e.id; }
  );
  return id;
};

async function getAllBrandsId() {
  var l = [];
  const x = await api.brands.list();
  x.json.forEach(
    e=>{ l.push(e.id); }
  );
  return l;
};

async function getAllBrands() {
  var l = [];
  const x = await api.brands.list();
  x.json.forEach(
    e=>{ l.push(e); }
  );
  return l;
};

/******************** STORES ***************************/
exports.deleteAllStores = async function() {
  api.stores.list({}).then((result) => {
      result.json.forEach(e=>{
        api.stores.delete(e.id);
      });
  });
}

exports.createStore = async function(name, parentId) {
  var store = {
    "name" : name,
    "description" :  `Description of the store ${name} which is a store !`,
    "meta_description" : `The store ${name} deals with ${name} stuff.`,
    "meta_title" : name,
    "slug" : slug(name)
  };
  if(parentId != null)
    store.parent_id = parentId;
  const x = await api.stores.create(store);
  return x.json.id;
};



function uploadImageToStore(id, path) {
	var form = new FormData();
	form.append('file', fs.createReadStream(path));
	api.stores.uploadImage(id, form)
	.then((result) => {console.log(result);})
	.catch(err => {console.log(err)});
};

exports.getStore = async function(name) {
  var id;
  const x = await api.stores.list();
  x.json.forEach(
  	e=>{ if(e.name == name) id = e.id; }
  );
  return id;
};

async function getAllStoresId() {
  var l = [];
  const x = await api.stores.list();
  x.json.forEach(
    e=>{ l.push(e.id); }
  );
  return l;
};

async function getAllStores() {
  var l = [];
  const x = await api.stores.list();
  x.json.forEach(
    e=>{ l.push(e); }
  );
  return l;
};

/******************** PRODUCTS ***************************/
// api.products.list({
    // offset: 0,
    // limit: 10,
    // fields: 'id, name, price',
    // category_id: '',
    // active: true,
    // discontinued: false,
    // search: '',
    // on_sale: true,
    // stock_status: 'available',
    // price_from: 0,
    // price_to: 100,
    // sku: '',
    // ids: ',,',
    // sort: 'regular_price,-stock_quantity' })
// api.products.retrieve(id)
// api.products.create(data)
// api.products.update(id, data)
// api.products.delete(id)
// api.products.skuExists(productId, sku)
// api.products.slugExists(productId, slug)
// api.products.options.list(productId)
// api.products.options.retrieve(productId, optionId)
// api.products.options.create(productId, data)
// api.products.options.update(productId, optionId, data)
// api.products.options.delete(productId, optionId)
// api.products.options.values.list(productId, optionId)
// api.products.options.values.retrieve(productId, optionId, valueId)
// api.products.options.values.create(productId, optionId, data)
// api.products.options.values.update(productId, optionId, valueId, data)
// api.products.options.values.delete(productId, optionId, valueId)
// api.products.variants.list(productId)
// api.products.variants.create(productId, data)
// api.products.variants.update(productId, variantId, data)
// api.products.variants.delete(productId, variantId)
// api.products.variants.setOption(productId, variantId, data)
// api.products.images.list(productId)
// api.products.images.update(productId, imageId, data)
// api.products.images.upload(productId, formData)
// api.products.images.delete(productId, imageId)


//Delete all products
exports.deleteAllProducts = async function() {
  api.products.list({}).then((result) => {
      result.json.data.forEach(e=>{
        api.products.delete(e.id);
      });
  });
}

function ID() {
  return Math.random().toString(36).substr(2, 9);
};

function PRICE() {
  return Math.floor(Math.random() * 1000) / 10 + 1;
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

function getRandomProduct(category, id, i)
{
  return {
    "name" : "product_" + category + i,
    "description" : "description " + category + i,
    "meta_description" : "meta_description " + category + i,
    "meta_title" :  "meta_title " + category + i,
    "tags" : [],
    "attributes" : [],
    "enabled" : true,
    "discontinued" : false,
    "slug" : "test_slug" + category + i,
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
    "weight" : PRICE(),
    "stock_quantity" : COUNT(),
    "position" : null,
    "date_stock_expected" : null,
    "date_sale_from" : fromDate,
    "date_sale_to" : toDate,
    "stock_tracking" : false,
    "stock_preorder" : false,
    "stock_backorder" : false,
    "category_id" : id,
    "category_ids" : []
  };
};

//create random products
exports.createRandomProducts = async function(nbPerCat) {
  var categoryList = await getAllCategories();
  categoryList.forEach(c => {
    for(var i = 0; i < nbPerCat; i++) {
      api.products.create(getRandomProduct(c.name, c.id, i));
    }
  });
}


//ADD IMAGE TO PRODUCT
/*var form = new FormData();
form.append('path', 'Z:/pictures/Image1.png');
form.append('file', fs.createReadStream('Z:/pictures/Image1.png'));





api.products.list({}).then((result) => {
    result.json.data.forEach(e=>{
      console.log(e.id)
      api.products.images.upload(e.id, form)
      .then((result) => {console.log(result);})
      .catch(err => {console.log(err)});
    });
});*/


function insertRandomProducts() {
  var options = {
    uri: 'http://localhost:3001/api/v1/products',
    method: 'POST',
    json: {}
  };

  for(var i = 0; i < 150; i++) {
    options.json = getProduct(i);
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body.id)
      }
    });
  }
};

function setImageOnProduct(id) {
  var options = {
    uri: 'http://localhost:3001/api/v1/products/${id}/images',
    method: 'POST',
    json: {}
  };
  var form = new FormData();
  form.append('my_buffer', /* something big */);

  var request = http.request({
    method: 'post',
    host: 'http://localhost:3001',
    path: '/api/v1/products/${id}/images',
    headers: form.getHeaders()
  });

  form.pipe(request);

  request.on('response', function(res) {
    console.log(res.statusCode);
  });
};

function getProductList(cb) {
  var options = {
    uri: 'http://localhost:3001/api/v1/products',
    method: 'GET'
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb(response);
    }
  });
}

function addImages(response) {
  var data = JSON.parse(response.body).data;
  data.forEach(function(e) {
    setImageOnProduct(e.id);
  });
}

//getProductList(addImages);
