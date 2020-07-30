import OpenLayers from "./openlayer/OpenLayers";
import MapBoxLayers from "./mapbox/MapBoxLayers";
class Layer {
  constructor(map = null, dataSet, options) {
    if (map.mapParam && map.mapParam.strategy && map.mapParam.strategy.length > 0) {
      this.pmap = map.pmap;
      if (map.mapParam.strategy[0] == "openlayers")
        this.player = new OpenLayers(this.pmap, dataSet, options);
      else if (map.mapParam.strategy[0] == "mapboxgl") {
        this.player = new MapBoxLayers(this.pmap, dataSet, options);
        map.pmap.addLayer(this.player);
        // map.pmap.addImage('pulsing-dot', this.player, { pixelRatio: 1.25 });
      } else
        throw "不支持的地图类型"
    }
    else {
      throw "不支持的地图类型"
    }
  }

  setDefaultCursor(cursor, feature) {
    this.player.setDefaultCursor(cursor, feature);
  }
}

export default Layer
