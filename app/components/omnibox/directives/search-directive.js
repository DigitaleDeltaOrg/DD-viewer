'use strict';

/**
 * @description directive that displays search
 * and makes sure the right services are called.
 */
angular.module('omnibox')
  .directive('search', [
    'SearchService',
    'ClickFeedbackService',
    'State',
    'UtilService',
    '$timeout',
  function (SearchService, ClickFeedbackService, State,
    UtilService, $timeout) {

  var link = function (scope, element, attrs) {

    scope.omnibox.searchResults = {};

    scope.util = UtilService;
    scope.query = '';

    var KEYPRESS = {
      BACKSPACE: 8,
      ENTER: 13,
      SPACE: 32,
      ESC: 27,
      ARROWUP: 38,
      ARROWDOWN: 40
    };
    var ZOOM_FOR_OBJECT = 16;

    // Set focus on search input field.
    element.children()[0].focus();

    /**
     * Uses scope.query to search for results through SearchService. Response
     * from SearchService.search is an object with various results and promises.
     *
     * Currently searches for time and addresses.
     *
     * scope.omnibox.searchResults is used by search-results template.
     */
    scope.search = function () {
      scope.omnibox.searchResults = {};
      if (scope.query.length > 0) {
        var results = SearchService.search(scope.query, State);
        setResultsOnBox(results);
      } else {
        scope.cleanInput();
      }
    };

    /**
     * @description resets input field
     * on scope, because also needs to trigger on reset button,
     * not just on succesful search/zoom.
     *
     * @description - This does the following:
     *
     * (1) - Reset box.type to it's default value, "point";
     * (2) - Reset the search query to the empty string;
     * (3) - Reset box.content to an empty object;
     * (4) - Clear mapState.points arr (used for updating the Url);
     * (5) - Clear the click feedback.
     */
    scope.cleanInput = function () {
      SearchService.cancel();
      scope.query = "";
      scope.omnibox.searchResults = {};
    };

    /**
     * @description zooms to search resulit without clearing search or selecting the item.
     * @param {object} one search result.
     */
    scope.zoomToSearchResultWithoutClearingSearch = function (result) {
      State = SearchService.zoomToSearchResultWithoutSelecting(result, State);
    };

    /**
     * @description zooms to search resulit
     * @param {object} one search result.
     */
    scope.zoomToSearchResult = function (result) {
      scope.omnibox.searchResults = {};
      scope.query = "";
      State = SearchService.zoomToSearchResult(result, State);
    };

    /**
     * @description zooms to geocoder search result
     * @param {object} one search result.
     */
    scope.zoomToSpatialResult = function (result) {
      scope.omnibox.searchResults = {};
      scope.query = "";
      State = SearchService.zoomToGoogleGeocoderResult(result, State);
    };

    /**
     * @description zooms to geocoder search result without clearing search
     * @param {object} one search result.
     */
    scope.zoomToSpatialResultWithoutClearingSeach = function (result) {
      State = SearchService.zoomToGoogleGeocoderResult(result, State);
    };

    /**
     * Called by click on temporal result. Cleans results and search box and
     * Zooms to moment.js moment with nxtInterval.
     * @param  {moment} m moment.js moment with nxtInterval as a moment
     *                              duration.
     */
    scope.zoomToTemporalResult = function(m) {
      scope.omnibox.searchResults = {};
      scope.query = "";
      State.temporal.start = m.valueOf();
      State.temporal.end = m.valueOf() + m.nxtInterval.valueOf();
      UtilService.announceMovedTimeline(State);
    };


    var prevKey; // stores the previously pressed key.
    var prevKeyTimeout; // resets the key after TIMEOUT.
    var TIMEOUT = 300; // 300 ms

    /**
     * @description event handler for key presses.
     * checks if enter is pressed, does search.
     * @param {event} event that is fired.
     * 13 refers to the RETURN key.
     */
    scope.searchKeyPress = function ($event) {
      clearTimeout(prevKeyTimeout);


      if ($event.target.id === "searchboxinput") {
        // Intercept keyPresses *within* searchbox,do xor prevent animation
        // from happening when typing.

        if ($event.which === KEYPRESS.ESC) {
          scope.cleanInput();
        }

        else if ($event.which === KEYPRESS.SPACE) {
          // prevent anim. start/stop
          $event.originalEvent.stopPropagation();
        }

        else if ($event.which === KEYPRESS.ENTER) {
          var results = scope.omnibox.searchResults;
          if (results.temporal || results.spatial || results.api) {
            if (results.temporal) {
              scope.zoomToTemporalResult(
                scope.omnibox.searchResults.temporal
              );
            }
            else if (results.api) {
              scope.zoomToSearchResult(
                scope.omnibox.searchResults.api[0]
              );
            }
            else if (results.spatial) {
              scope.zoomToSpatialResult(
                scope.omnibox.searchResults.spatial[0]
              );
            }
            scope.cleanInput();
          }
        }
      }
    };


    /**
     * Contains the logic to go through search result and puts relevant parts on
     * box scope.
     *
     * When time is a valid moment it is synchronously put on
     * scope.omnibox.searchResults.temporal. If time is not valid it waits
     * for spatial results and puts those result on
     * scope.omnibox.searchResults.spatial. Prefers temporal results to
     * spatial results.
     *
     * @param {object} results object, with moment and promise
     * moment is a moment.js object
     * promise resolves with response from geocoder.
     */
    var setResultsOnBox = function (results) {
      var MAX_RESULTS = 3;

      if (
        results.temporal.isValid()
        && results.temporal.valueOf() > UtilService.MIN_TIME
        && results.temporal.valueOf() < UtilService.MAX_TIME
        ) {
        scope.omnibox.searchResults.temporal = results.temporal;
        // moment object.
      }

      else {
        results.spatial
          .then(function (response) {
            // Asynchronous so check whether still relevant.
            if (scope.omnibox.searchResults === undefined) { return; }

            // Either put results on scope or remove model.
            if (response.status === SearchService.responseStatus.OK) {
              var results = response.results;
              // limit to MAX_RESULTS results
              if (results.length >  MAX_RESULTS) {
                results = results.splice(0, MAX_RESULTS);
              }
              scope.omnibox.searchResults.spatial = results;
            }
            else if (
              response.status !== SearchService.responseStatus.ZERO_RESULTS
            ) {
              // Throw error so we can find out about it through sentry.
              throw new Error(
                'Geocoder returned with status: ' + response.status
              );
            }

          }
        );
      }

      results.search
        .then(function (response) {
          // Asynchronous so check whether still relevant.
          if (scope.omnibox.searchResults === undefined) { return; }
          if (response.results.length) {
            scope.omnibox.searchResults.api = response.results;
          }
        }
      );
    };

    /**
     * @description removes location model from box content
     */
    var destroySearchResultsModel = function () {
      delete scope.omnibox.searchResults;
    };

  };

  return {
    link: link,
    restrict: 'E',
    replace: true,
    templateUrl: 'omnibox/templates/search.html'
  };

}]);
