import OpenLayers from "./OpenLayers";

class Layer
{
  constructor (map = null, dataSet, options)
  {
    this.player = new OpenLayers(map.pmap,dataSet,options);
  }

  setDefaultCursor(cursor, feature)
  {
    this.player.setDefaultCursor(cursor,feature);
  }
}

export default Layer
