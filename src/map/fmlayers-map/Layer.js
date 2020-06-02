import BaseLayer from "../BaseLayer";
import OpenLayer from "./OpenLayer";
import clear from "../../canvas/clear";
import DataSet from "../../data/DataSet";
import TWEEN from "../../utils/Tween";

class Layer extends BaseLayer
{
  constructor (map = null, dataSet, options) {
    super(map, dataSet, options);
    this.options = options;
    this.inner = new OpenLayer(map,dataSet,options,this);
  }

  getContext() {
    return this.canvasLayer.canvas.getContext(this.context);
  }
}

export default Layer
