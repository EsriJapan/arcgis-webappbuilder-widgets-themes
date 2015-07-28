///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Esri Japan. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'jimu/utils',

  'dijit/form/Button',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/geometry/Point',
  'esri/graphic',
  'esri/layers/GraphicsLayer',
  'esri/Color',
  'dojo/on',
  'dojo/_base/lang'
  ],
function(
  declare,
  BaseWidget,
  utils,

  Button,
  SimpleMarkerSymbol,
  Point,
  Graphic,
  GraphicsLayer,
  Color,
  on,
  lang
  ) {
  //ウィジェットを作成するには、BaseWidget モジュールを拡張します
  return declare([BaseWidget], {

    name: 'RandomPoints',
    baseClass: 'jimu-widget-randompoints',

    postCreate: function() {
      console.log("postCreate!");
      this.inherited(arguments);
      this.addPointsButton = new Button({
        label: "ポイントの追加"
      }).placeAt(this.createPointIdNode);
      this.addPointsButton.startup();
    },

    startup: function() {
      console.log("startup!");
      this.layer = new GraphicsLayer({
        dataAttributes:["id"]
      });
      if (this.layer.surfaceType === "svg") {
        on(this.layer, "graphic-draw", function (evt) {
            console.log("graphic-draw");
            var renderercategory;
            renderercategory = "random";
            evt.node.setAttribute("data-uniquevalue", renderercategory);
        });
      }
      this.map.addLayer(this.layer);

      on(this.addPointsButton, "click", lang.hitch(this, "createPoint"));
      console.log("this.map: ", this.map);
    },

    createPoint: function() {
      console.log("createPoint!");
      var sympath = "M1,1v30h30V1H1zM17.326,24.398c0,2.92-1.712,4.248-4.209,4.248c-2.255,0-3.564-1.168-4.229-2.576l0,0l0,0l0,0l2.296-1.391c0.443,0.777,0.846,1.442,1.812,1.442c0.926,0,1.511-0.354,1.511-1.771V14.77h2.819V24.398zM23.992,28.646c-2.618,0-4.311-1.248-5.135-2.879l2.295-1.328c0.604,0.979,1.39,1.711,2.779,1.711c1.168,0,1.904-0.584,1.904-1.396c0-0.966-0.766-1.311-2.054-1.865L23.08,22.58c-2.034-0.865-3.383-1.953-3.383-4.249c0-2.114,1.604-3.726,4.128-3.726c1.792,0,3.081,0.625,4.008,2.254l-2.19,1.406c-0.479-0.861-1.006-1.209-1.812-1.209c-0.825,0-1.353,0.521-1.353,1.209c0,0.852,0.521,1.188,1.729,1.711l0.704,0.309c2.396,1.021,3.746,2.07,3.746,4.43C28.664,27.259,26.671,28.646,23.992,28.646z";
      var symcolor = "#5603ff";
      var sym = new SimpleMarkerSymbol();
      sym.setPath(sympath);
      sym.setColor(new Color(symcolor));
      sym.setOutline(null);
      sym.setSize("32");
      var attr = {"id":"random"};
      var ext = this.map.extent;
      var width = ext.xmax - ext.xmin;
      var height = ext.ymax - ext.ymin;
      var randx = (Math.random() * width) + ext.xmin;
      var randy = (Math.random() * height) + ext.ymin;
      var pt = new Point(randx, randy, this.map.spatialReference);
      this.layer.add(new Graphic(pt, sym, attr));
    }
  });

});
