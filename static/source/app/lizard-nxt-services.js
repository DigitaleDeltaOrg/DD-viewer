var services = angular.module("lizard-nxt.services", ['ngResource']);

services.service("CabinetService", ["$resource",
  function ($resource, $rootScope) {

  var layergroups = window.layerGroups;
  var layers = window.layers;
  var baselayers = window.baseLayers;

  var termSearchResource,
      bboxSearchResource,
      geocodeResource,
      reverseGeocodeResource,
      apiLayerGroups,
      timeseriesLocationObjectResource,
      timeseriesResource;
  
  termSearchResource = $resource('/api/v1/search/',{isArray: true});
  bboxSearchResource = $resource('/api/v1/search/',{isArray: true});
  geocodeResource = $resource('/api/v1/geocode/');
  reverseGeocodeResource = $resource('/api/v1/reversegeocode/');
  timeseriesLocationObjectResource = $resource('/api/v1/timeseries/?object=:object_type$:id&page_size=0', {
    object_type: '@object_type',
    id: '@id'
  });
  // timeseriesResource = $resource('/api/v1/timeseries/:id/', {
  //   id: '@id'
  // });
  timeseriesResource = $resource('/static/data/tijdserie.json', {
    id: '@id'
  });


  return {
    layergroups: layergroups,
    layers: layers,
    baselayers: baselayers,
    termSearch: termSearchResource,
    bboxSearch: bboxSearchResource,
    geocode: geocodeResource,
    reverseGeocode: reverseGeocodeResource,
    timeseries: timeseriesResource,
    timeseriesLocationObject: timeseriesLocationObjectResource,
    panZoom: null
  };
}]);



//NOTE this seems like a superfluous service; let's try to get rid of it
services.service("Omnibox", [function () {
  var box = {
    query: null,
    disabled: false,
    showCards: false,
    type: 'empty',
    content: {},
    changed: Date.now()
  };

  // TODO: These functions should go to the directive
  box.open = function (type) {
    box.type = type;
    box.showCards = true;
  };

  box.close = function () {
    box.type = 'empty';
    box.showCards = false;
  };

  box.get_profile = function () {
    return "ok";
  };

  return box;
}]);

services.service("KpiService", function () {

});
