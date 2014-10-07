app.controller('LineCtrl', [
  '$scope',
  'RasterService',
  'ClickFeedbackService',
  'UtilService',
  function ($scope, RasterService, ClickFeedbackService, UtilService) {

    /**
     * line is the object which collects different
     * sets of line data. If the line tool is turned on,
     * line is set to box.type and this controller becomes
     * active.
     *
     * Contains data of all active layers with a suitable aggregation_type
     *
     */
    $scope.line = {
      promCount: 0,
    };

    /**
     * @function
     * @memberOf app.pointCtrl
     * @param  {L.LatLng} here
     */
    var fillpoint = function (here) {

      var doneFn = function (response) { // response ::= True | False
        $scope.point.promCount--;
        if ($scope.point.promCount === 0) {
          ClickFeedbackService.stopVibration();
        }
      };

      var putDataOnScope = function (response) {
        var pointL = $scope.point[response.layerGroupSlug] || {};
        if (!response || response.data === null) {
          pointL = undefined;
        } else {
          pointL.type = response.type;
          pointL.layerGroup = response.layerGroupSlug;
          pointL.data = response.data;
          pointL.order = $scope.mapState.layerGroups[pointL.layerGroup].order;
          if (response.data) {
            if (response.data.id) {
              getTimeSeriesForObject(response.data.entity_name + '$' + response.data.id);
            }
            if (response.data.geom) {
              // Draw feedback around object.
              ClickFeedbackService.drawGeometry($scope.mapState, response.data.geom, response.data.entity_name);
              // If the geom from the response is different than mapState.here
              // redo request to get the exact data for the centroid of the object.
              var geom = JSON.parse(response.data.geom);
              if (geom.type === 'Point' && (geom.coordinates[1] !== $scope.mapState.here.lat
                || geom.coordinates[0] !== $scope.mapState.here.lng)) {
                $scope.mapState.here = LeafletService.latLng(geom.coordinates[1], geom.coordinates[0]);
              }
            } else {
              ClickFeedbackService.drawArrowHere($scope.mapState, $scope.mapState.here);
            }
          }
        }
        $scope.point[response.layerGroupSlug] = pointL;
        console.log($scope.point);
      };

      ClickFeedbackService.drawClickInSpace($scope.mapState, here);

      angular.forEach($scope.mapState.layerGroups, function (layerGroup) {
        $scope.point.promCount++;
        layerGroup.getData({geom: here})
          .then(doneFn, doneFn, putDataOnScope);
      });
    };

    updateLine = function (line, layerGroups, scopeLine) {

      angular.forEach(layerGroups, function (layerGroup, slug) {
        if (layerGroup.isActive()
          && layerGroup.store_path
          && layerGroup.aggregation_type
          && layerGroup.aggregation_type !== 'counts')
        {

          // var agg = scopeLine[slug] || {},
          //     dataProm,
          //     startEnd = layerGroup.temporal
          //       ? [$scope.timeState.start, $scope.timeState.end]
          //       : [undefined, undefined];

          //dataProm = RasterService.getRasterData(slug, line, startEnd[0], startEnd[1], {});
          var dataProm = layerGroup.getData(line);

          // Pass the promise to a function that handles the scope.
          putDataOnscope(dataProm, slug);
        }
        else if (slug in scopeLine && !layerGroup.isActive())
        {
          removeDataFromScope(slug);
        }
      });
    };



    /**
     * Puts dat on line when promise resolves or
     * removes item from line when no data is returned.
     *
     * @param  {promise}  dataProm       a promise with line data
     * @param  {str}      slug           slug name of layer
     */
    putDataOnscope = function (dataProm, slug) {

      dataProm.then(function (result) {

        if (result.length > 0) {
          $scope.line[slug] = {};
          // convert degrees result to meters to display properly.
          if ($scope.mapState.layerGroups[slug].temporal) {
            $scope.line[slug].result = UtilService.dataConvertToMeters(result);
            $scope.line[slug].data = UtilService.createDataForTimeState($scope.line[slug].result, $scope.timeState);
          } else {
            $scope.line[slug].data = UtilService.dataConvertToMeters(result);
          }
          $scope.line[slug].name = $scope.mapState.layerGroups[slug].name;
        } else if (slug in $scope.line) {
          removeDataFromScope(slug);
        }
      });
    };

    removeDataFromScope = function (slug) {
      delete $scope.line[slug];
    };

    /**
     * calls updateLine with a wkt representation of
     * input
     *
     * @param {object} firstClick
     * @param {object} secondClick
     */
    _updateLine = function (firstClick, secondClick) {
      var line = UtilService.createLineWKT(firstClick, secondClick);
      updateLine(
        line,
        $scope.mapState.layerGroups,
        $scope.line
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

      if ($scope.mapState.points.length === 2) {

        $scope.mapState.points = [];
        ClickFeedbackService.emptyClickLayer($scope.mapState);
        // Empty data element since the line is gone
        $scope.line = {};

      } else {

        if ($scope.mapState.points.length === 1) {

          $scope.mapState.points[1] = $scope.mapState.here;
          _updateLine($scope.mapState.points[0], $scope.mapState.points[1]);
          ClickFeedbackService.drawLine($scope.mapState, $scope.mapState.points[0], $scope.mapState.points[1], false);
        } else {
          $scope.mapState.points[0] = $scope.mapState.here;
          ClickFeedbackService.drawLine($scope.mapState, $scope.mapState.points[0], $scope.mapState.userHere);
        }
      }
    });

    var watchIfUrlCtrlSetsPoints = $scope.$watch('mapState.points', function (n, o) {
      if ($scope.mapState.points.length === 2) {
        _updateLine($scope.mapState.points[0], $scope.mapState.points[1]);
        ClickFeedbackService.drawLine($scope.mapState, $scope.mapState.points[0], $scope.mapState.points[1]);
        watchIfUrlCtrlSetsPoints();
      }
    });

    /**
     * Updates line according to geo-pos of mouse
     */
    $scope.$watch('mapState.userHere', function (n, o) {
      if (n === o) { return true; }
      if ($scope.mapState.points[0] && !$scope.mapState.points[1]) {
        ClickFeedbackService.drawLine($scope.mapState, $scope.mapState.points[0], $scope.mapState.userHere, true);
      }
    });

    /**
     * Updates line data when users changes layers.
     */
    $scope.$watch('mapState.activeLayersChanged', function (n, o) {
      if (n === o) { return true; }
      if ($scope.mapState.points.length === 2) {
        _updateLine($scope.mapState.points[0], $scope.mapState.points[1]);
      }
    });

    /**
     * Updates line of temporal layers when timeState.at changes.
     */
    $scope.$watch('timeState.at', function (n, o) {
      angular.forEach($scope.line, function (line, slug) {
        if ($scope.mapState.layerGroups[slug].temporal) {
          line.data = UtilService.createDataForTimeState(line.result, $scope.timeState);
        }
      });
    });

    /**
     * Reload data from temporal rasters when temporal zoomended.
     */
    $scope.$watch('timeState.zoomEnded', function (n, o) {

      if (n === o) { return true; }
      if ($scope.mapState.points.length === 2) {
        var line = UtilService.createLineWKT($scope.mapState.points[0], $scope.mapState.points[1]);
        var dataProm, layerGroup;
        angular.forEach($scope.line, function (line, slug) {

          layerGroup = $scope.mapState.layerGroups[slug];
          if (layerGroup.temporal) {

            //dataProm = RasterService.getRasterData(slug, line, $scope.timeState.start, $scope.timeState.end, {});
            dataProm = layerGroup.getData(line);

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

        lat1 = $scope.mapState.points[0].lat;
        lat2 = $scope.mapState.points[1].lat;
        lon1 = $scope.mapState.points[0].lng;
        lon2 = $scope.mapState.points[1].lng;
        maxD = Math.sqrt(Math.pow((lat2 - lat1), 2) + Math.pow((lon2 - lon1), 2));
        d = UtilService.metersToDegs($scope.box.mouseLoc);
        r = d / maxD;
        dLat = (lat2 - lat1) * r;
        dLon = (lon2 - lon1) * r;
        posLat = dLat + lat1;
        posLon = dLon + lon1;
        if (circle === undefined) {
          circle = L.circleMarker([posLat, posLon], {
              color: '#34495e',
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
      ClickFeedbackService.emptyClickLayer($scope.mapState);
      $scope.mapState.points = [];
    });

  }
]);
