import OpenLayers from "./OpenLayers";
import MapBoxLayers from "./MapBoxLayers";
class Layer
{
  constructor (map = null, dataSet, options)
  {
    if(map.mapParam && map.mapParam.strategy && map.mapParam.strategy.length>0)
    {
      //openlayers
      if(map.mapParam.strategy[0] =="openlayers")
        this.player = new OpenLayers(map.pmap,dataSet,options);
      else if(map.mapParam.strategy[0] =="mapboxgl")
      {
        this.player = new MapBoxLayers(map.pmap,dataSet,options);
      }
    }
    else
    {
      throw "不支持的地图类型" 
    }
  }

  setDefaultCursor(cursor, feature)
  {
    this.player.setDefaultCursor(cursor,feature);
  }
}

export default Layer
