'use strict';

/**
 * Lizard-nxt filters
 *
 * Overview
 * ========
 *
 * Defines custom filters
 *
 */

/**
 * Filter to order objects instead of angulars orderBy
 * that only orders array
 */
angular.module('lizard-nxt')
  .filter('orderObjectBy', function() {
  return function (items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function (item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if (reverse) { filtered.reverse(); }
    return filtered;
  };
});


/**
 * Returns a rounded number or a '...' based on input type.
 *
 * @param {string} input to round or convert to dash, can be string or number
 * @param {number} optional decimals to round the number to
 * @return {string} when input is a number: returns a number
 * rounded to specified decimals else returns '-'
 */
angular.module('lizard-nxt')
  .filter('niceNumberOrEllipsis', function () {
  return function (input, decimals) {
    var out;
    if (typeof(input) === 'number') {
      var factor = 1;
      if (decimals) {
        factor = Math.pow(10, decimals);
      }
      out = Math.round(input * factor) / factor;
    } else {
      out = '...';
    }
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('lookupManholeShape', function () {
  return function (input) {
    var out;
    switch (input) {
    case '0.0':
      out = 'vierkant';
      break;
    case '1.0':
      out = 'rond';
      break;
    case '2.0':
      out = 'rechthoekig';
      break;
    default:
      out = '...';
    }
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('lookupLeveeType', function () {
  return function (input) {
    var out;
    switch (input) {
    case 1:
      out = 'Primair';
      break;
    case 2:
      out = 'Regionaal';
      break;
    case 3:
      out = 'c-type';
      break;
    default:
      out = '...';
    }
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('lookupLeveeReferencePointType', function () {
  return function (input) {
    var out;
    switch (input) {
    case 1:
      out = 'Dijkpaal';
      break;
    case 2:
      out = 'Virtueel';
      break;
    default:
      out = '...';
    }
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('lookupManholeMaterial', function () {
  return function (input) {
    var out;
    out = '...';
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('allowedFlowDirection', function () {
  return function (input) {
    var out;
    if (input !== null && input !== undefined) {
      out = input;
    } else {
      out = '...';
    }
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('pipeTypeOrEllipsis', function () {
  return function (input) {
    var out;
    switch (input) {
    case '00':
      out = 'Gemengde leiding';
      break;
    case '01':
      out = 'Regenwaterleiding';
      break;
    case '02':
      out = 'Vuilwaterleiding';
      break;
    default:
      out = 'Gesloten leiding';
    }
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('lookupPipeShape', function () {
  return function (input) {
    var out;
    switch (input) {
    case '0.0':
      out = 'rond';
      break;
    case '1.0':
      out = 'eivorm';
      break;
    case '2.0':
      out = 'rechthoek';
      break;
    case '4.0':
      out = 'vierkant';
      break;
    default:
      out = '...';
    }
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('pipeMaterialOrEllipsis', function () {
  return function (input) {
    var out;
    switch (input) {
    case '0.0':
      out = 'beton';
      break;
    case '1.0':
      out = 'PVC';
      break;
    case '2.0':
      out = 'gres';
      break;
    default:
      out = '...';
    }
    return out;
  };
});

angular.module('lizard-nxt')
  .filter('aggWinToYLabel', function () {
  return function (input) {
    var out;
    switch (input) {
    case 300000:
      out = 'mm / 5 min';
      break;
    case 3600000:
      out = 'mm / uur';
      break;
    case 86400000:
      out = 'mm / dag';
      break;
    case 2635200000:
      out = 'mm / maand';
      break;
    default:
      out = '...';
    }
    return out;
  };
});

/**
 * Truncates a string to have no more than maxLength characters.
 * Used in the righthand menu for truncating lengthy layer names.
 *
 * @param {integer} maxLength - Length at which string gets truncated.
 * @return {string} The truncated layer name
 */
angular.module('lizard-nxt')
  .filter('truncate', function () {

  return function (input, maxLength) {

    var MAX_LENGTH = maxLength || 20;

    if (input.length > MAX_LENGTH) {

      return input.slice(0, MAX_LENGTH - 3) + "...";

    } else {
      return input;
    }
  };
});


angular.module('lizard-nxt')
  .filter('objectTitle', function () {

  return function (input) {

    return {
      'bridge': 'Brug',
      'channel': 'Watergang',
      'crossprofile': 'Kruisprofiel',
      'culvert': 'Duiker',
      'manhole': 'Put',
      'measuringstation': 'Meetstation',
      'orifice': 'Doorlaat',
      'outlet': 'Uitlaat met keerklep',
      'overflow': 'Overstort',
      'pipe': 'Gesloten Leiding',
      'pumpstation': 'Gemaal',
      'pumpstation_sewerage': 'Rioolgemaal',
      'weir': 'Stuw',
      'pressurepipe': 'Persleiding',
      'sluice': 'Sluis',
      'levee': 'Kering',
      'leveereferencepoint': 'Referentiepunt kering'
    }[input] || input;
  };

});
