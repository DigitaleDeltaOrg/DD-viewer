angular.module('lizard-nxt')
  .controller('LineCtrl', [
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
    };

    /**
     * @function
     * @memberOf app.pointCtrl
     * @param  {L.LatLng} here
     */
    var fillLine = function (points) {

      var doneFn = function (response) {
        if (response.active === false) {
          $scope.line[response.slug] = undefined;
        }
      };

      var putDataOnScope = function (response) {
        var lineL;
        if (response.data === null) { lineL = undefined;
        } else {
          lineL = $scope.line[response.layerGroupSlug] || {};
          lineL.layerGroup = response.layerGroupSlug;
          lineL[response.layerSlug] = lineL[response.layerSlug] || {};
          lineL[response.layerSlug].type = response.type;
          lineL[response.layerSlug].layerGroup = response.layerGroupSlug;
          lineL[response.layerSlug].data = response.data;
          lineL[response.layerSlug].order = $scope.mapState.layerGroups[response.layerGroupSlug].order;
          // TODO: move formatting of data to server.
          if (response.layerSlug === 'ahn2/wss') {
            lineL[response.layerSlug].data = UtilService.dataConvertToMeters(response.data);
          }
        }

        $scope.line[response.layerGroupSlug] = lineL;
      };

      angular.forEach($scope.mapState.layerGroups, function (layerGroup) {
        layerGroup.getData({geom: points})
          .then(doneFn, doneFn, putDataOnScope);
      });
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
          fillLine($scope.mapState.points);
          ClickFeedbackService.drawLine($scope.mapState, $scope.mapState.points[0], $scope.mapState.points[1], false);
        } else {
          $scope.mapState.points[0] = $scope.mapState.here;
          ClickFeedbackService.drawLine($scope.mapState, $scope.mapState.points[0], $scope.mapState.userHere);
        }
      }
    });

    var watchIfUrlCtrlSetsPoints = $scope.$watch('mapState.points', function (n, o) {
      if ($scope.mapState.points.length === 2) {
        fillLine($scope.mapState.points);
        ClickFeedbackService.drawLine($scope.mapState, $scope.mapState.points[0], $scope.mapState.points[1]);
        // Delete this watch
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
    $scope.$watch('mapState.layerGroupsChanged', function (n, o) {
      if (n === o) { return true; }
      if ($scope.mapState.points.length === 2) {
        fillLine($scope.mapState.points);
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
            putDataOnScope(dataProm, slug);
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
          $scope.mapState.addLayer(circle);
        } else {
          circle.setLatLng([posLat, posLon]);
        }
      }
      else {
        if (circle !== undefined) {
          $scope.mapState.removeLayer(circle);
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
