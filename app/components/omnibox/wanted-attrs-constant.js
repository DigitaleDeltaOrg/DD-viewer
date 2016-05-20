'use strict';

angular.module('omnibox')
.service("WantedAttributes", ["gettext", function (gettext) {

  this.pump = {
    rows: [
      {
        keyName: gettext("Capacity"),
        attrName: "capacity",
        ngBindValue:
          "asset.selectedAsset.capacity * 3.6 | niceNumberOrEllipsis: 2",
        valueSuffix: "m<sup>3</sup> / uur"
      },
      {
        /// Aanslagpeil
        keyName: gettext("Start level"),
        attrName: "start_level",
        ngBindValue:
          "asset.selectedAsset.start_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      },
      {
        /// Afslagpeil
        keyName: gettext("Stop level"),
        attrName: "stop_level",
        ngBindValue:
          "asset.selectedAsset.stop_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      }
    ]
  };

  this.bridge = {
    rows: [
      {
        keyName: gettext("Type"),
        attrName: "type",
        ngBindValue: "waterchain.type",
        valueSuffix: ""
      },
      {
        keyName: gettext("Width"),
        attrName: "width",
        ngBindValue:
          "waterchain.width | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Length"),
        attrName: "length",
        ngBindValue:
          "waterchain.length | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Height"),
        attrName: "height",
        ngBindValue:
          "waterchain.height | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      }
    ]
  };

  this.channel_Boezem = {
    rows: [
      {
        keyName: gettext("Name"),
        attrName: "name",
        ngBindValue: "waterchain.name",
        valueSuffix: ""
      },
      {
        keyName: gettext("Type"),
        attrName: "type",
        ngBindValue:
          "waterchain.type",
        valueSuffix: ""
      }
    ]
  };

  this.crossprofile = {
    rows: [
      {
        keyName: gettext("Type"),
        attrName: "type",
        ngBindValue:
          "waterchain.type | niceNumberOrEllipsis: 2",
        valueSuffix: ""
      }
    ]
  };

  this.culvert = {
    rows: [
      {
        keyName: gettext("Width"),
        attrName: "width",
        ngBindValue:
          "waterchain.width | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Length"),
        attrName: "length",
        ngBindValue:
          "waterchain.length | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Height"),
        attrName: "height",
        ngBindValue:
          "waterchain.height | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Material"),
        attrName: "material",
        ngBindValue:
          "waterchain.material | lookupCulvertMaterial",
        valueSuffix: ""
      },
      {
        keyName: gettext("Shape"),
        attrName: "shape",
        ngBindValue:
          "waterchain.shape | lookupCulvertShape",
        valueSuffix: ""
      }
    ]
  };

  this.filter = {
    rows: [
      {
        /// Bovenkant filter
        keyName: gettext("Filter top level"),
        attrName: "filter_top_level",
        ngBindValue: "asset.selectedAsset.filter_top_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        /// Onderkant filter
        keyName: gettext("Filter bottom level"),
        attrName: "filter_bottom_level",
        ngBindValue: "asset.selectedAsset.filter_bottom_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Aquifer confinement"),
        attrName: "aquifer_confiment",
        ngBindValue: "asset.selectedAsset.aquifer_confiment",
        valueSuffix: "m"
      },
      {
        /// bodemsoort
        keyName: gettext("Litology"),
        attrName: "litology",
        ngBindValue: "asset.selectedAsset.litology",
        valueSuffix: "m"
      },

    ]
  };

  this.groundwaterstation = {
    rows: [
      {
        keyName: gettext("Name"),
        attrName: "name",
        ngBindValue: "waterchain.name",
        valueSuffix: ""
      },
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      },
      {
        keyName: gettext("Surface level"),
        attrName: "surface_level",
        ngBindValue: "waterchain.surface_level",
        valueSuffix: "m"
      },
      {
        /// Bovenkant buis
        keyName: gettext("Top level"),
        attrName: "top_level",
        ngBindValue: "waterchain.top_level",
        valueSuffix: "m"
      },
      {
        /// Onderkan buis
        keyName: gettext("Bottom level"),
        attrName: "bottom_level",
        ngBindValue: "waterchain.bottom_level",
        valueSuffix: "m"
      }
    ]
  };

  this.levee = {
    rows: [
      {
        /// Kruinhoogte
        keyName: gettext("Crest height"),
        attrName: "crest_height",
        ngBindValue:
          "waterchain.crest_height | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      },
      {
        /// Bekleding
        keyName: gettext("Coating"),
        attrName: "coating",
        ngBindValue:
          "waterchain.coating",
        valueSuffix: ""
      },
      {
        keyName: gettext("Material"),
        attrName: "material",
        ngBindValue:
          "waterchain.material",
        valueSuffix: ""
      }
    ]
  };

  this.leveecrosssection = {
    rows: [
      {
        /// Naam
        keyName: gettext("Name"),
        attrName: "name",
        ngBindValue: "waterchain.name"
      }
    ]
  };

  this.leveereferencepoint = {
    rows: [
      {
        keyName: gettext("Type"),
        attrName: "type",
        ngBindValue:
          "waterchain.type",
        valueSuffix: ""
      }
    ]
  };

  this.manhole = {
    rows: [
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      },
      {
        keyName: gettext("Surface level"),
        attrName: "surface_level",
        ngBindValue:
          "waterchain.surface_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      },
      {
        keyName: gettext("Material"),
        attrName: "material",
        ngBindValue:
          "waterchain.material",
        valueSuffix: ""
      },
      {
        keyName: gettext("Width"),
        attrName: "width",
        ngBindValue:
          "waterchain.width | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Shape"),
        attrName: "shape",
        ngBindValue:
          "waterchain.shape | lookupManholeShape",
        valueSuffix: ""
      },
      {
        /// Putbodem
        keyName: gettext("Bottom level manhole"),
        attrName: "bottom_level",
        ngBindValue:
          "waterchain.bottom_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      }
    ],
  };

  this.measuringstation = {
    rows: [
      {
        keyName: gettext("Name"),
        attrName: "name",
        ngBindValue: "waterchain.name",
        valueSuffix: ""
      },
      {
        keyName: gettext("Category"),
        attrName: "category",
        ngBindValue: "waterchain.category",
        valueSuffix: ""
      },
      {
        keyName: gettext("Frequency"),
        attrName: "frequency",
        ngBindValue: "waterchain.frequency",
        valueSuffix: ""
      },
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      }
    ]
  };

  this.monitoringwell = {
    rows: [
      {
        keyName: gettext("Distance along cross section"),
        attrName: "distance_along_crosssection",
        ngBindValue:
          "waterchain.distance_along_crosssection | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Well top level"),
        attrName: "well_top_level",
        ngBindValue: "waterchain.well_top_level",
        valueSuffix: ""
      },
      {
        keyName: gettext("Well bottom level"),
        attrName: "well_bottom_level",
        ngBindValue:
          "waterchain.well_bottom_level",
        valueSuffix: ""
      }
    ]
  };

  this.orifice = {
    rows: [
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      },
      {
        /// Overstortbreedte
        keyName: gettext("Crest width"),
        attrName: "crest_width",
        ngBindValue:
          "waterchain.crest_width | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        /// Overstorthoogte
        keyName: gettext("Crest level"),
        attrName: "crest_level",
        ngBindValue:
          "waterchain.crest_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      },
      {
        keyName: gettext("Shape"),
        attrName: "shape",
        ngBindValue:
          "waterchain.shape | truncate: 20",
        valueSuffix: ""
      }
    ]
  };

  this.outlet = {
    rows: [
      {
        keyName: gettext("Manhole id"),
        attrName: "manhole_id",
        ngBindValue:
          "waterchain.manhole_id | niceNumberOrEllipsis: 2",
        valueSuffix: ""
      },
      {
        /// Buitenwaterstand (gemiddeld)
        keyName: gettext("Open water level (average)"),
        attrName: "open_water_level_average",
        ngBindValue:
          "waterchain.open_water_level_average | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      }
    ]
  };

  this.overflow = {
    rows: [
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      },
      {
        /// Overstortbreedte
        keyName: gettext("Crest width"),
        attrName: "crest_width",
        ngBindValue:
          "waterchain.crest_width",
        valueSuffix: "m"
      },
      {
        /// Overstorthoogte
        keyName: gettext("Crest level"),
        attrName: "crest_level",
        ngBindValue:
          "waterchain.crest_level",
        valueSuffix: "m (NAP)"
      }
    ]
  };

  this.pipe = {
    rows: [
      {
        keyName: gettext("Type"),
        attrName: "type",
        ngBindValue:
          "waterchain.type | lookupPipeType",
        valueSuffix: ""
      },
      {
        /// BOB beginpunt
        keyName: gettext("Invert level start point"),
        attrName: "invert_level_start_point",
        ngBindValue:
          "waterchain.invert_level_start_point | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      },
      {
        /// BOB eindpunt
        keyName: gettext("Invert level end point"),
        attrName: "invert_level_end_point",
        ngBindValue:
          "waterchain.invert_level_end_point | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      },
      {
        keyName: gettext("Length"),
        attrName: "length",
        ngBindValue:
          "waterchain.length | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Material"),
        attrName: "material",
        ngBindValue:
          "waterchain.material | pipeMaterialOrEllipsis",
        valueSuffix: ""
      },
      {
        keyName: gettext("Width"),
        attrName: "width",
        ngBindValue:
          "waterchain.width | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Shape"),
        attrName: "shape",
        ngBindValue:
          "waterchain.shape | lookupPipeShape",
        valueSuffix: ""
      },
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      }
    ]
  };

  this.pressurepipe = {
    rows: [
      {
        keyName: gettext("Name"),
        attrName: "name",
        ngBindValue: "waterchain.name",
        valueSuffix: ""
      },
      {
        keyName: gettext("Type"),
        attrName: "type",
        ngBindValue:
          "waterchain.type | lookupPressurePipeType",
        valueSuffix: ""
      },
      {
        keyName: gettext("Construction year"),
        attrName: "year_of_construction",
        ngBindValue:
          "waterchain.year_of_construction",
        valueSuffix: ""
      },
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      },
      {
        keyName: gettext("Diameter"),
        attrName: "diameter",
        ngBindValue:
          "waterchain.diameter | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Shape"),
        attrName: "shape",
        ngBindValue:
          "waterchain.shape",
        valueSuffix: ""
      },
      {
        keyName: gettext("Length"),
        attrName: "length",
        ngBindValue:
          "waterchain.length",
        valueSuffix: "m"
      },
      {
        keyName: gettext("Material"),
        attrName: "material",
        ngBindValue:
          "waterchain.material | pipeMaterialOrEllipsis",
        valueSuffix: ""
      }
    ]
  };

  this.pumpstation = {
    rows: [
      {
        keyName: gettext("Type"),
        attrName: "type",
        ngBindValue: "waterchain.type",
        valueSuffix: ""
      },
      {
        keyName: gettext("Capacity"),
        attrName: "capacity",
        ngBindValue:
          "waterchain.capacity * 3.6 | niceNumberOrEllipsis: 2",
        valueSuffix: "m<sup>3</sup> / uur"
      },
      {
        keyName: gettext("Name"),
        attrName: "name",
        ngBindValue: "waterchain.name",
        valueSuffix: ""
      },
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      },
      {
        /// Aanslagpeil
        keyName: gettext("Start level"),
        attrName: "start_level",
        ngBindValue:
          "waterchain.start_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      },
      {
        /// Afslagpeil
        keyName: gettext("Stop level"),
        attrName: "stop_level",
        ngBindValue:
          "waterchain.stop_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      }
    ]
  };

  this.pumped_drainage_area = {
    rows: [
    ]
  };

  this.sluice = {
    rows: [
      {
        keyName: gettext("Name"),
        attrName: "name",
        ngBindValue:
          "waterchain.name",
        valueSuffix: ""
      }
    ]
  };

  this.wastewatertreatmentplant = {
    rows: [ //Afvalwaterzuiveringsinstallatie
      {
        keyName: gettext("Name"),
        attrName: "name",
        ngBindValue: "waterchain.name",
        valueSuffix: ""
      },
    ]
  };

  this.weir = {
    rows: [
      {
        keyName: gettext("Code"),
        attrName: "code",
        ngBindValue:
          "waterchain.code",
        valueSuffix: ""
      },
      {
        keyName: gettext("Width"),
        attrName: "crest_width",
        ngBindValue:
          "waterchain.crest_width | niceNumberOrEllipsis: 2",
        valueSuffix: "m"
      },
      {
        /// Niveau
        keyName: gettext("Crest Level"),
        attrName: "crest_level",
        ngBindValue:
          "waterchain.crest_level | niceNumberOrEllipsis: 2",
        valueSuffix: "m (NAP)"
      },
      {
        /// Bediening
        keyName: gettext("Control"),
        attrName: "controlled",
        ngBindValue:
          "waterchain.controlled | lookupWeirControl",
        valueSuffix: ""
      },
    ]
  };

}]);
