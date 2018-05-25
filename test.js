var request = require('request');


var ajaxOptions = {
	url: 'https://www.purina-proplan.fr/chat/_api/product/fr-FR',
	data: productSelectorViewModel,
	type: "POST",
	method: "POST",
	contentType: "application/json",
	success: function (msg) {
	 	console.log(msg);
	},
	error: function (html) { 
		console.log(html);
	}
};

var productSelectorViewModel = {
    ContentOrganizer: "Products",
    tags: [],
    result: [],
    group: "LifeStage"
  };

request(ajaxOptions, function (error, res, body) {
	console.log(res.statusCode);
	console.log(error);
	console.log(body);
	if (!error && res.statusCode == 200) {
	  cb(res);
	}
});

/*
function () {
  
  var productSelectorViewModel = {
    ContentOrganizer: ko.observable(),
    tags: ko.observableArray(),
    result: ko.observableArray(),
    group: ko.observable(productlistConfigs.group),
    filter: productlistConfigs.filter,
    //initBuyNow: function (element, data) {
    //  if (this.foreach[this.foreach.length - 1] === data) {
    //    initBuyNowButtons();
    //  }
    //}
  };

  function Tags() {
    this.tagsType = ko.observable();
    this.tagReferences = ko.observableArray([]);
  };

  ko.applyBindings(productSelectorViewModel);
  productSelectorViewModel.ContentOrganizer($("#filter-form").data("contentorganizer"));

  ajaxOptions.data = ko.toJSON(productSelectorViewModel);
  $.ajax(ajaxOptions);

  ko.bindingHandlers.urlFormat = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      var value = valueAccessor(),
        allBindings = allBindingsAccessor();
      var valueUnwrapped = ko.utils.unwrapObservable(value);
      var __url = $(element).attr("href");
      if (__url === "/") {
        valueUnwrapped = valueUnwrapped.replace("/" + allBindings.culture, "");
      }
      $(element).attr("href", valueUnwrapped);
    }
  }
}*/

/*
function test(cb) {
  var options = {
    uri: 'http://www.purina-proplan.fr/chat/_api/product/fr-FR',
    method: 'POST'
  };

  request(options, function (error, res, body) {
  	console.log(res.statusCode);
  	console.log(error);
  	console.log(body);
    if (!error && res.statusCode == 200) {
      cb(res);
    }
  });
}*/

function logC(response) {
  var data = JSON.parse(response.body).data;
  console.log(JSON.stringigy(data));
  /*data.forEach(function(e) {
    setImageOnProduct(e.id);
  });*/
}

//test(logC);