'use strict';

app.controller('RainAggregate', ["$scope", "$q", "CabinetService",
  function ($scope, $q, CabinetService) {

  $scope.$watch('mapState.here', function (n, o) {
    if (n === o) {return true; }
    $scope.rain.rainClick($scope.mapState.here);
  });

  /**
   * Clean up box when tool is turned off
   */
  $scope.$watch('tools.active', function (n, o) {
    if ($scope.tools.active !== 'rain') {
      $scope.box.type = 'empty';
      // Destroy scope at the end of this digest. Workaround from:
      // https://github.com/shinetech/angular-models/blob/master/angular-models.js
      $scope.$$postDigest(function () { $scope.$destroy(); });
    }
  });

  /**
   * Turn of tools when box.type is changed or closed
   */
  $scope.$watch('box.type', function (n, o) {
    if ($scope.box.type !== 'rain') {
      $scope.tools.active = null;
    }
  });

  // Rain model
  $scope.rain = {
    start: undefined,
    stop: undefined,
    interval: undefined,
    statWin: undefined,
    data: undefined
  };

  /**
   * Watch function to replace rain.data object with data computed for 
   * different window.
   */
  var statWinWatch =  function (n, o) {
    if (n === o) {return true; }
    var callback = function (response) {
      $scope.rain.data = response.result;
    };
    getRain(new Date($scope.rain.start),
      new Date($scope.rain.end),
      $scope.rain.latLng,
      callback,
      $scope.rain.interval,
      $scope.rain.statWin
    );
  };

  /**
   * Watch to trigger call for more rain when user scrolls graph.
   */
  var holdYourFire = false;
  var firstTimeStart;
  $scope.$watch('timeState.start', function (n, o) {
    if (n === o || $scope.box.type !== 'rain') { return true; }
    if ($scope.timeState.start < $scope.rain.start - $scope.rain.interval) {
      if (firstTimeStart === undefined) {
        getMoreRain(true);
        firstTimeStart = true;
      } else if ($scope.timeState.start < $scope.rain.start + 10 * $scope.rain.interval
          && !holdYourFire) {
        holdYourFire = true;
        getMoreRain(true);
        setTimeout(function () {
          holdYourFire = false;
        }, 1000);
      }
    }
  });

  /**
   * Watch to trigger call for more rain when user scrolls graph.
   */
  var firstTimeEnd;
  $scope.$watch('timeState.end', function (n, o) {
    if (n === o || $scope.box.type !== 'rain') { return true; }
    if ($scope.timeState.end > $scope.rain.end + 2 * $scope.rain.interval) {
      if (firstTimeEnd === undefined) {
        getMoreRain();
        firstTimeEnd = true;
      } else if ($scope.timeState.end > $scope.rain.end - 10 * $scope.rain.interval
          && !holdYourFire) {
        holdYourFire = true;
        getMoreRain();
        setTimeout(function () {
          holdYourFire = false;
        }, 1000);
      }

    }
  });

  /**
   * Adds rain data to current $scope.rain.data object.
   * 
   * @param  {boolean} starty if true adds data to the front,
   *                          else to the back of the data element
   */
  var getMoreRain = function (starty) {
    var stop, start, callback;
    var buffer = 40; // Collect 40 new bars at the time
    if (starty) {
      start = $scope.rain.start - buffer * $scope.rain.interval;
      stop = $scope.rain.start;
      $scope.rain.start = start;
      callback = function (response) {
        $scope.rain.data = response.result.concat($scope.rain.data);
      };
    } else {
      stop = $scope.rain.end + buffer * $scope.rain.interval;
      start = $scope.rain.end;
      $scope.rain.end = stop;
      callback = function (response) {
        $scope.rain.data = $scope.rain.data.concat(response.result);
      };
    }
    getRain(
      new Date(start),
      new Date(stop),
      $scope.rain.latLng,
      callback,
      $scope.rain.interval,
      $scope.rain.statWin
    );
  };

  /**
   * Takes current timeState and location of click to put rain data on the $scope.
   * 
   * @param  {latlng object} e leaflet location object
   */
  $scope.rain.rainClick = function (latlng) {
    var stop = new Date($scope.timeState.end);
    var start = new Date($scope.timeState.start);
    $scope.rain.latLng = latlng;
    var nBars = 20;
    $scope.rain.interval = 17280000;
    $scope.rain.statWin = 60 * 60 * 1000; // 1 hour
    $scope.box.type = 'rain';
    $scope.$watch('rain.statWin', statWinWatch);
    var callback = function (response) {
      $scope.rain.data = response.result;
      $scope.rain.end = $scope.rain.data[$scope.rain.data.length - 1][0];
      $scope.rain.start = $scope.rain.data[0][0];
      $scope.rain.nbar = nBars;
    };
    getRain(start, stop, $scope.rain.latLng, callback, $scope.rain.interval, $scope.rain.statWin);
  };

  /**
   * Gets rain from server.
   *
   * @param  {int} start    start of rainserie
   * @param  {int} stop     end of rainserie
   * @param  {function} callback function
   * @param  {object} latLng   location of rainserie in {lat: int, lng: int} (currently only supports points)
   * @param  {int} interval width of the aggregation, default: stop - start / 100
   * @param  {int} statWin   window for the min/max, default: 5 min
   */
  var getRain = function (start, stop, latLng, callback, interval, statWin) {
    var stopString = stop.toISOString().split('.')[0];
    var startString = start.toISOString().split('.')[0];
    var wkt = "POINT(" + latLng.lng + " " + latLng.lat + ")";
    if (interval === undefined) {
      interval = (stop - start) / 100;
    }
    if (statWin === undefined) {
      statWin = 300000;
    }
    CabinetService.raster.get({
      raster_names: 'rain',
      geom: wkt,
      srs: 'EPSG:4326',
      start: startString,
      stop: stopString,
      interval: interval,
      stat_win: statWin
    }).then(callback);
  };

}]);