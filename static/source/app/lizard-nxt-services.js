var services = angular.module("lizard-nxt.services", ['ngResource']);

services.service("Cabinet", ["$resource", "$rootScope",
  function($resource, $rootScope) {

  var layergroups = [];

  var searchResource,
      geocodeResource,
      reverseGeocodeResource,
      apiLayerGroups;
  
  searchResource = $resource('/api/v1/search/');
  geocodeResource = $resource('/api/v1/geocode/');
  reverseGeocodeResource = $resource('/api/v1/reversegeocode/');


  apiLayerGroups = $resource('/api/v1/layergroups//:id/',
    {
      id:'@id'
    }, {
      'query': {method: "GET", isArray:false}
    });

  // for(var i in layerGroups){
  //   var new_layerGroup = new apiLayerGroups(layerGroups[i]);
  //    var grouplayers =[];
  //   for (var j in layers){
  //     layerGroups[i].layers.map(function(id){
  //       if (id === layers[j].id){
  //         grouplayers.push(layers[j]);
  //       }
  //     });
  //   }
  //   new_layerGroup.layers = grouplayers;
  //   layergroups.push(new_layerGroup);
  // }

  layergroups = layerGroups;
  $rootScope.$broadcast('LayersRetrieved');

  return {
    layergroups: layergroups,
    search: searchResource,
    geocode: geocodeResource,
    reverseGeocode: reverseGeocodeResource
  };
}]);


services.service("Omnibox", [function() {
  var box = {
    query: null,
    disabled: false,
    showCards: false,
    type: 'empty',
    content: 'empty'
  };

  box.open = function(type){
    box.type = type;
    box.showCards = true;
    $rootScope.$broadcast('Omnibox_change');
  };

  box.close = function(){
    box.type = 'empty';
    box.showCards = false;
  };

  return box;
}]);
