'use strict';

var app = angular.module('demo-graph', ['graph']);

app.controller('DemoCtrl', function ($scope){
    $scope.randomizeData = function () {
      var values = [
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
      ];
      var baseDate = 1357714800000 - 2000000 * Math.random ();
      var dates = [
        baseDate,
        baseDate + 100000,
        baseDate + 200000,
        baseDate + 300000,
        baseDate + 400000,
        baseDate + 500000,
        baseDate + 600000,
        baseDate + 700000,
        baseDate + 800000,
        baseDate + 900000,
        baseDate + 1000000,
        baseDate + 1100000,
      ];
     var data = [{
            type: 'y',
            name: 'Debiet',
            values: values,
            unit: "m/s"
          },
          {
            type: 'x',
            name: 'Time',
            values: dates,
            unit: "hr:min"
          }];
      return data
  };


  $scope.data = [[0.2, 1371815999999], [0.0, 1371816300000], [0.2, 1371816600000], [0.0, 1371817499999], [0.2, 1371817799999], [0.0, 1371818100000], [0.1, 1371818400000], [0.0, 1371818700000], [0.1, 1371819000000], [0.0, 1371819299999], [0.0, 1371896399999], [0.1, 1371896699999], [0.0, 1371899700000], [0.4, 1371900900000], [0.0, 1371901500000], [0.1, 1371901800000], [0.0, 1371902099999], [0.1, 1371902700000], [0.0, 1371903000000], [0.1, 1371906900000], [0.0, 1371924599999], [0.8, 1371925200000], [0.0, 1371925500000], [0.0, 1371952800000], [0.2, 1371953100000], [0.0, 1371954900000], [0.3, 1371955499999], [0.0, 1371959099999], [0.4, 1371959399999], [0.0, 1371960000000], [0.4, 1371967500000], [0.0, 1371968399999], [0.1, 1371968699999], [0.0, 1371969000000], [0.1, 1371969300000], [0.0, 1371969600000], [0.1, 1371971400000], [0.0, 1371971999999], [0.0, 1372284300000], [0.6, 1372284599999], [0.0, 1372285500000], [0.1, 1372286999999], [0.0, 1372287300000], [0.1, 1372290000000], [0.0, 1372290599999], [0.0, 1372309800000], [0.2, 1372310100000], [0.0, 1372310999999], [0.1, 1372312499999], [0.0, 1372312799999], [0.0, 1372372800000], [0.1, 1372373099999], [0.0, 1372373399999], [0.1, 1372374899999], [0.0, 1372375199999], [0.1, 1372375500000], [0.0, 1372375800000], [0.1, 1372376100000], [0.0, 1372376400000], [0.0, 1372406099999], [0.1, 1372406399999], [0.0, 1372406699999], [0.0, 1372445700000], [0.2, 1372446000000], [0.0, 1372451700000], [0.8, 1372456800000], [0.0, 1372460400000], [0.2, 1372462200000], [0.0, 1372463099999], [0.2, 1372464000000], [0.0, 1372464600000], [0.1, 1372464899999], [0.0, 1372465499999], [0.0, 1372802400000], [0.1, 1372802700000], [0.0, 1372812599999], [0.4, 1372812899999], [0.0, 1372813800000], [0.1, 1372814100000], [0.0, 1372814399999], [0.1, 1372814699999], [0.0, 1372814999999], [0.1, 1372816499999], [0.0, 1372816799999], [0.1, 1372818599999], [0.0, 1372818900000], [0.1, 1372821000000], [0.0, 1372821300000], [0.1, 1372821600000], [0.0, 1372821899999], [0.1, 1372822800000], [0.0, 1372823400000], [0.1, 1372838100000], [0.0, 1372838399999], [0.1, 1372839600000], [0.0, 1372839900000], [0.0, 1372860300000], [0.1, 1372860599999], [0.0, 1372860899999], [0.0, 1374763800000], [0.8, 1374764400000], [0.0, 1374764999999], [0.1, 1374765299999], [0.0, 1374765600000], [0.0, 1374921000000], [1.2, 1374921299999], [0.0, 1374924000000], [0.1, 1374924899999], [0.0, 1374925199999], [0.0, 1374964800000], [0.1, 1374965100000], [0.0, 1374965399999], [0.4, 1374967799999], [0.0, 1374972000000], [0.1, 1374983699999], [0.0, 1374983999999], [0.0, 1375190099999], [0.3, 1375191300000], [0.0, 1375195199999], [1.6, 1375196700000], [0.0, 1375197599999], [0.3, 1375199399999], [0.0, 1375200000000], [0.3, 1375206599999], [0.0, 1375209899999], [0.1, 1375210199999], [0.0, 1375211400000], [0.1, 1375211700000], [0.0, 1375211999999], [0.1, 1375212299999], [0.0, 1375212600000], [0.1, 1375213200000], [0.0, 1375213500000], [0.1, 1375214700000], [0.0, 1375215000000], [0.1, 1375215599999], [0.0, 1375215899999], [0.1, 1375217399999], [0.0, 1375217699999], [0.1, 1375222200000], [0.0, 1375222500000], [0.0, 1375241100000], [0.1, 1375241399999], [0.0, 1375241699999], [0.0, 1375736099999], [0.1, 1375736399999], [0.0, 1375736699999], [0.0, 1375876800000], [0.1, 1375877100000], [0.0, 1375877400000], [0.1, 1375877999999], [0.0, 1375878299999], [0.1, 1375878600000], [0.0, 1375878900000], [0.1, 1375879200000], [0.0, 1375879799999], [0.1, 1375880099999], [0.0, 1375881000000], [0.1, 1375881300000], [0.0, 1375881599999], [0.1, 1375882199999], [0.0, 1375882500000], [0.1, 1375883999999], [0.0, 1375884600000], [0.1, 1375885199999], [0.0, 1375885499999], [0.1, 1375886100000], [0.0, 1375886400000], [0.1, 1375887900000], [0.0, 1375888200000], [0.0, 1376396100000], [0.1, 1376396400000], [0.0, 1376396699999], [0.0, 1376560200000], [0.4, 1376560799999], [0.0, 1376563200000], [0.1, 1376563500000], [0.0, 1376564099999], [0.1, 1376564399999], [0.0, 1376564699999], [0.1, 1376565000000], [0.0, 1376565300000], [0.1, 1376566499999], [0.0, 1376566800000], [0.0, 1376782200000], [0.6, 1376783399999], [0.0, 1376784000000], [0.4, 1376796900000], [0.0, 1376798099999], [0.1, 1376798700000], [0.0, 1376799000000], [0.1, 1376799599999], [0.0, 1376799899999], [0.1, 1376800800000], [0.0, 1376801100000], [0.1, 1376804700000], [0.0, 1376805000000], [0.1, 1376805299999], [0.0, 1376805599999], [0.1, 1376805900000], [0.0, 1376806200000], [0.1, 1376806500000], [0.0, 1376806800000], [0.1, 1376807399999], [0.0, 1376807699999], [0.1, 1376809800000], [0.0, 1376810100000], [0.1, 1376810999999], [0.0, 1376811299999], [0.1, 1376812499999], [0.0, 1376829900000], [0.2, 1376830200000], [0.0, 1376830500000], [0.0, 1376896200000], [0.05, 1376896500000], [0.0, 1376896800000], [0.0, 1377064799999]];

  $scope.kpiData = function () {
      var values = [
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
        Math.random() * 100, 
      ];
      var baseDate = 2006;
      var dates = [
        baseDate,
        baseDate + 1,
        baseDate + 2,
        baseDate + 3,
        baseDate + 4,
        baseDate + 5,
        baseDate + 6,
        baseDate + 7,
        baseDate + 8,
        baseDate + 9,
        baseDate + 10,
        baseDate + 11,
      ];
     var data = [{
            type: 'y',
            name: 'Debiet',
            values: values,
            unit: "m/s"
          },
          {
            type: 'x',
            name: 'Time',
            values: dates,
            unit: "hr:min"
          }];
      return data
  };

  $scope.updateData = function () {
    $scope.data1 = $scope.randomizeData();
    $scope.data2 = $scope.randomizeData();
    $scope.data2line = $scope.data1;
    $scope.data2line.push($scope.data2[0]);
    $scope.data2line.push($scope.data2[1]);
    $scope.KpiData = $scope.kpiData();
  };
  $scope.updateData();
  
  $scope.malformData = function () {
    $scope.formatted_data1 = [[2]];
    $scope.formatted_data2 = [[2]];
  };
  
  $scope.$watch('data1', function () {
    if ($scope.data1){

      $scope.formatted_data1 = $scope.format_data($scope.data1);
      $scope.formatted_data2 = $scope.format_data($scope.data2);
      $scope.formatted_2line = $scope.format_2linedata($scope.data2line);
      $scope.scatter = $scope.format_scatter([$scope.data1[0], $scope.data2[0]]);
      $scope.kpi_data = $scope.format_data($scope.KpiData);
      // console.log($scope.data2line);
    }
  });

  $scope.format_data = function(data) {
    var formatted_data = [];
    for (var i=0; i<data[0].values.length; i++){
      var xyobject = {
        date: data[1].values[i], 
        value: data[0].values[i] 
      };
      formatted_data.push(xyobject);
    };
    return formatted_data
  };

  $scope.format_scatter = function(data) {
    var formatted_data = [];
    for (var i=0; i<data[0].values.length; i++){
      var xyobject = {
        x: data[1].values[i], 
        y: data[0].values[i] 
      };
      formatted_data.push(xyobject);
    };
    return formatted_data
  };



  $scope.format_2linedata = function(data) {
    var formatted_data = [];
    for (var i=0; i<data[0].values.length; i++){
      var xyobject = {
        date: data[1].values[i], 
        value: data[0].values[i],
        date2: data[3].values[i],
        value2: data[2].values[i] 
      };
      formatted_data.push(xyobject);
    };
    return formatted_data
  };



});