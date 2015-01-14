
angular.module('dashboard')
  .directive('dashboard',
             ["EventAggregateService", "State", "DataService",
              function (EventAggregateService, State, DataService) {

  // draw full screen graph
  var link = function (scope, element, attrs) {

    var getWidth = function () {
      return element.find('.dashboard-inner').width();
    };

    var getHeight = function () {
      return element.height();
    };

    scope.dimensions.width = getWidth() - 10;

    var aggregateEvents = function () {
      var eventAgg;
      // reset eventAggs
      scope.eventAggs = [];
      angular.forEach(DataService.layerGroups, function (lg) {
        lg.getData({
          geom: State.spatial.bounds,
          start: State.temporal.start,
          end: State.temporal.end,
          type: 'Event'
        }).then(null, null, function (response) {

          if (response && response.data) {
            // aggregate response
            eventAgg = {
              data: EventAggregateService.aggregate(
                      response.data,
                      State.temporal.aggWindow,
                      lg.mapLayers[0].color
                    ),
              ylabel: lg.name,
              baseColor: lg.mapLayers[0].color
            };

            scope.eventAggs.push(eventAgg);
            // calculate new dimensions
            scope.dimensions.height =
              (getHeight() / scope.eventAggs.length) - 20;
          }
        });
      });
    };

    /**
     * Updates dashboard when user pans or zooms map.
     */
    scope.$watch(State.toString('spatial.bounds'), function (n, o) {
      if (n === o) { return true; }
      aggregateEvents();
    });

    /**
     * Updates dashboard when layers are added or removed.
     */
    scope.$watch(State.toString('layerGroups.active'), function (n, o) {
      if (n === o) { return true; }
      aggregateEvents();
    });

    /**
     * Updates dashboard when time zoom changes.
     */
    scope.$watch(State.toString('temporal.timelineMoving'), function (n, o) {
      if (n === o) { return true; }
      aggregateEvents();
    });

    // init
    aggregateEvents();

    // hack to get color map for legend
    scope.getColorMap = EventAggregateService.getColorMap;
  };

  return {
    link: link,
    templateUrl: 'dashboard/dashboard.html',
    replace: true,
    restrict: 'E'
  };

}]);