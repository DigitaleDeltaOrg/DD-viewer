app.controller("ImpeachCandidate",
    ["$scope", "Omnibox", function ($scope, Omnibox) {
	$scope.show = function () {
		Omnibox.open('kpi');
	};
}]);

app.controller("KpiCtrl",
  ["$scope", "$http", "KpiService", function ($scope, $http, KpiService)  {

  /**
   * Setup scope variables
   *
   */
  $scope.kpi = KpiService;
  $scope.d3kpi = {'dates': {name: 'Date', values: [], units: 'Year'},
                  'kpis': {name: '', values: [], units: ''}};
  /**
   * Load KPI data from server for neighbourhoods and municipalities
   *
   */
  $scope.kpiLoader = function () {
    var wijkdata = '/static/data/wijken_apeldoorn.geojson';
    var gemeentedata = '/static/data/gemeenten_apeldoorn.geojson';
    $scope.kpi.areaData = {'wijk': {}, 'gemeente': {}};
    
    //NOTE: write a failure function
    $http.get(wijkdata)
        .success(function (data) {
          $scope.kpi.areaData.wijk = data;
        });

    $http.get(gemeentedata)
        .success(function (data) {
          $scope.kpi.areaData.gemeente = data;
          // initialise gemeente as first view
          $scope.kpiFormatter('gemeente');
          // ugly
          $scope.kpi.panZoom = {
            lat: data.features[0].geometry.coordinates[0][0][1],
            lng: data.features[0].geometry.coordinates[0][0][0],
            zoom: 11
          };
        });
  };

  /**
   * Format KPI data so it can be used in the view
   *
   */
  $scope.kpiFormatter = function (area_level) {

    //reset map
    //KpiService.clean = Date.now();
    $scope.kpi.kpiData = $scope.kpi.areaData[area_level];
    // later als get categories from kpi source
    //$scope.categories = [];
    //NOTE: buttugly crap
    $scope.kpi.dates = $scope.kpi.kpiData.features[0].properties.planrealisatie.dates;
    $scope.kpi.areas = [];
    // get unique areas
    for (var j in $scope.kpi.kpiData.features) {
      var feature = $scope.kpi.kpiData.features[j];
      if ($scope.kpi.areas.join(" ").indexOf(feature.properties.name) === -1) {
        $scope.kpi.areas.push(feature.properties.name);
      }
    }

    // initialise selected states only the first time
    if ($scope.kpi.slct_cat === undefined) {
      $scope.kpi.slct_cat =  $scope.kpi.categories[0];
      $scope.kpi.slct_area = $scope.kpi.areas[0];
      $scope.kpi.slct_date = $scope.kpi.dates[4];
    }
    if ($scope.area_level !== area_level) {
      //for (var i in $scope.kpi.categories) {
        //console.log($scope.kpi.categories[i]);
        //var category = $scope.kpi.categories[i];
        //$scope.kpi.slct_cat = category;
      //}
      $scope.kpi.slct_area = $scope.kpi.areas[0];
    }
    $scope.area_level = area_level;
  };

  $scope.activate = function (date, area, category) {
    $scope.kpi.slct_cat = category;
    $scope.kpi.slct_area = area;
    $scope.kpi.slct_date = date;
    // doesn't have to be updated when date changes
    $scope.d3formatted(area, category);
    // flip the changed var
    $scope.kpi.kpichanged = !$scope.kpi.kpichanged;
  };

  // prepare data for graph and badge values
  // NOTE: refactor so function below is included
  $scope.d3formatted = function (area, category) {
    $scope.d3kpi.kpis.name = category;
    $scope.badgevalues = {};
    $scope.d3kpi.kpis.values = [];
    $scope.d3kpi.dates.values = $scope.kpi.dates;
    for (var i in $scope.kpi.kpiData.features) {
      var feature = $scope.kpi.kpiData.features[i];
      // skip this if, just put it in the cat
      if (feature.properties.name === area) {
        $scope.d3kpi.kpis.values = feature.properties[category].values;
        $scope.formatted_data = $scope.format_data($scope.d3kpi);
        // ugly crap, make nicer data model for this
        //$scope.d3kpi.kpis[category] = feature.properties[category].values[$scope.kpi.dates.indexOf($scope.kpi.slct_date)];
        $scope.d3kpi.kpis[category] = feature.properties[category].values;
      }
    }
    return $scope.d3kpi;
  };

  $scope.labelValues = function (date, area, category) {
    $scope.d3formatted(area, category);
    var value = $scope.d3kpi.kpis[category][$scope.kpi.dates.indexOf($scope.kpi.slct_date)];
    return value;
  };

  //NOTE: refactor so this is included in d3formatted function
  $scope.format_data = function (d3kpi) {
    var formatted_data = [];
    for (var i = 0; i < d3kpi.dates.values.length; i++) {
      var xyobject = {
        date: d3kpi.dates.values[i],
        value: d3kpi.kpis.values[i]
      };
      formatted_data.push(xyobject);
    }
    return formatted_data;
  };

  // Load KPI data
  $scope.kpiLoader();

  //NOTE: watches and event handlers that I intuitively say don't belong here
  $scope.$on('clean', function () {
    KpiService.clean = Date.now();
  });

  $scope.$watch('kpi.slct_area', function () {
    if ($scope.kpi.slct_area !== undefined) {
      $scope.activate($scope.kpi.slct_date, $scope.kpi.slct_area, $scope.kpi.slct_cat);
    }
  });

  $scope.$watch('kpi.slct_date', function () {
    if ($scope.kpi.slct_date !== undefined) {
      $scope.activate($scope.kpi.slct_date, $scope.kpi.slct_area, $scope.kpi.slct_cat);
    }
  });

}]);
