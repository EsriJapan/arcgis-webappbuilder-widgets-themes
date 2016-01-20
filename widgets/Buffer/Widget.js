//>>built
define(['dojo/_base/declare', 'jimu/BaseWidget',
"esri/geometry/geometryEngine", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/graphic", "esri/tasks/query", "esri/symbols/SimpleMarkerSymbol", "dijit/form/Select"
],
function (declare, BaseWidget, geometryEngine, SimpleFillSymbol, SimpleLineSymbol, Color, Graphic, Query, SimpleMarkerSymbol, Select
	) {
var clazz = declare([BaseWidget], {baseClass: 'jimu-widget-Buffer',
ckickfunction:null,
layerlist:null,
//ウィジェットが開かれたとき
onOpen: function() {

this.inherited(arguments);
var distanceNode = this.inputNode;
var json = this.config.measurement;
//マップコンストラクタを取得
var map = this.map;
this.ckickfunction = this.map.on("click", clickHandler);
//マップ上のレイヤーを取得し、レイヤー一覧をselectlayerに表示
if (!this.layerlist){
	this.layerlist = Select({name: "select"}, "selectlayer");
	for(var j = 0; j < map.graphicsLayerIds.length; j++) {
    	var addlayer = map.getLayer(map.graphicsLayerIds[j]);
    	option = { value: addlayer.id, label: addlayer.name, selected: true };
    	this.layerlist.addOption([option]);
	}
	layerStr = this.layerlist.get("value");
	this.layerlist.startup();
}
// selectlayerで選択レイヤーを変更したとき
this.layerlist.on("change", function(){
    layerStr = this.get("value");
})

//マップ上をクリック
function clickHandler(evt){
map.graphics.clear();
//inputNodeの値を取得
distance = distanceNode.value;
//バッファー用のジオメトリを作成
//半径の単位をconfig.jsonから取得
var bufferGeometry = geometryEngine.buffer(evt.mapPoint, distance, json.LengthUnit);
//Graphicを作成しGraphicsLayerに追加
var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255,0,0]), 2),new Color([255,255,0,0.25]));
var graphic = new Graphic(bufferGeometry, sfs);
map.graphics.add(graphic);

//バッファー検索
var query = new Query();
query.geometry = graphic.geometry;
query.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
//マップ上からレイヤーIDを指定してフィーチャレイヤーを取得
var layer = map.getLayer(layerStr); 
//フィーチャレイヤーに対してクエリ
layer.queryFeatures(query).then(function(featureSet){
   var resultGraphics = featureSet.features;
   for (var i=0; i<resultGraphics.length; i++) {
   	//ポイント、ライン、ポリゴンごとにシンボル設定
   		if (layer.geometryType == "esriGeometryPoint"){
      		var highlightSymbol = new esri.symbol.SimpleMarkerSymbol();
      		highlightSymbol.setColor(new Color("#f00"));
      	} else if (layer.geometryType == "esriGeometryPolygon"){
      		var highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 3), new Color([125,125,125,0.5]));
      	} else {
      		var highlightSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0,0.5]), 6);
      	} 
      	//クエリ結果のGraphicをGraphicsLayerに追加
      	var queryGraphic = new Graphic(resultGraphics[i].geometry, highlightSymbol);
      	map.graphics.add(queryGraphic);
   };
});
}
},
//パネルを閉じたときにGraphicsLayerからGraphicを削除
onClose: function(){
      this.map.graphics.clear();
      this.ckickfunction.remove();
},

});
return clazz;
});