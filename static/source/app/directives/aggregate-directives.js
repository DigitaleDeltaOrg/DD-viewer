/**
 * Add non tiled d3 event vector layer
 *
 * Implemented as a layer to display point events. Events
 * are aggregated based on viewport (spatial extent) and
 * time-interval (temporal extent, from timeline)
 *
 */
app.directive('vectorlayer', function () {
  return {
    restrict: 'A',
    require: 'map',
    link: function (scope, element, attrs, mapCtrl) {

      var createEventLayer = function (data) {
        var map = mapCtrl.map();
        var svg = d3.select(map.getPanes().overlayPane).append("svg"),
            g = svg.append("g").attr("class", "leaflet-zoom-hide");
        
        function projectPoint(x, y) {
          var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
        }

        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform),
            bounds = path.bounds(data);

        function reset() {
          bounds = path.bounds(data);

          var topLeft = bounds[0],
              bottomRight = bounds[1],
              width = bottomRight[0] - topLeft[0] + 20,
              height = bottomRight[1] - topLeft[1] + 20;

          svg.attr()
             .attr("width", width)
             .attr("height", height)
             // Shift whole viewbox halve a pixel for nice and crisp rendering
             .attr("viewBox", "-0.5 -0.5 " + width + " " + height)
             .style("left", (topLeft[0] - 10) + "px")
             .style("top", (topLeft[1] - 10) + "px");

          g.attr("transform", "translate(" + -(topLeft[0] - 10) + "," + -(topLeft[1] - 10) + ")")
           .selectAll("path").attr("d", path);
        }

        map.on("viewreset", reset);

        var feature = g.selectAll("path")
            .data(data.features, function  (d) { return d.id; });

        feature.enter().append("path")
          .attr("d", path)
          .attr("class", "circle event")
          .attr("fill-opacity", 0)
          .attr('fill', function (d) {
            return d.color;
          })
          .transition()
          .delay(500)
          .duration(1000)
          .attr('fill-opacity', 0.8);

        feature.on('click', function (d) {
            scope.box.type = 'aggregate';
            scope.box.content.eventValue = d;
            scope.$apply();
          });

        reset();
        return {
          g: g,
          svg: svg,
          path: path,
          reset: reset
        };
      };

      var updateEventLayer = function (eventLayer, data) {
        eventLayer.reset();
        var feature = eventLayer.g.selectAll("path")
            .data(data.features, function  (d) { return d.id; });

        feature.transition()
          .delay(500)
          .duration(1000)
          .attr('fill', function (d) {
            return d.color;
          });

        feature.enter().append("path")
          .attr("d", eventLayer.path)
          .attr("class", "circle event")
          .attr("fill-opacity", 0)
          .attr('fill', function (d) {
            return d.color;
          })
          .transition()
          .delay(500)
          .duration(1000)
          .attr('fill-opacity', 0.8);

        feature.exit()
          .transition()
          .duration(1000)
          .style("fill-opacity", 1e-6)
          .remove();

        feature.on('click', function (d) {
            scope.box.type = 'aggregate';
            scope.box.content.eventValue = d;
            scope.$apply();
          });
      };

      var removeEventLayer = function (eventLayer) {
        eventLayer.svg.remove();
        return eventLayer = false;
      };

      /*
       * Draw events based on current temporal extent
       */
      var drawTimeEvents = function (start, end) {
        //NOTE: not optimal class switching
        d3.selectAll(".circle").classed("hidden", true);
        d3.selectAll(".circle")
          .classed("selected", function (d) {
            var s = [start, end];
            var time = d.properties.timestamp;
            var contained = s[0] <= time && time <= s[1];
            // Some book keeping to count
            d.inTempExtent = contained;
            return contained;
          });
        var selected = d3.selectAll(".circle.selected");
        selected.classed("hidden", false);
      };

      // watch for change in temporalExtent, change visibility of
      // alerts accordingly
      scope.$watch('timeState.changedZoom', function (n, o) {
        if (n === o) { return true; }
        drawTimeEvents(scope.timeState.start, scope.timeState.end);
        scope.events.countCurrentEvents();
      });

      var eventLayer;
      scope.$watch('events.changed', function (n, o) {
        if (n === o) { return true; }
        if (eventLayer) {
          if (scope.events.data.features.length === 0) {
            eventLayer = removeEventLayer(eventLayer);
          } else {
            updateEventLayer(eventLayer, scope.events.data);
          }
        } else {
          eventLayer = createEventLayer(scope.events.data);
        }
        drawTimeEvents(scope.timeState.start, scope.timeState.end);
      });

      // Watch for animation   
      scope.$watch('timeState.at', function () {
        if (scope.timeState.animation.enabled) {
          drawTimeEvents(scope.timeState.animation.start, scope.timeState.animation.end);
          scope.events.countCurrentEvents();
        }
      });
    }
  };
});


/**
 * Impervious surface vector layer
 *
 * Load data with d3 geojson vector plugin L.TileLayer.GeoJSONd3 in ./lib
 * bind highlight function to mouseover and mouseout events.
 *
 * NOTE: this contains quite some hard coded stuff. Candidate for refactoring
 * to make generic
 *
 */
app.directive('surfacelayer', function () {
  return {
    restrict: 'A',
    require: 'map',
    link: function (scope, element, attrs, mapCtrl) {

      /**
       * Style surface features.
       *
       * Function to style d3 features in d3 selection
       *
       * @param: features, d3 selection object
       */
      var surfaceStyle = function (features) {
        features
          .style("stroke-width", 0)
          .style("fill-opacity", 0);
      };

      /**
       * Convert list with values to d3 selector
       * 
       * @param: list of values
       * @returns: concatenated d3 suitable OR selector
       */
      var listToSelector = function (list) {
        var selector = "";
        for (var i in list) {
          // prepend `.p` because classes can't start with an number
          selector += ".p" + list[i] + ", ";
        }
        selector = selector.slice(0, -2);

        return selector;
      };

      /**
       * Callback function to highlight surfaces connected to pipe
       *
       * Selects d3 objects based on ids in data property (in this case in 
       * `impervious_surfaces`. On 'mouseover' highlights features, on
       * 'mouseout' fades features to transparant
       *
       * @param: e, event object, expects the data property to have a
       * `impervious_surfaces` property
       *
       */
      var highlightSurface = function (e) {
        var surface_ids = JSON.parse(e.data.impervious_surfaces);
        if (surface_ids.indexOf("null") === -1) {
          var selector = listToSelector(surface_ids);
          if (e.type === 'mouseover') {
            d3.selectAll(selector)
              .style("stroke", "#f00")
              .style("stroke-width", 1.2)
              .style("fill", "#ddd")
              .style("fill-opacity", 0.6)
              .transition();
          } else if (e.type === 'mouseout') {
            d3.selectAll(selector)
              .transition()
              .duration(3000)
              .style("stroke-width", 0)
              .style("fill-opacity", 0);
          }
        }
      };

      /**
       * Get layer from leaflet map object.
       *
       * Because leaflet doesn't supply a map method to get a layer by name or
       * id, we need this crufty function to get a layer.
       *
       * NOTE: candidate for (leaflet) util module
       *
       * @layerType: layerType, type of layer to look for either `grid`, `png`
       * or `geojson`
       * @param: entityName, name of ento
       * @returns: leaflet layer object or false if layer not found
       */
      var getLayer = function (layerType, entityName) {
        var layer = false,
            tmpLayer = {};
        for (var i in scope.map._layers) {
          tmpLayer = scope.map._layers[i];
          if (tmpLayer._url && tmpLayer._url.indexOf(
            layerType + '?object_types=' + entityName) !== -1) {
            layer = tmpLayer;
            break;
          }
        }
        return layer;
      };

      // Initialise geojson layer
      var surfaceLayer = L.geoJSONd3(
        'api/v1/tiles/{z}/{x}/{y}/.geojson?object_types=impervioussurface',
        {
          applyStyle: surfaceStyle,
          class: "impervious_surface"
        });

      /**
       * Listen to tools model for pipe_surface tool to become active. Add 
       * geojson d3 layer and bind mouseover and mouseout events to 
       * highlight impervious surface.
       *
       */
      scope.$watch('tools.active', function () {
        if (scope.tools.active === "pipe_surface") {
          mapCtrl.addLayer(surfaceLayer);
          var pipeLayer = getLayer('grid', 'pipe');
          if (pipeLayer) {
            // icon active
            angular.element(".surface-info").addClass("icon-active");
            pipeLayer.on('mouseover', highlightSurface);
            pipeLayer.on('mouseout', highlightSurface);
          }
        } else {
          var pipeLayer = getLayer('grid', 'pipe');
          if (pipeLayer) {
            // icon inactive
            angular.element(".surface-info").removeClass("icon-active");
            pipeLayer.off('mouseover', highlightSurface);
            pipeLayer.off('mouseout', highlightSurface);
          }
          mapCtrl.removeLayer(surfaceLayer);
        }
      });
    }
  };
});

