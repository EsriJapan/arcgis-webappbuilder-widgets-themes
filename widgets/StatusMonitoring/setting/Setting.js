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
    "dojo/_base/array",
    "jimu/dijit/Message"
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
    Select,
    array,
    Message
    ) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-statusmonitoring-setting',

      startup: function() {
        this.inherited(arguments);
        console.log('startup: ', this);

        if (!this.config.statusMonitoring) {
          this.config.statusMonitoring = {};
        }
        this.setConfig(this.config);
        // ウィジェット設定用イベントのバインド
        //this._bindEvents();
      },

      _bindEvents: function () {

      },

      _onChangeTargetLayer: function(value) {
        console.log("_onChangeTargetLayer", value);
        var targetLayer = this.map.getLayer(value);
        var updateOptions = [];
        var targetFieldSelect = this.targetFieldSelect;
        var targetIdentifiedFieldSelect = this.targetIdentifiedFieldSelect;
        array.forEach(targetLayer.fields, function(field, i) {
          var option = { value: i, label: field.alias };
          updateOptions.push(option);
          targetIdentifiedFieldSelect.addOption([option]);
        });
        this.targetFieldSelect = targetFieldSelect;
        this.targetIdentifiedFieldSelect = targetIdentifiedFieldSelect;
        this.targetFieldSelect.set("options", updateOptions).reset();
        this.targetIdentifiedFieldSelect.set("options", updateOptions).reset();
      },

      setConfig: function(config) {
        console.log("setconfig: ", config);
        console.log("this.config: ", this.config);

        this.viewMessage = true;

        if (!this.targetLayerSelect){
          // 選択レイヤー選択フォームの作成
          var layers = this.map.itemInfo.itemData.operationalLayers;
          if(layers.length === 0) {
            new Message({
              message: this.nls.messageNoMap
            });
          }

          this.targetLayerSelect = new Select({name: "Layer"});
          this.targetLayerSelect.placeAt(this.targetLayerOption);
          var targetLayerSelect = this.targetLayerSelect;
          console.log("this.map.itemInfo.itemData.operationalLayers", layers);
          array.forEach(layers, function(layer) {
            if(layer.layerType === "ArcGISFeatureLayer") {
              var option = { value: layer.id, label: layer.title };
              targetLayerSelect.addOption([option]);
            }
          });
          this.targetLayerSelect.startup();
          on(this.targetLayerSelect, "Change", lang.hitch(this, "_onChangeTargetLayer"));

          var targetLayer = this.map.getLayer(this.targetLayerSelect.value);
          if(!this.targetFieldSelect) {
            this.targetFieldSelect = new Select({name: "Field"});
            this.targetFieldSelect.placeAt(this.targetFieldOption);
            var targetFieldSelect = this.targetFieldSelect;
            array.forEach(targetLayer.fields, function(field, i) {
              var option = { value: i, label: field.alias };
              targetFieldSelect.addOption([option]);
            });
            this.targetFieldSelect.startup();
          }
          if(!this.targetIdentifiedFieldSelect) {
            this.targetIdentifiedFieldSelect = new Select({name: "IdentifiedField"});
            this.targetIdentifiedFieldSelect.placeAt(this.targetIdentifiedFieldOption);
            var targetIdentifiedFieldSelect = this.targetIdentifiedFieldSelect;
            array.forEach(targetLayer.fields, function(field, i) {
              var option = { value: i, label: field.alias };
              targetIdentifiedFieldSelect.addOption([option]);
            });
            this.targetIdentifiedFieldSelect.startup();
          }
        }
      },

      // 設定情報をWidget.jsに継承（this.config）
      getConfig: function() {
        this.config.statusMonitoring.targetLayerId = this.targetLayerSelect.value;
        this.config.statusMonitoring.targetFieldId = this.targetFieldSelect.value;
        this.config.statusMonitoring.targetIdentifiedFieldId = this.targetIdentifiedFieldSelect.value;
        this.config.statusMonitoring.viewMessage = this.viewMessage;
        
        console.log("getConfigValue: ", this.config);        
        
        return this.config;
      },

      _onCbxViewMessageClicked: function() {
        if(this.cbxViewMessage.checked){
          this.viewMessage = true;
        }
        else {
          this.viewMessage = false;
        }
      }

    });
  });