define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  "jimu/dijit/Message",

  "esri/arcgis/utils",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/dom-style",
  "dojo/dom",

  "esri/layers/GraphicsLayer",
  "esri/graphic",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/Color",

  'dojo/_base/query',
  'dojo/_base/html',
  "dijit/form/Select",
], function(
  declare,
  BaseWidget,
  //_WidgetsInTemplateMixin,
  Message,

  arcgisUtils,
  array,
  lang,
  on,
  domStyle,
  dom,

  GraphicsLayer,
  Graphic,
  SimpleLineSymbol,
  SimpleMarkerSymbol,
  Color,

  query,
  html,
  Select
) {
  var clazz = declare([BaseWidget], {
    name: 'StatusMonitoring',
    baseClass: 'jimu-widget-statusmonitoring',

    postCreate: function() {
      //this.inherited(arguments);
      console.log('StatusMonitoring: postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      console.log('StatusMonitoring: startup');

      var map = this.map;

      // 追跡フィーチャ リスト
      var options = [];
      var initOption = { value: -1, label: "なし"};
      options.push(initOption);
      this.select = new Select({name: "TrackingSelect"});
      this.select.placeAt(this.selectDiv);
      this.select.addOption(options);
      this.select.startup();

      on(this.select, "Change", lang.hitch(this, "_onChangeTrackingTarget"));

      // 追跡用
      this.trackingGeometryStore = null;
      this.highlightSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 45,
        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
        new Color([255,0,0,0.4]), 5),
        new Color([0,0,0,0]));
      this.highlightLayer = new GraphicsLayer({id: "target_highlight"});
      map.addLayer(this.highlightLayer);

      this.trindex = 0;
      this.targetFieldHasCodedValue = true;

      // 設定情報の取得
      var json = this.config.statusMonitoring;
      console.log(json);
      var targetLayerId = json.targetLayerId;
      var targetFieldId = json.targetFieldId;
      var targetIdentifiedFieldId = json.targetIdentifiedFieldId;
      this.viewMessage = json.viewMessage;

      if(targetLayerId) {
        // 監視対象レイヤー
        this.targetLayer = map.getLayer(targetLayerId);
        this.targetLayerName.innerHTML = this.targetLayer.name;
        //this.targetLayer = targetLayer;        
        console.log(this.targetLayer);

        if(this.targetLayer.geometryType !== "esriGeometryPoint") {
          html.style(query(".select-tracking-container")[0], "display", "none");
        }

        // 監視対象レイヤーのグラフィック描画イベント
        this.targetLayer.on("graphic-draw", lang.hitch(this, "_onGetTargetFeature"));

        // 名前属性情報の取得
        this.targetIdentifiedField = this.targetLayer.fields[targetIdentifiedFieldId];
        var targetIdentifiedFieldName = this.targetIdentifiedField.name;

        // ドメイン情報の取得
        this.targetField = this.targetLayer.fields[targetFieldId];
        this.targetFieldName.innerHTML = this.targetField.alias;
        var targetField = this.targetField;
        if(!targetField.domain) {
          this.targetFieldHasCodedValue = false;
        }

        // 監視対象属性フィールドの初期値取得
        var store = [];
        array.forEach(this.targetLayer.graphics, function(g) {
          var attr = {
            "OBJECTID": g.attributes["OBJECTID"],
            "STATUS": g.attributes[targetField.name]
          };
          store[attr["OBJECTID"]] = attr;

          var option =  { value: g.attributes["OBJECTID"], label: g.attributes[targetIdentifiedFieldName] };
          options.push(option);
        });
        this.targetAttributesStore = store;
        this.select.set("options", options).reset();
      }
    },

    _onGetTargetFeature: function(evt) {
      console.log("StatusMonitoring: _onGetTargetFeature");
      // 属性監視用
      var targetFeature = evt.graphic;
      var targetLayerName = this.targetLayer.name;
      var targetField = this.targetField;
      var targetIdentifiedFieldName = this.targetIdentifiedField.name;
      var store = this.targetAttributesStore;

      // 監視対象属性の更新判定
      if(store[targetFeature.attributes["OBJECTID"]]["STATUS"] !== targetFeature.attributes[targetField.name]) {
        var prev, now;
        if(this.targetFieldHasCodedValue === true) {
          array.forEach(targetField.domain.codedValues, function(value) {
            if(targetFeature.attributes[targetField.name] == value.code) {
              now = value.name;
            }
            if(store[targetFeature.attributes["OBJECTID"]]["STATUS"] == value.code) {
              prev = value.name;
            }
          });
        }
        else {
          now = targetFeature.attributes[targetField.name];
          prev = store[targetFeature.attributes["OBJECTID"]]["STATUS"];
        }
        if(this.viewMessage === true) {
          new Message({
            message: targetLayerName + ": " + targetFeature.attributes[targetIdentifiedFieldName] + "のステータスが [" + prev + "] から [" + now + "] に変更されました"
          });
        }
        store[targetFeature.attributes["OBJECTID"]]["STATUS"] = targetFeature.attributes[targetField.name];

        // フィード更新
        var strTr = '<tr class="jimu-table-row">' +
        '<td class="first-td"></td>' +
        '<td class="second-td">' +
          '<div class="statusmonitoring-name-div"></div>' +
        '</td>' +
        '<td class="third-td">' +
          '<div class="statusmonitoring-content-div"></div>' +
        '</td>' +
        '<td class="fourth-td"></td>' +
        '</tr>';
        var tr = html.toDom(strTr);
        var smNameDiv = query(".statusmonitoring-name-div", tr)[0];
        smNameDiv.innerHTML = targetFeature.attributes[targetIdentifiedFieldName];
        var smContentDiv = query(".statusmonitoring-content-div", tr)[0];
        smContentDiv.innerHTML = "ステータスが [" + prev + "] から [" + now + "] に変更されました";
        html.place(tr, this.statusNews, "first");
        html.addClass(tr, 'even');
        //tr.singleConfig = singleConfig;
        if(this.trindex % 2 === 0){
          html.addClass(tr, 'even');
        }
        else{
          html.addClass(tr, 'odd');
        }
        this.trindex += 1;
        this.targetAttributesStore = store;
      }

      // 追跡
      if(targetFeature.attributes["OBJECTID"] === this.select.value) {
        if(this.trackingGeometryStore.x !== targetFeature.geometry.x || this.trackingGeometryStore.y !== targetFeature.geometry.y) {
          console.log("追跡");
          this.trackingGeometryStore = targetFeature.geometry;
          this.map.centerAt(targetFeature.geometry);
          var highlightFeature = new Graphic(targetFeature.geometry, this.highlightSymbol);
          this.highlightLayer.clear();
          console.log("highlightFeature", highlightFeature);
          this.highlightLayer.add(highlightFeature);
        }
      }
    },

    _onChangeTrackingTarget: function(value) {
      console.log('StatusMonitoring: _onChangeTrackingTarget', value);
      var map = this.map;
      var highlightLayer = this.highlightLayer;
      var highlightSymbol = this.highlightSymbol;
      var trackingGeometryStore = this.trackingGeometryStore;
      array.forEach(this.targetLayer.graphics, function(g) {
        if(value !== -1) {
          if(g.attributes["OBJECTID"] === value) {
            trackingGeometryStore = g.geometry;
            map.centerAt(g.geometry);
            var highlightFeature = new Graphic(g.geometry, highlightSymbol);
            highlightLayer.clear();
            console.log("highlightFeature", highlightFeature);
            highlightLayer.add(highlightFeature);
          }
        }
        else {
          trackingGeometryStore = null;
          highlightLayer.clear();
        }
      });
      this.trackingGeometryStore = trackingGeometryStore;
    },

    onOpen: function(evt){
      console.log('StatusMonitoring: onOpen');
      var targetIdentifiedFieldName = this.targetIdentifiedField.name;
      var select = this.select;
      var updateOptions = [{ value: -1, label: "なし" }];
      array.forEach(this.targetLayer.graphics, function(g, i) {
        var option = { value: g.attributes["OBJECTID"], label: g.attributes[targetIdentifiedFieldName] };
        updateOptions.push(option);
        select.addOption([option]);
      });
      this.select = select;
      this.select.set("options", updateOptions).reset();
    },

    onClose: function(evt){
      console.log('StatusMonitoring: onClose');
    }
  });
  return clazz;
});
