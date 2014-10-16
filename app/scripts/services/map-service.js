'use strict';

/**
 * @ngdoc service
 * @class NxtMap
 * @memberof app
 * @name NxtMapService
 * @requires LeafletService
 * @summary Wraps stuff around Leaflet NxtMap objects
 * @description  NxtMap service encapsulates all kinds of helper functions
 * for the map-directive. A wrapper of sorts for Leaflet stuff,
 * the map object and mapState.
 *
 */

angular.module('lizard-nxt')
  .service('NxtMap', ['$rootScope', '$filter', '$http', 'CabinetService', 
  'LeafletService', 'LayerGroup',
  function ($rootScope, $filter, $http, CabinetService,
    LeafletService, LayerGroup) {

    function NxtMap(element, serverSideLayerGroups, options) {
      this.here = null;
      this.points = []; // History of here for drawing
      this.center = null;
      this.changed = Date.now();
      this.moved = Date.now();
      this.bounds = null;
      this.userHere = null; // Geographical location of the users mouse
      this.mapMoving = false;
      this.layerGroupsChanged = Date.now();

      this._map = createNxtMap(element, options);
      this.layerGroups = createLayerGroups(serverSideLayerGroups);
    }

    NxtMap.prototype = {

      /**
       * @function
       * @memberOf app.NxtMap
       * @description Toggles a layergroup when layergroups should be toggled
       *              takes into account that baselayers should toggle eachother
       * @param  layerGroup layergroup that should be toggled
       */
      toggleLayerGroup: function (layerGroup) {
        if (layerGroup.slug === 'elevation' && layerGroup.isActive()) {
          this._rescaleElevation(layerGroup);
        } else {
          // turn layer group on
          if (!(layerGroup.baselayer && layerGroup.isActive())) {
            layerGroup.toggle(this._map, layerGroup._slug);
            this.layerGroupsChanged = Date.now();
          }
          var map = this._map;
          if (layerGroup.baselayer || layerGroup.temporal) {
            angular.forEach(this.layerGroups, function (_layerGroup) {
              if (layerGroup.baselayer && _layerGroup.baselayer && _layerGroup.isActive() && _layerGroup.slug !== layerGroup.slug) {
                _layerGroup.toggle(map);
              } else if (layerGroup.temporal && _layerGroup.temporal && _layerGroup.isActive() && _layerGroup.slug !== layerGroup.slug) {
                _layerGroup.toggle(map);
              }
            });
          }
        }
      },

      /**
       * @function
       * @memberOf app.NxtMap
       * @description Sets the layergroups to the state they came from the
       *              server. Is called by the urlCtrl when no layergroup
       *              info is found on the server
       */
      setLayerGoupsToDefault: function () {
        var map = this._map;
        angular.forEach(this.layerGroups, function (layerGroup) {
          if (layerGroup.defaultActive) { layerGroup.toggle(map); }
        });
      },

      /**
       * @function
       * @memberOf app.NxtMapService
       * @description sets leaflet View based on panZoom
       * @param {object} panZoom Hashtable with, lat, lng, zoom
       */
      setView: function (panZoom) {
        if (panZoom.hasOwnProperty('lat') &&
            panZoom.hasOwnProperty('lng') &&
            panZoom.hasOwnProperty('zoom'))
        {
          this._map.setView(new LeafletService.LatLng(
            panZoom.lat, panZoom.lng), panZoom.zoom);
        } else {
          this._map.setView.apply(this._map, arguments);
        }
      },

      /**
       * @function
       * @memberOf app.NxtMapService
       * @description fits leaflet to extent
       * @param  {array} extent Array with NW, NE, SW,SE
       */
      fitBounds: function (bounds) {
        if (!(bounds instanceof LeafletService.LatLngBounds)) {
          this._map.fitBounds(L.latLngBounds(
            L.latLng(bounds.south, bounds.east),
            L.latLng(bounds.north, bounds.west)));
        } else {
          this._map.fitBounds(bounds);
        }
      },

      /**
       * @description legacy function.
       */
      latLngToLayerPoint: function (latlng) {
        return this._map.latLngToLayerPoint(latlng);
      },

      /**
       * @function
       * @memberOf app.NxtMapService
       * @description Initiate map events
       * @return {void}
       */
      initiateNxtMapEvents: function (clicked, moveStarted, moveEnded, mouseMoved) {
        var map = this._map;
        var conditionalApply = function (fn, e) {
          if (!$rootScope.$$phase) {
            $rootScope.$apply(fn(e, map));
          } else {
            fn(e, map);
          }
        };

        map.on('click', function (e) { conditionalApply(clicked, e); });
        map.on('movestart', function (e) { conditionalApply(moveStarted, e); });
        map.on('mousemove', function (e) { conditionalApply(mouseMoved, e); });
        map.on('moveend', function (e) { conditionalApply(moveEnded, e); });
      },

      addLayer: function (layer) {
        this._map.addLayer(layer);
      },

      removeLayer: function (layer) {
        this._map.removeLayer(layer);
      },

      // TODO: move temporal property to the layerGroup in the backend
      getActiveTemporalLayer: function () {
        var activeTemporalLayer = false;
        angular.forEach(this.layerGroups, function (layerGroup) {
          if (layerGroup.isActive()) {
            angular.forEach(layerGroup._layers, function (layer) {
              if (!activeTemporalLayer && layer.temporal) {
                activeTemporalLayer = layerGroup;
              }
            });
          }
        });
        return activeTemporalLayer;
      },

      /**
       * @function
       * @memberOf app.NxtMapService
       * @description Elevation can be rescaled according to extent
       */
      _rescaleElevation: function (lg) {
        var layer;
        angular.forEach(lg._layers, function (value) {
          if (value.type === 'WMS') {
            layer = value;
          }
        });
        if (!layer) { throw new Error('Attempted to rescale' + lg.slug + 'which does not have a wms'); }
        var url, bounds, limits, styles;
        bounds = this._map.getBounds();
        // Make request to raster to get min and max of current bounds
        url = 'https://raster.lizard.net/wms' +
                  '?request=getlimits&layers=elevation' +
                  '&width=16&height=16&srs=epsg:4326&bbox=' +
                  bounds.toBBoxString();
        $http.get(url).success(function (data) {
          limits = ':' + data[0][0] + ':' + data[0][1];
          styles = 'BrBG_r' + limits;
          layer.leafletLayer.setParams(
            {styles: styles}, true);
          layer.leafletLayer.redraw();
        });
      }

    };


    /**
     * @function
     * @memberof app.NxtMapService
     * @param  {object} nonLeafLayer object from database
     * @description Throw in a layer as served from the backend
     */
    var createLayerGroups = function (serverSideLayerGroups) {
      var layerGroups = {};
      angular.forEach(serverSideLayerGroups, function (sslg) {
        layerGroups[sslg.slug] = new LayerGroup(sslg);
      });
      return layerGroups;
    };


    /**
     * @function
     * @memberof app.NxtMapService
     * @param  {dynamic} mapElem can be string or Element.
     * @param  {options} Options (bounds, attribution etc.)
     * @return {L.NxtMap}   Leaflet.NxtMap instance
     * @description Creates a Leaflet map based on idString or Element.
     */
    var createNxtMap = function (mapElem, options) { // String or Element.

      var map = LeafletService.map(mapElem, options);

      return map;
    };

    return NxtMap;
  }
]);