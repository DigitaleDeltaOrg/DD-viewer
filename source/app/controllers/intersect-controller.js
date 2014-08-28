app.controller('IntersectCtrl', [
  '$scope',
  'RasterService',
  'ClickFeedbackService',
  'MapService',
  'UtilService',
  function ($scope, RasterService, ClickFeedbackService, MapService, UtilService) {

    /**
     * lineIntersect is the object which collects different
     * sets of line data. If the intersect tool is turned on,
     * intersect is set to box.type and this controller becomes
     * active.
     *
     * Contains data of all active layers with a suitable aggregation_type
     *
     */
    $scope.lineIntersect = {};

    var firstClick, secondClick, updateLineIntersect, putDataOnscope,
      removeDataFromScope, _updateLineIntersect;

    /**
     * Loops over all layers to request intersection data for all
     * active layers with a raster store path and an appropriate
     * aggregation_type type.
     *
     * @param  {wktstring}   line         str describing the line
     * @param  {object} layers   mapState.layers, containing
     *                                  nxt definition of layers
     * @param  {object} lineIntersect   lineIntersect object of this
     *                                  ctrl
     */
    updateLineIntersect = function (line, layers, lineIntersect) {
      angular.forEach(layers, function (layer, slug) {
        if (layer.active
          && layer.store_path
          && layer.aggregation_type !== 'counts') {
          var agg = lineIntersect[slug] || {}, dataProm;
          if (layer.temporal) {
            dataProm = RasterService.getRasterData(slug, line, $scope.timeState.start, $scope.timeState.end, {});
          } else {
            dataProm = RasterService.getRasterData(slug, line, undefined, undefined, {});
          }
          // Pass the promise to a function that handles the scope.
          putDataOnscope(dataProm, slug);
        } else if (slug in lineIntersect && !layer.active) {
          removeDataFromScope(slug);
        }
      });
    };

    /**
     * Puts dat on lineIntersect when promise resolves or
     * removes item from lineIntersect when no data is returned.
     *
     * @param  {promise}  dataProm       a promise with line data
     * @param  {str}      slug           slug name of layer
     */
    putDataOnscope = function (dataProm, slug) {
      dataProm.then(function (result) {
        if (result.length > 0) {
          $scope.lineIntersect[slug] = {};
          // convert degrees result to meters to display properly.
          if ($scope.mapState.layers[slug].temporal) {
            $scope.lineIntersect[slug].result = UtilService.dataConvertToMeters(result);
            $scope.lineIntersect[slug].data = UtilService.createDataForTimeState($scope.lineIntersect[slug].result, $scope.timeState);
          } else {
            $scope.lineIntersect[slug].data = UtilService.dataConvertToMeters(result);
          }
          $scope.lineIntersect[slug].name = $scope.mapState.layers[slug].name;
        } else if (slug in $scope.lineIntersect) {
          removeDataFromScope(slug);
        }
      });
    };

    removeDataFromScope = function (slug) {
      delete $scope.lineIntersect[slug];
    };

    /**
     * calls updateLineIntersect with a wkt representation of
     * input
     *
     * @param {object} firstClick
     * @param {object} secondClick
     */
    _updateLineIntersect = function (firstClick, secondClick) {
      var line = UtilService.createLineWKT(firstClick, secondClick);
      updateLineIntersect(
        line,
        $scope.mapState.layers,
        $scope.lineIntersect
      );
    };

    /**
     * Updates firsClick and or secondClick and draws
     * appropriate feedback
     *
     * It either:
     *   1. Removes the current line
     *   2. Sets firstClick and draws a tiny line from the first
     *      click to the current pos of mouse.
     *   3. Sets the second click and draws the lne from
     *      the first to the second.
     */
    $scope.$watch('mapState.here', function (n, o) {
      if (n === o) { return true; }
      if (secondClick) {
        firstClick = undefined;
        secondClick = undefined;
        ClickFeedbackService.emptyClickLayer();
        // Empty data element since the line is gone
        $scope.lineIntersect = {};
      } else {
        if (firstClick) {
          secondClick = $scope.mapState.here;
          _updateLineIntersect(firstClick, secondClick);
          ClickFeedbackService.drawLine(firstClick, secondClick, false);
        } else {
          firstClick = $scope.mapState.here;
          ClickFeedbackService.drawLine(firstClick, $scope.mapState.userHere);
        }
      }
    });

    /**
     * Updates line according to geo-pos of mouse
     */
    $scope.$watch('mapState.userHere', function (n, o) {
      if (n === o) { return true; }
      if (firstClick && !secondClick) {
        ClickFeedbackService.drawLine(firstClick, $scope.mapState.userHere, true);
      }
    });

    /**
     * Updates lineIntersect data when users changes layers.
     */
    $scope.$watch('mapState.activeLayersChanged', function (n, o) {
      if (n === o) { return true; }
      if (firstClick && secondClick) {
        _updateLineIntersect(firstClick, secondClick);
      }
    });

    /**
     * Updates lineIntersect of temporal layers when timeState.at changes.
     */
    $scope.$watch('timeState.at', function (n, o) {
      angular.forEach($scope.lineIntersect, function (intersect, slug) {
        if ($scope.mapState.layers[slug].temporal) {
          intersect.data = UtilService.createDataForTimeState(intersect.result, $scope.timeState);
        }
      });
    });

    /**
     * Reload data from temporal rasters when temporal zoomended.
     */
    $scope.$watch('timeState.zoomEnded', function (n, o) {

      if (n === o) { return true; }
      if (firstClick && secondClick) {
        var line = UtilService.createLineWKT(firstClick, secondClick);
        var dataProm;
        angular.forEach($scope.lineIntersect, function (intersect, slug) {
          if ($scope.mapState.layers[slug].temporal) {
            dataProm = RasterService.getRasterData(slug, line, $scope.timeState.start, $scope.timeState.end, {});
            // Pass the promise to a function that handles the scope.
            putDataOnscope(dataProm, slug);
          }
        });
      }
    });

    /**
     * Legacy function to draw 'bolletje'
     *
     * TODO
     */
    var circle;
    $scope.$watch('box.mouseLoc', function (n, o) {
      if (n === o) { return true; }
      if ($scope.box.mouseLoc) {
        // local vars declaration.
        var lat1, lat2, lon1, lon2, maxD, d, r, dLat, dLon, posLat, posLon;

        lat1 = firstClick.lat;
        lat2 = secondClick.lat;
        lon1 = firstClick.lng;
        lon2 = secondClick.lng;
        maxD = Math.sqrt(Math.pow((lat2 - lat1), 2) + Math.pow((lon2 - lon1), 2));
        d = UtilService.metersToDegs($scope.box.mouseLoc);
        r = d / maxD;
        dLat = (lat2 - lat1) * r;
        dLon = (lon2 - lon1) * r;
        posLat = dLat + lat1;
        posLon = dLon + lon1;
        if (circle === undefined) {
          circle = L.circleMarker([posLat, posLon], {
              color: '#2980b9',
              opacity: 1,
              fillOpacity: 1,
              radius: 5
            });
          MapService.addLayer(circle);
        } else {
          circle.setLatLng([posLat, posLon]);
        }
      }
      else {
        if (circle !== undefined) {
          MapService.removeLayer(circle);
          circle = undefined;
        }
      }
    });

    /**
     * Clean up all drawings on box change.
     */
    $scope.$on('$destroy', function () {
      ClickFeedbackService.emptyClickLayer();
    });

  }
]);
