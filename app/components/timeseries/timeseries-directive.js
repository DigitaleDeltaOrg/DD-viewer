'use strict';
/**
 * Timeseries directive.
 */
angular.module('timeseries')
  .directive('timeseries', ['TimeseriesService', 'UtilService', '$filter',
    function (TimeseriesService, UtilService, $filter) {
  return {
      link: function (scope) {

        var GRAPH_WIDTH = 320; // Width of drawing area of box graphs.

        scope.timeseries = {};
        scope.fetching = false;

        /**
         * Return the currently selected timeseries if it is one of the
         * available timeseries.
         * @param  {array} timeseries list of available timeseries.
         * @param  {object} current   currently selected ts.
         * @return {object} selected timeseries.
         */
        var getSelectedTS = function (timeseries, current) {
          var selected = {};
          if (current) {
            selected = timeseries.filter(function (ts) {
              return ts.uuid === current.uuid;
            });
          }
          return selected.length > 0 ? selected[0] : timeseries[0];
        };

        /**
         * Fetch timeseries for asset. Remove zero datapoints from response and
         * update the selected ts.
         * @param  {object} asset utfgrid asset with entity_name and id.
         */
        var fetchTS = function(asset) {
          scope.fetching = true;

          var prom = {};

          var assetId = asset.entity_name + '$' + asset.id;

          // Get aggregation the size of the aggWindow when drawing bars for
          // rain stations.
          if (
            asset.entity_name === 'measuringstation' &&
            asset.station_type === 1
          ) {
            prom = TimeseriesService.getTimeSeriesForObject(
              assetId,
              scope.timeState.start,
              scope.timeState.end,
              false,
              UtilService.getAggWindowAsText(scope.timeState.aggWindow)
            );
          }
          else {
            prom = TimeseriesService.getTimeSeriesForObject(
              assetId,
              scope.timeState.start,
              scope.timeState.end,
              GRAPH_WIDTH,
              false
            );
          }

          prom.then(function (response) {
            var nonZeroResults =
              $filter('rmZeroDatumTimeseries')(response.results);
            scope.timeseries.data = [];
            angular.forEach(nonZeroResults, function (ts) {
              var entity_data = scope.asset;
              var keys = {
                x: 'timestamp',
                y: { 'y0': 'min', 'y1': 'max' }
              };
              if (entity_data.entity_name === 'measuringstation' &&
              entity_data.station_type === 1) {
                ts.type = 'bar-chart';
                keys = {
                  x: 'timestamp',
                  y: 'max',
                };
              }
              ts.content = [{
                data: ts.events,
                labels: {
                  y: ts.parameter_referenced_unit.referenced_unit_short_display_name,
                  x: ''
                },
                keys: keys
              }];
              scope.timeseries.data.push(ts);
            });

            scope.timeseries.selectedTimeseries = getSelectedTS(
              scope.timeseries.data,
              scope.timeseries.selectedTimeseries
            );
            scope.fetching = false;

          });
        };

        /**
         * Get new ts when asset changes
         */
        scope.$watch('asset', function () {
          fetchTS(scope.asset);
        });


        /**
         * Get new ts when time changes
         */
        scope.$watch('timeState.timelineMoving', function (off) {
          if (!off) {
            fetchTS(scope.asset);
          }
        });

      },
      restrict: 'E',
      scope: {
        asset: '=',
        fullDetails: '=',
        timeState: '='
      },
      // replace: true,
      templateUrl: 'timeseries/timeseries.html'
    };
}]);
