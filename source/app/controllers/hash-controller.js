'use strict';

app.controller('hashGetterSetter', ['$scope', 'hashSyncHelper', 'MapService',
  function ($scope, hashSyncHelper, MapService) {

    // Only set url when user changed it or on pageload
    // Watches are asynchronous, so they all need their
    // own update boolean.
    var updateLocationUrl = true,
      updateStartUrl = true,
      updateEndUrl = true,
      updateLayersUrl = true;

    /**
     * set layer(s) when these change.
     */
    $scope.$watch('mapState.activeLayersChanged', function (n, o) {
      if (n === o) { return true; }
      updateLayersUrl = false;
      setLayersUrl($scope.mapState.layers);
    });

    /**
     * Set location hash when map moved.
     */
    $scope.$watch('mapState.moved', function (n, o) {
      if (n === o) { return true; }
      updateLocationUrl = false;
      setCoordinatesUrl();
    });

    /**
     * Set start hash when timeState.start changed.
     */
    $scope.$watch('timeState.start', function (n, o) {
      if (n === o) { return true; }
      updateStartUrl = false;
      setTimeStateUrl($scope.timeState.start, true);
    });

    /**
     * Set end hash when timeState.end changed.
     */
    $scope.$watch('timeState.end', function (n, o) {
      if (n === o) { return true; }
      updateEndUrl = false;
      setTimeStateUrl($scope.timeState.end, false);
    });

    /**
     * Updates hash with new time.
     *
     * @param {int} time  to set in hash in ms from epoch
     * @param {boolean} start if true sets start else it sets end
     */
    var setTimeStateUrl = function (time, start) {
      var date = new Date(time);
      var dateString = date.toDateString()
        .slice(4) // Cut off day name
        .split(' ') // Replace spaces by hyphens
        .join('-');
      if (start) {
        hashSyncHelper.setHash({'start': dateString});
      } else {
        hashSyncHelper.setHash({'end': dateString});
      }
    };

    /**
     * Sets the coordinates in the hash with a precision
     * of 4 decimals.
     */
    var setCoordinatesUrl = function () {
      var COORD_PRECISION = 4;
      var newHash = [
        MapService.mapState.center.lat.toFixed(COORD_PRECISION),
        MapService.mapState.center.lng.toFixed(COORD_PRECISION),
        MapService.mapState.zoom
      ].join(',');
      if (!$scope.$$phase) {
        $scope.$apply(function () {
          hashSyncHelper.setHash({'location': newHash});
        });
      } else {
        hashSyncHelper.setHash({'location': newHash});
      }
    };

    var setLayersUrl = function (layers) {
      if (layers === undefined) { return; }
      var slugs = Object.keys(layers),
          i,
          activeSlugs = [];
      for (i = 0; i < slugs.length; i++) {
        if (layers[slugs[i]].active) {
          activeSlugs.push(slugs[i]);
        }
      }
      hashSyncHelper.setHash({'layers': activeSlugs.toString()});
    };

    /**
     * Sets the timeState on scope after locationChangeSucces.
     *
     * To prevent a timeState.at that lies outside of the interval.
     * When Setting the start and end also set the at.
     *
     * @param {timeState} time  timeState with start and end.
     * @param {boolean} start   Set timeStart or timeState.end
     */
    var setTimeState = function (time, start) {
      // Make browser independent
      time = time.replace(/-/g, '/');
      var msTime = Date.parse(time);
      // bail if time is not parsable
      if (isNaN(msTime)) { return; }
      if (start) {
        $scope.timeState.start = msTime;
      } else {
        if (msTime === $scope.timeState.start) {
          msTime += 43200000; // half a day
        }
        $scope.timeState.end = msTime;
      }
      $scope.timeState.at = $scope.timeState.start +
        ($scope.timeState.end - $scope.timeState.start) / 2;
      $scope.timeState.changeOrigin = 'hash';
      $scope.timeState.changedZoom = Date.now();
    };

    /**
     * Sets up the hash at creation of the controller.
     */
    (function setUrlHashWhenEmpty() {
      var hash = hashSyncHelper.getHash(),
          layersHash = hash.layers,
          locationHash = hash.location;

      if (!locationHash) {
        setCoordinatesUrl();
      }
      if (!layersHash) {
        setLayersUrl($scope.mapState.layers);
      }
    })();

    /**
     * Listener to update map view when user changes url
     *
     * $locationChangeSucces is broadcasted by angular
     * when the hashSyncHelper in util-service changes the url
     *
     * updateUrl is set to false when the application updates
     * the url. Then, this listener is fired but does nothing but
     * resetting the updateUrl back to true
     */
    $scope.$on('$locationChangeSuccess', function (e, oldurl, newurl) {

      var hash, locationHash, layersHash, startHash, endHash;
      hash = hashSyncHelper.getHash();
      if (updateLocationUrl
        && updateStartUrl
        && updateEndUrl
        && updateLayersUrl) {

        locationHash = hash.location;
        if (locationHash !== undefined) {
          var latlonzoom = locationHash.split(',');
          // must have 3 parameters or don't setView here...
          if (latlonzoom.length >= 3) {
            if (parseFloat(latlonzoom[0]) &&
                parseFloat(latlonzoom[1]) &&
                parseFloat(latlonzoom[2])) {
              MapService.setView(
                [latlonzoom[0], latlonzoom[1]],
                latlonzoom[2],
                {reset: true, animate: true}
              );
            }
          }
        }

        layersHash = hash.layers;
        if (layersHash !== undefined) {
          var activeSlugs = layersHash.split(','),
              allSlugs = Object.keys($scope.mapState.layers),
              i,
              active;

          for (i = 0; i < allSlugs.length; i++) {
            // check if hash contains layers otherwise set to inactive;
            active = (activeSlugs.indexOf(allSlugs[i]) >= 0);
            if ((active && !$scope.mapState.layers[allSlugs[i]].active)
              || (!active && $scope.mapState.layers[allSlugs[i]].active)) {
              $scope.mapState.changeLayer($scope.mapState.layers[allSlugs[i]]);
              MapService.mapState.activeLayersChanged = Date.now();
            }
          }
        }
        if ($scope.mapState.layersNeedLoading) {

          // Initialise layers
          angular.forEach(MapService.mapState.layers, function (layerGroup) {

            MapService.mapState.activeLayersChanged = Date.now();
            layerGroup.aggregation_type = layerGroup.layers[0].aggregation_type;
            if (!layerGroup.initiated) {

              /* OLD: */ MapService.createLayer(layerGroup);
              /* NEW: */// MapService.createLayerGroup(layerGroup);

              if (layerGroup.active && layerGroup.initiated) {
                layerGroup.active = false;
                MapService.toggleLayer(layerGroup, MapService.mapState.layers);
              }
            }
          });
          $scope.mapState.layersNeedLoading = false;
        }

        startHash = hash.start;
        if (startHash !== undefined) {
          setTimeState(startHash, true);
        }

        endHash = hash.end;
        if (endHash !== undefined) {
          setTimeState(endHash, false);
        }
      }
      updateLocationUrl = true;
      updateStartUrl = true;
      updateEndUrl = true;
      updateLayersUrl = true;
    });

  }
]);
