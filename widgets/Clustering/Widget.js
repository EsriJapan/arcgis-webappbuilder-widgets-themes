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

  "esri/arcgis/utils",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/dom-style",
  "dojo/dom",

  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/renderers/ClassBreaksRenderer",
  "esri/Color",

  "./clusterfeaturelayer",

  "dijit/form/Select",
], function(
  declare,
  BaseWidget,
  //_WidgetsInTemplateMixin,

  arcgisUtils,
  array,
  lang,
  on,
  domStyle,
  dom,

  SimpleMarkerSymbol,
  SimpleLineSymbol,
  ClassBreaksRenderer,
  Color,

  ClusterLayer,

  Select
) {
  var clazz = declare([BaseWidget], {
    name: 'Clustering',
    baseClass: 'jimu-widget-clustering',

    postCreate: function() {
      //this.inherited(arguments);
      console.log('postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      console.log('startup');

      // 選択レイヤーID
      var id;
      // マップ
      var map = this.map;
      // 設定情報
      var json = this.config.clustering;
      console.log(json);
      // 設定１:選択レイヤー（タイトル）
      var title = json.selectLayer;
      console.log("selected layer title: ", title);

      // マップの操作レイヤー
      var layers = map.itemInfo.itemData.operationalLayers;
      array.some(layers, function(layer) {
        if(layer.title === title){
          id = layer.id;
          return true;
        } else {
          return false;
        }
      });
      console.log("selected layer id: ", id);

      var self = this;
      // クラスタレイヤー
      var clusterLayer;

      // 選択レイヤーがマップ上に存在する場合
      if(id){
        // 選択レイヤーIDからレイヤーを取得
        var selectedLayer = map.getLayer(id);
        this.selectedLayer = selectedLayer;
        // クラスターレイヤーの作成
        if(!clusterLayer) {
          console.log("creating clusterlayer!");
          clusterLayer = new ClusterLayer({
             title: "クラスター表示: " + title,
             url: map.getLayer(id).url,
             distance: json.clusterSize, // 設定２:クラスター集計範囲
             id: "cluster",
             labelColor: json.labelColor, // 設定４:ラベル色
             resolution: map.extent.getWidth() / map.width,
             useDefaultSymbol: true,
             zoomOnClick: true,
             showSingles: true,
             where: map.getLayer(id).defaultDefinitionExpression
          });

          // 設定３:シンボル色
          var lineColor = new Color([json.symbolColor.r,json.symbolColor.g,json.symbolColor.b,0.35]);
          var markerColor = new Color([json.symbolColor.r,json.symbolColor.g,json.symbolColor.b,0.75]);
          var symbol = new SimpleMarkerSymbol("circle", 25,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
            markerColor);

          var renderer = new ClassBreaksRenderer(symbol, 'clusterCount');

          small = new SimpleMarkerSymbol('circle', 25,
                      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                      markerColor);
          medium = new SimpleMarkerSymbol('circle', 50,
                      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                      markerColor);
          large = new SimpleMarkerSymbol('circle', 80,
                      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                      markerColor);
          xlarge = new SimpleMarkerSymbol('circle', 110,
                      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                      markerColor);

          renderer.addBreak(2, 10, small);
          renderer.addBreak(10, 25, medium);
          renderer.addBreak(25, 100, large);
          renderer.addBreak(100, Infinity, xlarge);

          clusterLayer.setRenderer(renderer);

          map.addLayer(clusterLayer);
          this.clusterLayer = clusterLayer;



          console.log("map: ", map);
          console.log("this.map: ", this.map);
          //this.map = map;
          //console.log(map);
          //map.itemInfo.itemData.operationalLayers.push(clusterLayer);
        }
        else {
          //this.clusterLayer.show();
        }

      }
    },

    onOpen: function(evt){
      console.log('onOpen');
    },

    onClose: function(evt){
      console.log('onClose');
      // マップからクラスターレイヤーを除外
      this.map.removeLayer(this.map.getLayer("cluster"));
      //this.map.itemData.oprationalLayers.push(clusterLayer);
    }
  });
  return clazz;
});
