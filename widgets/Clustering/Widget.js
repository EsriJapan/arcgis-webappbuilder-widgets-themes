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
  'dojo/_base/array',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/renderers/ClassBreaksRenderer',
  'esri/Color',
  './clusterfeaturelayer'
], function(declare, BaseWidget, array, SimpleMarkerSymbol, SimpleLineSymbol, ClassBreaksRenderer, Color, ClusterLayer) {
  return declare([BaseWidget], {
    name: 'Clustering',
    baseClass: 'jimu-widget-clustering',
    clusterLayer: null,

    postCreate: function() {
      this.inherited(arguments);

      // 選択レイヤーID
      var id;
      // マップ
      var map = this.map;
      // 設定情報
      var json = this.config.clustering;
      // 設定１:選択レイヤー（タイトル）
      var title = json.selectLayer;

      // マップの操作レイヤー
      var layers = map.itemInfo.itemData.operationalLayers;
      array.some(layers, function(layer) {
        if (layer.title === title) {
          id = layer.id;
          return true;
        } else {
          return false;
        }
      });

      // 選択レイヤーがマップ上に存在する場合
      if (id) {
        // 選択レイヤーIDからレイヤーを取得
        var selectedLayer = map.getLayer(id);
        this.selectedLayer = selectedLayer;
        // クラスターレイヤーの作成
        if (!this.clusterLayer) {
          this.clusterLayer = new ClusterLayer({
             title: 'クラスター表示: ' + title,
             url: map.getLayer(id).url,
             distance: json.clusterSize, // 設定２:クラスター集計範囲
             id: 'cluster',
             labelColor: json.labelColor, // 設定４:ラベル色
             resolution: map.extent.getWidth() / map.width,
             useDefaultSymbol: true,
             zoomOnClick: true,
             showSingles: true,
             where: map.getLayer(id).defaultDefinitionExpression
          });

          // 設定３:シンボル色
          var lineColor = new Color([json.symbolColor.r, json.symbolColor.g, json.symbolColor.b, 0.35]);
          var markerColor = new Color([json.symbolColor.r, json.symbolColor.g, json.symbolColor.b, 0.75]);
          var symbol = new SimpleMarkerSymbol('circle', 25,
                       new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                       markerColor);

          // レンダラー（ポイント数に応じて数値分類）
          var renderer = new ClassBreaksRenderer(symbol, 'clusterCount');

          var small = new SimpleMarkerSymbol('circle', 25,
                      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                      markerColor);
          var medium = new SimpleMarkerSymbol('circle', 50,
                      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                      markerColor);
          var large = new SimpleMarkerSymbol('circle', 80,
                      new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                      markerColor);
          var xlarge = new SimpleMarkerSymbol('circle', 110,
                       new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 15),
                       markerColor);

          renderer.addBreak(2, 10, small);
          renderer.addBreak(10, 25, medium);
          renderer.addBreak(25, 100, large);
          renderer.addBreak(100, Infinity, xlarge);

          this.clusterLayer.setRenderer(renderer);
        }
      }
    },

    onOpen: function() {
      this.map.addLayer(this.clusterLayer);
      //this.map.itemInfo.itemData.operationalLayers.push(clusterLayer);
    },

    onClose: function() {
      this.map.removeLayer(this.map.getLayer('cluster'));
    }
  });
});