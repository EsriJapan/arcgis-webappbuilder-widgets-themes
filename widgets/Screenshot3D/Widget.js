define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "jimu/BaseWidget"
], function(declare, lang, BaseWidget) {
  return declare([BaseWidget], {
    baseClass: "custom-widget-screenshot3d",

    _dragHandler: null,
    _maskDiv: null,
    _selectedArea: null,
    _screenshot: null,

    startup: function() {
      this.inherited(arguments);
      this._maskDiv = this._createMaskElement();
    },

    onClose: function() {
      this._clear();
    },

    destroy() {
      this._clear();
      this._maskDiv.remove();
    },

    _clear() {
      if (this._dragHandler) {
        this._dragHandler.remove();
        this._dragHandler = null;
      }
      this.selectAreaButtonNode.classList.remove("active");
      this.sceneView.container.classList.remove("custom-widget-screenshot3d__screenshot-cursor");
      this._maskDiv.classList.add("custom-widget-screenshot3d__mask_hide");
      this._maskDiv.style.left = 0;
      this._maskDiv.style.top = 0;
      this._maskDiv.style.width = 0;
      this._maskDiv.style.height = 0;
      this.outputNode.classList.add("screenshot-hide");
    },

    _createMaskElement() {
      const div = document.createElement("div");
      div.classList.add("custom-widget-screenshot3d__mask");
      div.classList.add("custom-widget-screenshot3d__mask_hide");
      document.getElementById("main-page").appendChild(div);
      return div;
    },

    _onSelectArea: function() {
      if (!this._dragHandler) {
        this.selectAreaButtonNode.classList.add("active");
        this.sceneView.container.classList.add("custom-widget-screenshot3d__screenshot-cursor");
        this._maskDiv.classList.remove("custom-widget-screenshot3d__mask_hide");

        let selectedArea;

        this._dragHandler = this.sceneView.on("drag", lang.hitch(this, function(event) {
          event.stopPropagation();

          if (event.action !== "end") {
            const xmin = this._clamp(Math.min(event.origin.x, event.x), 0, this.sceneView.width);
            const xmax = this._clamp(Math.max(event.origin.x, event.x), 0, this.sceneView.width);
            const ymin = this._clamp(Math.min(event.origin.y, event.y), 0, this.sceneView.height);
            const ymax = this._clamp(Math.max(event.origin.y, event.y), 0, this.sceneView.height);
            selectedArea = {
              x: xmin,
              y: ymin,
              width: xmax - xmin,
              height: ymax - ymin
            };
            this._setMaskPosition(selectedArea);
          } else {
            const screenshotOptions = {
              area: selectedArea,
              format: this.selectNode.value
            };
            if (this.selectNode.value === "jpg") {
              screenshotOptions.quality = Number(this.numberNode.value);
            }
            this.sceneView.takeScreenshot(screenshotOptions)
              .then(lang.hitch(this, this._showPreview))
              .catch(this._err);
          }
        }));
      } else {
        this._clear();
      }
    },

    _clamp: function(value, from, to) {
      return value < from ? from : value > to ? to : value;
    },

    _setMaskPosition: function(area) {
      if (area) {
        this._maskDiv.style.left = area.x + "px";
        this._maskDiv.style.top = area.y + "px";
        this._maskDiv.style.width = area.width + "px";
        this._maskDiv.style.height = area.height + "px";
      }
    },

    _showPreview: function(screenshot) {
      this._screenshot = screenshot;
      this.outputNode.classList.remove("screenshot-hide");
      const screenshotImage = this.imageNode;
      screenshotImage.width = this._screenshot.data.width;
      screenshotImage.height = this._screenshot.data.height;
      screenshotImage.src = this._screenshot.dataUrl;
    },

    _onDownload: function() {
      const text = this.imageTextInput.value;
      const filename = this.sceneView.map.portalItem.title + "." + this.selectNode.value;
      if (text) {
        const dataUrl = this._getImageWithText(this._screenshot, text);
        this._downloadImage(filename, dataUrl);
      } else {
        this._downloadImage(filename, this._screenshot.dataUrl);
      }
    },

    _getImageWithText: function(screenshot, text) {
      const imageData = screenshot.data;

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = imageData.height;
      canvas.width = imageData.width;

      context.putImageData(imageData, 0, 0);
      context.font = "20px Meiryo";
      context.fillStyle="#000";
      context.fillRect(0, imageData.height - 40, context.measureText(text).width + 20, 30);

      context.fillStyle="#fff";
      context.fillText(text, 10, imageData.height - 20);

      return canvas.toDataURL();
    },

    _downloadImage: function(filename, dataUrl) {
      if (!window.navigator.msSaveOrOpenBlob) {
        const element = document.createElement("a");
        element.setAttribute("href", dataUrl);
        element.setAttribute("download", filename);
        element.style.display = "none";
        this.domNode.appendChild(element);
        element.click();
        this.domNode.removeChild(element);
      } else {
        const byteString = atob(dataUrl.split(",")[1]);
        const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], {type: mimeString});
        window.navigator.msSaveOrOpenBlob(blob, filename);
      }
    },

    _onFormatChange: function() {
      const disabled = this.selectNode.value === "png" ? true : false;
      this.numberNode.disabled = disabled;
    },

    _err(e) {
      console.log(e);
    }
  });
});
