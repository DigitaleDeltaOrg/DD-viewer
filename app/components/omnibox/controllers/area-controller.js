/**
 * @ngdoc
 * @class areaCtrl
 * @memberOf app
 * @name areaCtrl
 * @description
 * area is the object which collects different
 * sets of aggregation data. If there is no activeObject,
 * this is the default collection of data to be shown in the
 * client.
 *
 * Contains data of all active layers with an aggregation_type
 *
 */
angular.module('lizard-nxt')
  .controller('AreaCtrl', [

    '$scope',
    'RasterService',
    'UtilService',
    '$q',

    function (

      $scope,
      RasterService,
      UtilService,
      $q

    ) {

    $scope.box.content = {};
    $scope.filteredRainDataPerKilometer = undefined;

    /**
     * @function
     * @memberOf app.areaCtrl
     * @description
     * Loops over all layergroups to get data.
     * @param  {object} bounds   mapState.bounds, containing
     *                                  leaflet bounds.
     */
    var fillArea = function (bounds) {
     //TODO draw feedback when loading data
      var promises = $scope.fillBox({
        geom: bounds,
        start: $scope.timeState.start,
        end: $scope.timeState.end,
        aggWindow: $scope.timeState.aggWindow
      });
      angular.forEach(promises, function (promise) {
        promise.then(null, null, function (response) {
          if (response.data && response.data !== "null") {
            switch (response.layerSlug) {
            case "dem/nl":
              // Since the data is not properly formatted in the back
              // we convert it from degrees to meters here
              $scope.box.content.elevation.layers["dem/nl"].data
                = RasterService.handleElevationCurve(response.data);
              break;
            case "radar/basic":
              $scope.box.content.rain.layers["radar/basic"].data
                = response.data;
              $scope.filteredRainDataPerKilometer
                = UtilService.getFilteredRainDataPerKM(
                    response.data,
                    $scope.mapState.bounds,
                    $scope.timeState
                  );
              break;
            }
          }
        });
      });
    };

    /**
     * Updates area when user moves map.
     */
    $scope.$watch('mapState.bounds', function (n, o) {
      if (n === o) { return true; }
      fillArea($scope.mapState.bounds);
    });

    $scope.$watch('timeState.at', function (n, o) {
      if (n === o) { return true; }
      fillArea($scope.mapState.bounds);
    });

    $scope.$watch('timeState.aggWindow', function (n, o) {
      if (n === o) { return true; }
      fillArea($scope.mapState.bounds);
    });

    /**
     * Updates area when users changes layers.
     */
    $scope.$watch('mapState.layerGroupsChanged', function (n, o) {
      if (n === o) { return true; }
      fillArea($scope.mapState.bounds);
    });

    // Load data at initialization.
    fillArea($scope.mapState.bounds);

    // Make UtilSvc functions available in Angular templates
    $scope.countKeys = UtilService.countKeys;
  }
]);
