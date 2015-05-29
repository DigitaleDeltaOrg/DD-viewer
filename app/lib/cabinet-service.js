'use strict';

angular.module('lizard-nxt')
  .service("CabinetService", ["$q", "Restangular", "backendDomain",
  function ($q, Restangular, backendDomain) {

  var geocodeResource,
      timeseriesResource,
      events;

  // for the wizard demo's
  if (window.location.host === 'nens.github.io' ||
      window.location.host === 'lizard.sandbox.lizard.net') {
    Restangular.setBaseUrl(backendDomain);
    Restangular.setDefaultHttpFields({withCredentials: true});
  }
  Restangular.setRequestSuffix('?page_size=25000');

  timeseriesResource = Restangular.one('api/v1/timeseries/');
  events = Restangular.one('api/v1/events/');

  geocodeResource = Restangular
    // Use a different base url, go directly to our friends at google.
    // They don't mind.
    .withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('https://maps.googleapis.com/maps');
    })
    .one('api/geocode/json');


  /**
   * Raster resource, last stop to the server
   * @param  {promise} q             a promise to cancel previous requests
   *                                 if none is given a local 'abortGet' is
   *                                 used.
   *                                 At the next request without a promise, the
   *                                 abortGet is cancelled.
   * @return {RestangularResource}  a gettable resource
   */
  var abortGet;
  var rasterResource = function (q) {
    var localPromise = q ? q : abortGet;
    if (localPromise === abortGet) {
      if (abortGet) {
        abortGet.resolve();
      }
      abortGet = $q.defer();
      localPromise = abortGet;
    }
    return Restangular
      .one('api/v1/raster-aggregates/')
      .withHttpConfig({timeout: localPromise.promise});
  };

  var tooltips = {
    login: "Inloggen",
    logout: "Uitloggen",
    profile: "Profiel aanpassen",
    version: "Dubbelklik voor de Lizard versie",
    openMenu: "Datamenu openen",
    closeMenu: "Datamenu sluiten",
    transparency: "Transparantie aanpassen",
    pointTool: "Puntselectie",
    lineTool: "Lijnselectie",
    areaTool: "Scherm selectie",
    resetQuery: "Resultaatvenster sluiten",
    zoomInMap: "Zoom in op de kaart",
    zoomOutMap: "Zoom uit op de kaart",
    zoomInTimeline: "Zoom in op de tijdlijn",
    goToNow: "Ga naar het heden op de tijdlijn",
    zoomOutTimeline: "Zoom uit op de tijdlijn",
    startAnim: "Start de animatie",
    stopAnim: "Stop de animatie",
    timelineStart: "Het begin van de huidige tijdlijn",
    timelineAt: "Het 'nu' op de tijdlijn",
    timelineEnd: "Het einde van de huidige tijdlijn"
  };

  return {
    events: events,
    tooltips: tooltips,
    geocode: geocodeResource,
    raster: rasterResource,
    timeseries: timeseriesResource,
  };
}]);