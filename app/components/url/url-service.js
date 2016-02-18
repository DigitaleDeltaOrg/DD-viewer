
/**
 * @class LocationGetterSetter
 * @memberOf app
 *
 * @summary Lower level service to set $location.
 *
 * @description
 * Provides a setter and getter function to manipulate parts of the url to
 * keep the url synchronised with the actual application state. That way
 * you can use the url to share application state.
 */
angular.module('lizard-nxt')
  .service('LocationGetterSetter', ['$location', function ($location) {

    var _getPath, _getPathParts,

    service = {

     /**
      * @function
      * @memberOf angular.module('lizard-nxt').LocationGetterSetter
      * @description returns the value in the path of url at the specified part
      * @param {str} part, part url looking for currently <path | @>
      * @param {str} index location in the part
      * @return {str} value
      */
      getUrlValue: function (part, index) {
        if (!(part === 'path' || part === 'at')) {
          throw new Error(String(part) + ' is not a supported part of the url');
        }
        var pathParts = _getPathParts(part);
        var value = pathParts[index] === '' ? undefined : pathParts[index];
        return value;
      },

     /**
      * @function
      * @memberOf angular.module('lizard-nxt').LocationGetterSetter
      * @description sets the value in the path of url at the specified part
      * @param {str} part, part url looking for currently <path | @>
      * @param {str} index location in the part
      * @param {str} value
      */
      setUrlValue: function (part, index, value) {
        if (!(part === 'path' || part === 'at')) {
          throw new Error(String(part) + ' is not a supported part of the url');
        }
        if (value && !(typeof(value) === 'string' || typeof(value) === 'number')) {
          throw new Error(String(value) + ' cannot be set on the url');
        }
        var halfPath, otherHalf, parts = _getPathParts(part);
        if (!value && parts.length - 1 === index) {
          parts.splice(index, 1); // remove if no value and index is last one.
        } else {
          parts[index] = value; //replace
        }
        halfPath = parts.join('/');
        if (part === 'path') {
          otherHalf = _getPath('at') ? '@' + _getPath('at') : '';
          $location.path('/' + halfPath + otherHalf);
        } else {
          otherHalf = _getPath('path') ? _getPath('path') + '@' : '@';
          $location.path('/' + otherHalf + halfPath);
        }
      }
    };

   /**
    * @function
    * @memberOf angular.module('lizard-nxt')
  .LocationGetterSetter
    * @description returns the part of the path without first slash.
    * @param {str} part, part url looking for currently <path | @>
    * @return {str} the part the path.
    */
    _getPath = function (part) {

      var paths,
          pathPart,
          path = $location.path();

      paths = path.split('@'); //splits path in two at the @.
      pathPart = paths[part === 'path' ? 0 : 1] || ''; //gets before @ when 'path' after when 'at'
      // we do not want the first slash
      pathPart = part === 'path' ? pathPart.slice(1) : pathPart;
      return pathPart;
    };

   /**
    * @function
    * @memberOf angular.module('lizard-nxt')
  .LocationGetterSetter
    * @description splits the part of the path further in individual values.
    * @param {str} part of the path without first slash.
    * @return {array} the values in the part of the path.
    */
    _getPathParts = function (part) {
      var pathPart = _getPath(part);
      if (!pathPart) { return []; }
      return pathPart.split('/');
    };
    return service;
  }]);


/**
 * @ngdoc service
 * @class UrlState
 * @name UrlState
 * @description Higher level functions to parse and set URL.
 */
angular.module('lizard-nxt')
  .service("UrlState", ["LocationGetterSetter", "UtilService", function (LocationGetterSetter, UtilService) {

    // Amount of decimals of coordinates stored in url.
    var COORD_PRECISION = 4;

    var service = {

     /**
      * @function
      * @memberOf UrlState
      * @description Sets the points or the here on the url when
      *              respectively point or line is specified as type.
      * @param {object} state config object
      * @param {str} type box.type
      * @param {object} here leaflet LatLng object
      * @param {array} points array of leaflet LatLng objects
      */
      setgeomUrl: function (state, type, here, points) {
        var pointsStr = '';
        if (type === 'line') {
          angular.forEach(points, function (point) {
            pointsStr += point.lat.toFixed(COORD_PRECISION) + ',' + point.lng.toFixed(COORD_PRECISION) + '-';
          });
          pointsStr = pointsStr.substring(0, pointsStr.length - 1);
        } else {
          pointsStr = here === undefined
            ? ''
            : here.lat.toFixed(COORD_PRECISION) + ',' + here.lng.toFixed(COORD_PRECISION);
        }
        LocationGetterSetter.setUrlValue(state.geom.part, state.geom.index, pointsStr);
      },

     /**
      * @function
      * @memberOf UrlState
      * @description Sets the start and end epoch ms on the url
      * @param {object} state config object
      * @param {int} start time in ms
      * @param {int} end time in ms
      * @param {bool} relative time or absolute
      */
      setTimeStateUrl: function (state, start, end, relative) {
        var startDate = new Date(start);
        var endDate = new Date(end);

        if (relative) {
          var now = Date.now(),
              past = now - start,
              future = now - end;

          past = UtilService.getTimeIntervalAsText(start, now);
          future = UtilService.getTimeIntervalAsText(now, end);

          var pastString = '-' + past.days + 'Days' + past.hours + 'Hours';
          var futureString = '';

          if (future.days !== '' && future.hours !== '') {
            futureString = '+' + future.days + 'Days' + future.hours + 'Hours';
          }

          LocationGetterSetter.setUrlValue(
            state.timeState.part,
            state.timeState.index,
            pastString + futureString
          );
        } else {
          var startDateString = startDate.toDateString()
          .slice(4) // Cut off day name
          .split(' ') // Replace spaces by hyphens
          .join(',');
          var endDateString = endDate.toDateString()
          .slice(4) // Cut off day name
          .split(' ') // Replace spaces by hyphens
          .join(',');
          LocationGetterSetter.setUrlValue(
          state.timeState.part,
          state.timeState.index,
          startDateString + '-' + endDateString);
        }
      },

     /**
      * @function
      * @memberOf UrlState
      * @description Sets the mapView coordinates on the url.
      * @param {object} state config object
      * @param {object} lat leaflet Latitude object
      * @param {object} lng leaflet Lng object
      * @param {int} zoom level
      */
      setCoordinatesUrl: function (state, lat, lng, zoom) {
        var COORD_PRECISION = 4;
        var newHash = [
          parseFloat(lat).toFixed(COORD_PRECISION),
          parseFloat(lng).toFixed(COORD_PRECISION),
          zoom
        ].join(',');
        LocationGetterSetter.setUrlValue(
          state.mapView.part,
          state.mapView.index,
          newHash);
      },

      /**
       * @function
       * @memberOf UrlState
       * @description Sets the selected items part of the url
       * @param {object} state config object
       * @param {object} selected object (containing, assets, and geoms)
       */
      setSelectedUrl: function (state, selected) {
        var newHash = angular.copy(selected.assets);
        var n = Math.pow(10, COORD_PRECISION);
        var coords;
        angular.forEach(selected.geometries, function (geom) {
          if (geom.geometry.type === 'Point') {
            coords = angular.copy(geom.geometry.coordinates);
            coords.forEach(function (point, i) {
              coords[i] = Math.round(point * n) / n;
            });
            newHash.push(coords.join(','));
          }
          if (geom.geometry.type === 'LineString') {
            var points = [];
            coords = angular.copy(geom.geometry.coordinates);
            angular.forEach(coords, function (point) {
              point.forEach(function (pos, i) {
                point[i] = Math.round(pos * n) / n;
              });
              points.push(point.join(','));
            });
            newHash.push(points.join('-'));
          }
          if (geom.geometry.type === 'Polygon' && geom.id) {
            newHash.push(geom.id);
          }
        });

        LocationGetterSetter.setUrlValue(
          state.geom.part,
          state.geom.index,
          newHash.join('+')
        );
      },

      /**
       * @function
       * @memberOf UrlState
       * @description Sets the layer slugs on the url.
       * @param {object} state config object
       * @param {object} layerGroups list
       */
      setlayerGroupsUrl: function (state, layerGroups) {
        if (layerGroups === undefined) { return; }
        LocationGetterSetter.setUrlValue(
          state.layerGroups.part,
          state.layerGroups.index,
          layerGroups.toString()
        );
      },
      /**
       * @function
       * @memberOf UrlState
       * @description Sets the layer slugs on the url.
       * @param  {str} time time value of the url
       * @param  {object} timeState nxt timeState
       * @return {object} nxt timeState
       */
      parseTimeState: function (time, timeState) {
        if (time.split('Days').length > 1) {
          var times = time.split('-')[1].split('+');
          var past = times[0];
          var future = times[1];

          var msStartTime = UtilService.parseDaysHours(past);
          var msEndTime = UtilService.parseDaysHours(future);

          timeState.start = Date.now() - msStartTime;
          timeState.end = Date.now() + msEndTime;
        } else {
          // Browser independent. IE requires datestrings in a certain format.
          var times = time.replace(/,/g, ' ').split('-');
          var msStartTime = Date.parse(times[0]);
          // bail if time is not parsable, but return timeState
          if (isNaN(msStartTime)) { return timeState; }
          timeState.start = msStartTime;

          var msEndTime = Date.parse(times[1]);
          if (isNaN(msEndTime)) { return timeState; }
          if (msEndTime <= timeState.start) {
            msEndTime = timeState.start + 43200000; // half a day
          }
          timeState.end = msEndTime;
        }

        return timeState;
      },
      /**
       * @function
       * @memberOf UrlState
       * @description returns the mapview value parsed to
       *              latlonzoom
       * @param  {str} mapView
       * @return {object_or_false} Lat lon zoom object or false
       *                               when not valid.
       */
      parseMapView: function (mapView) {
        var latlonzoom = mapView.split(',');
        if (latlonzoom.length === 3
          && parseFloat(latlonzoom[0])
          && parseFloat(latlonzoom[1])
          && parseFloat(latlonzoom[2])) {
          return {
            latLng: [parseFloat(latlonzoom[0]), parseFloat(latlonzoom[1])],
            zoom: parseFloat(latlonzoom[2]),
            options: {reset: true, animate: true}
          };
        } else {
          return false;
        }
      },

      parseSelection: function (geom, selection) {
        var selections = geom.split('+');
        selections.forEach(function (selected) {
          if (selected.split('$').length === 2) {
            selection.assets.addAsset(selected);
          }

          else {
            var geometry = {
              geometry: {
                type: 'LineString'
              }
            };

            if (selected.split('-').length > 1) {
              // Line
              var points = selected.split('-');
              var coordinates = [];
              angular.forEach(points, function (pointStr) {
                var point = pointStr.split(',');
                if (parseFloat(point[0]) &&
                    parseFloat(point[1])) {
                  coordinates.push([Number(point[0]), Number(point[1])]);
                }
              });
              geometry.geometry.coordinates = coordinates;
              selection.geometries.addGeometry(geometry);
            }

            else if (selected.split(',').length > 1) {
              var geometry = {
                geometry: {
                  type: 'Point'
                }
              };
              var point = selected.split(',');
              if (parseFloat(point[0]) &&
                  parseFloat(point[1])) {
                var coordinates = [Number(point[0]), Number(point[1])];
                geometry.geometry.coordinates = coordinates;
                selection.geometries.addGeometry(geometry);
              }
            }

          }
        });





        // })
        // if (type === 'point'
        //   && point.length > 1
        //   && parseFloat(point[0])
        //   && parseFloat(point[1])) {
        //   state.here = L.latLng(point[0], point[1]);
        // }

        // else if (type === 'line') {
        //   var points = geom.split('-');
        //   angular.forEach(points, function (pointStr, key) {
        //     var point = pointStr.split(',');
        //     if (parseFloat(point[0]) &&
        //         parseFloat(point[1])) {
        //       state.points[key] = L.latLng(point[0], point[1]);
        //     }
        //   });
        // }

        // else if (type === 'multi-point' || 'point') {
        //   var items = geom.split(',');
        //   state.assets = items;
        // }

        return selection;
      },
      update: function (state) {
        var u = true;
        angular.forEach(state, function (value) {
          if (!value.update) {
            u = false;
          }
        });
        return u;
      }
    };

    return service;

  }
]);
