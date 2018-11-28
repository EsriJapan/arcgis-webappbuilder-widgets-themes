define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'jimu/BaseWidget',
  'jimu/LayerStructure',
  'esri/geometry/geometryEngine',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/Color',
  'esri/graphic',
  'esri/tasks/query',
  'dijit/form/Select'
], function(declare, lang, BaseWidget, LayerStructure, geometryEngine, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, Graphic, Query, Select) {
  return declare([BaseWidget], {
    baseClass: 'jimu-widget-buffer',

    ckickfunction: null,
    layerList: null,
    layerId: null,

    // スタートアップ時に実行されるメソッド
    startup: function() {
      this.inherited(arguments);

      // マップ上のレイヤーを取得し、レイヤー一覧を作成
      var options = [];
      var layerStructure = LayerStructure.getInstance();
      layerStructure.traversal(function(layerNode) {
        layerNode.getLayerType()
          .then(function(type) {
            if (type === 'FeatureLayer') {
              var option = {
                value: layerNode.id,
                label: layerNode.title
              };
              options.push(option);
            }
          })
          .catch(function(err) {
            console.log(err);
          });
      });

      this.layerList = new Select({
        options: options
      }, this.layerSelectNode);
      this.layerList.startup();

      // レイヤー一覧を変更したときのイベント
      this.layerList.on("change", lang.hitch(this, function(val) {
        this.layerId = val;
      }));
    },

    // ウィジェットのパネルを開くときに実行されるメソッド
    onOpen: function() {
      this.inherited(arguments);

      // マップをクリックしたときのイベント ハンドラ
      this.ckickfunction = this.map.on("click", lang.hitch(this, this._clickHandler));
    },

    // ウィジェットのパネルを閉じるときに実行されるメソッド
    onClose: function() {
      this.inherited(arguments);

      // マップに表示されているグラフィックを削除
      this.map.graphics.clear();

      // マップのクリック イベントを削除
      this.ckickfunction.remove();
    },

    // マップのクリック イベント
    _clickHandler: function(evt) {
      // マップ コンストラクタを取得
      var map = this.map;

      // マップに表示されているグラフィックを削除
      map.graphics.clear();

      // inputNode に入力された半径の値を取得
      var distance = this.inputNode.value;

      // ウィジェット構成時に設定した半径の単位を config.json から取得
      var unit = this.config.measurement.LengthUnit;

      // クリック地点から指定した半径のバッファーを作成
      var bufferGeometry = geometryEngine.buffer(evt.mapPoint, distance, unit);
      // 作成したバッファーをマップに表示
      var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2),
        new Color([255, 255, 0, 0.25]));
      var graphic = new Graphic(bufferGeometry, sfs);
      map.graphics.add(graphic);

      // バッファー内のフィーチャを検索
      var query = new Query();
      query.geometry = graphic.geometry;
      query.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
      // マップからレイヤー ID を指定してフィーチャ レイヤーを取得
      var layer = map.getLayer(this.layerId);
      // フィーチャ レイヤーに対してクエリを実行
      layer.queryFeatures(query)
        .then(function(featureSet) {
          // ポイント、ライン、ポリゴンごとにシンボルを設定
          var highlightSymbol;
          if (layer.geometryType == "esriGeometryPoint") {
            highlightSymbol = new SimpleMarkerSymbol();
            highlightSymbol.setColor(new Color("#f00"));
            highlightSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 16,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1),
              new Color([255, 0, 0, 0.5]));
          } else if (layer.geometryType == "esriGeometryPolyline") {
            highlightSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0, 0.5]), 6);
          } else {
            highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 3),
              new Color([125, 125, 125, 0.5]));
          }
          // 結果を表示
          featureSet.features.forEach(function(feature) {
            var queryGraphic = new Graphic(feature.geometry, highlightSymbol);
            map.graphics.add(queryGraphic);
          });
        });
    }
  });
});
