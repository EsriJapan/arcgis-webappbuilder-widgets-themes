///////////////////////////////////////////////////////////////////////////
// Copyright c 2014 Esri. All Rights Reserved.
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
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidgetSetting',
  'esri/units',
  'dijit/form/Select'
], function(declare, _WidgetsInTemplateMixin, BaseWidgetSetting, esriUnits) {
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-buffer-setting',

    startup: function() {
      this.inherited(arguments);

      if (!this.config.measurement) {
        this.config.measurement = {};
      }
      this.setConfig(this.config);
    },

    setConfig: function(config) {
      this.config = config;
      if (this.config.measurement.LengthUnit) {
        this.selectLengthUnit.set('value', this.config.measurement.LengthUnit);
      } else {
        // デフォルトで表示される単位をキロメートルに設定
        this.selectLengthUnit.set('value', 'kilometers');
        this.config.measurement.UnitLabel = 'キロメートル';
      }
    },

    getConfig: function() {
      // ユーザーが単位を変更した時に config.json にその値を格納
      this.config.measurement.LengthUnit = this.selectLengthUnit.value;
      // ウィジェットのパネルに表示する単位ラベルに使用
      if (this.config.measurement.LengthUnit === 'kilometers') {
        this.config.measurement.UnitLabel = 'キロメートル';
      } else {
        this.config.measurement.UnitLabel = 'メートル';
      }
      return this.config;
    }
  });
});
