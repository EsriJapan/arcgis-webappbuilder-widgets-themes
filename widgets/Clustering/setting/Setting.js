define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'jimu/BaseWidgetSetting',
    "dijit/_WidgetsInTemplateMixin",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/on",
    "dojo/dom-attr",
    "dijit/form/Select",

    'dijit/form/NumberSpinner',
    'dijit/form/NumberTextBox',
    'jimu/dijit/ColorPicker'
  ],
  function(
    declare,
    lang,
    BaseWidgetSetting,
    _WidgetsInTemplateMixin,
    domConstruct,
    dom,
    on,
    domAttr,
    Select
    ) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-clustering-setting',

      startup: function() {
        this.inherited(arguments);
        console.log('startup: ', this);

        if (!this.config.clustering) {
          this.config.clustering = {};
        }
        this.setConfig(this.config);
        // ウィジェット設定用イベントのバインド
        this._bindEvents();
      },

      _bindEvents: function () {
        // クラスター シンボル色の変更
        this.own(on(this.colorPickerCluster, 'Change', lang.hitch(this, '_onColorChange')));
        // クラスター ラベル色の変更
        this.own(on(this.colorPickerClusterLabel, 'Change', lang.hitch(this, '_onLabelColorChange')));
      },

      _onColorChange: function(e) {
        console.log("_onColorChange: ", e);
        var circleColor = "rgb(" + e.r + "," + e.g + "," + e.b + ")";
        domAttr.set("cluster_circle_colorcheck", "fill", circleColor);
        domAttr.set("cluster_circle_colorcheck", "stroke", circleColor);
      },

      _onLabelColorChange: function(e) {
        console.log("_onColorChange: ", e);
        var circleColor = "rgb(" + e.r + "," + e.g + "," + e.b + ")";
        domAttr.set("cluster_text_colorcheck", "fill", circleColor);
      },

      setConfig: function(config) {
        console.log("setconfig: ", config);
        console.log("this.config: ", this.config);

        if (!this.select){
          // 選択レイヤー選択フォームの作成
          var layers = this.map.itemInfo.itemData.operationalLayers;
          this.select = new Select({name: "layer"}, "option");
          console.log("this.map.itemInfo.itemData.operationalLayers", layers);
          for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            // ポイント ジオメトリのレイヤーのみ対象
            if(layer.layerObject) {
              console.log("layertype: ", layer.layerObject.geometryType);
              if(layer.layerObject.geometryType === "esriGeometryPoint") {
                var layerTitle = layer.title;
                var option = { value: layerTitle, label: layerTitle};
                this.select.addOption([option]);
              }
            }
          }
          this.select.startup();
        }
      },

      // 設定情報をWidget.jsに継承（this.config）
      getConfig: function() {
        console.log("this.title: ", this.select.value);
        // 色情報のオブジェクトをHex化
        //var color = this.colorPickerCluster.getColor().toHex();
        var color = this.colorPickerCluster.getColor();
        var labelColor = this.colorPickerClusterLabel.getColor();
        console.log("getColor: ", this.colorPickerCluster.getColor());

        // 選択レイヤー
        this.config.clustering.selectLayer = this.select.value;
        // クラスター集計範囲の大きさ（px） 
        this.config.clustering.clusterSize = this.spinnerCluster.value;
        // シンボル色
        this.config.clustering.symbolColor = color;
        // ラベル色
        this.config.clustering.labelColor = labelColor;
        
        console.log("getConfigValue: ", this.config);        
        
        return this.config;
      }

    });
  });