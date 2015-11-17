angular.module('dashboard')
  .controller("DashboardCtrl", ["$scope", "State", function ($scope, State) {

  this.state = State;

  State.box.type = 'omnibox-dashboard';

  // dimensions are dependent on screen size.
  // this is calculated in directive.
  this.dims = {};

  this.content = {};

  // statistics (maybe get dynamically from event aggregation service?)
  this.stats = ['max', 'min', 'mean', 'sum', 'median', 'count'];

  this.eventAggs = undefined;

  // default selection
  this.selectedStat = this.selectedStat || this.stats[2];

}]);
