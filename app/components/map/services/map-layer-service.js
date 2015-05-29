'use strict';

/**
 * @ngdoc service
 * @name map.Layer
 * @description
 * # NxtLayer
 * Additional methods used to extend nxtLayer with leaflet/map specific methods.
 */
angular.module('map')
  .factory('NxtMapLayer', ['$q', '$http', function ($q, $http) {

      return {

        add: function (map) {
          var defer = $q.defer();
          if (this._leafletLayer) {
            // Vector layers need a timeState when added.
            this._leafletLayer.timeState = this.timeState;
            this._addLeafletLayer(map, this._leafletLayer);
            this._leafletLayer.on('load', function () {
              defer.resolve();
            });
          }
          else {
            defer.resolve();
          }
          return defer.promise;
        },

        remove: function (map) {
          if (this._leafletLayer) {
            this._removeLeafletLayer(map, this._leafletLayer);
          }
        },

        /**
         * @function
         * @description rescales layer and updates url
         */
        rescale: function (bounds) {
          if (this.rescalable) {
            var url = this.url +
              '?request=getlimits&layers=' + this.slug +
              '&width=16&height=16&srs=epsg:4326&bbox=' +
              bounds.toBBoxString();
            var self = this;
            $http.get(url).success(function (data) {
              self.limits = ':' + data[0][0] + ':' + data[0][1];
              self._leafletLayer.setParams({
                styles: self.options.styles + self.limits
              });
              self._leafletLayer.redraw();
            });
          }
        },

        setOpacity: function (opacity) {
          if (this._leafletLayer && this._leafletLayer.setOpacity) {
            this._leafletLayer.setOpacity(opacity);
          }
        },

        syncTime: function (timeState) {
          if (this.format !== 'Vector') { return; }
          this._leafletLayer.syncTime(timeState);
          return;
        },

        /**
         * @function
         * @memberof app.layerService
         * @param  {L.Class} Leaflet map
         * @param  {L.Class} Leaflet layer
         * @description Removes layer from map
         */
        _addLeafletLayer: function (map, leafletLayer) {
          if (map.hasLayer(leafletLayer)) {
            throw new Error(
              'Attempted to add layer' + leafletLayer._id
              + 'while it was already part of the map'
            );
          } else {
            map.addLayer(leafletLayer);
          }
        },

        /**
         * @function
         * @memberof app.layerService
         * @param  {L.Class} Leaflet map
         * @param  {L.Class} Leaflet layer
         * @description Removes layer from map
         */
        _removeLeafletLayer: function (map, leafletLayer) { // Leaflet NxtLayer
          if (map.hasLayer(leafletLayer)) {
            map.removeLayer(leafletLayer);
          }
        }

      };

    }
  ]);