import OpenLayers from "./OpenLayers";

class Layer
{
  constructor (map = null, dataSet, options)
  {
    this.inner = new OpenLayers(map.pmap,dataSet,options);
  }
}

export default Layer
