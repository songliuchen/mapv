/**
 * @author sakitam-fdd - https://github.com/sakitam-fdd
 */

import BaseLayer from "../BaseLayer";
import clear from "../../canvas/clear";
import DataSet from "../../data/DataSet";

/**
 * create canvas
 * @param width
 * @param height
 * @returns {HTMLCanvasElement}
 */
const createCanvas = (width, height) => {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = width;
    canvas.height = height;
    return canvas;
  } else {
    return this.$Map.getCanvas()
    // create a new canvas instance in node.js
    // the canvas class needs to have a default constructor without any parameter
  }
}

class MapBoxLayers extends BaseLayer {
  constructor(map = null, dataSet, options) {
    super(map, dataSet, options);
    this.dataSet = dataSet;
    this.options = options;
    //解决openlayer不兼容，事件中this对象不能指定的问题
    window._innerLayer = this;
    /**
     * internal
     * @type {{canvas: null, devicePixelRatio: number}}
     */
    this.canvasLayer = {
      canvas: null,
      devicePixelRatio: window.devicePixelRatio
    }

    /**
     * cavnas layer
     * @type {null}
     * @private
     */
    this.layer_ = null;

    /**
     * previous cursor
     * @type {undefined}
     * @private
     */
    this.previousCursor_ = undefined

    this.init(map, options);
    this.argCheck(options);
  }

  /**
   * init mapv layer
   * @param map
   * @param options
   */
  init(map, options) {
    if (map && map instanceof mapboxgl.Map) {

      this.$Map = map;
      this.context = this.options.context || '2d';
      this.getCanvasLayer();
      this.initDataRange(options);
      this.initAnimator();
      this.onEvents()
    } else {
      throw new Error('not map object')
    }
  }

  /**
   * update layer
   * @param time
   * @private
   */
  _canvasUpdate(time) {
    this.render(this.canvasLayer.canvas, time);
  }

  /**
   * render layer
   * @param canvas
   * @param time
   * @returns {Layer}
   */
  render(canvas, time) {
    const map = this.$Map;
    const context = canvas.getContext(this.context);
    const animationOptions = this.options.animation;
    const _projection = this.options.hasOwnProperty('projection') ? this.options.projection : 'EPSG:4326';
    if (this.isEnabledTime()) {
      if (time === undefined) {
        clear(context);
        return this;
      }
      if (this.context === '2d') {
        context.save();
        context.globalCompositeOperation = 'destination-out';
        context.fillStyle = 'rgba(0, 0, 0, .1)';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
      }
    } else {
      clear(context);
    }

    if (this.context === '2d') {
      for (const key in this.options) {
        context[key] = this.options[key];
      }
    } else {
      context.clear(context.COLOR_BUFFER_BIT);
    }
    const dataGetOptions = {
      transferCoordinate: function (coordinate) {
        return coordinate;
      }
    };

    // if (time !== undefined) {
    //   dataGetOptions.filter = function (item) {
    //     const trails = animationOptions.trails || 10;
    //     if (time && item.time > (time - trails) && item.time < time) {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   }
    // }

    const data = this.dataSet.get(dataGetOptions);
    this.processData(data);

    if (this.options.unit === 'm') {
      if (this.options.size) {
        this.options._size = this.options.size / zoomUnit;
      }
      if (this.options.width) {
        this.options._width = this.options.width / zoomUnit;
      }
      if (this.options.height) {
        this.options._height = this.options.height / zoomUnit;
      }
    } else {
      this.options._size = this.options.size;
      this.options._height = this.options.height;
      this.options._width = this.options.width;
    }

    this.drawContext(context, new DataSet(data), this.options, { x: 0, y: 0 });
    this.options.updateCallback && this.options.updateCallback(time);
    return this
  }

  /**
   * get canvas layer
   */
  getCanvasLayer() {
    if (!this.canvasLayer.canvas && !this.layer_) {
      this.getData();
      this.$Map.addImage('pulsing-dot', this.pulsingDot, { pixelRatio: 1.25 });

      this.features = [];
      this.dataSet._data.forEach(data => {
        const feature = {};
        feature.type = 'Feature';
        feature.geometry = data.geometry
        this.features.push(feature);
      });
      this.$Map.addSource('points', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': this.features
        }
      });
      this.layer_ = {
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
          'icon-image': 'pulsing-dot'
        }
      }
      this.$Map.addLayer(this.layer_);


      // this.$Map.on('wheel', this.canvasFunction);

    }
  }


  getData() {
    var map = this.$Map;
    var that = this;
    var size = 200;

    this.pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      // get rendering context for the map canvas when layer is added to the map
      onAdd: function () {
        var canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 187.5;
        that.canvasLayer.canvas = canvas;
        this.context = that.getContext();
        that.render(that.canvasLayer.canvas);
      },

      // called once before every frame where the icon will be used
      render: function () {
        // update this image's data with data from the canvas
        this.data = this.context.getImageData(
          0,
          0,
          this.width,
          this.height
        ).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
      }
    };
  }

  /**
   * re render
   */
  reRender() {
    if (!window._innerLayer.layer_) return;
    const extent = window._innerLayer.getMapExtent();
    window._innerLayer.layer_.setExtent(extent);
  }

  /**
   * canvas constructor
   * @param extent
   * @param resolution
   * @param pixelRatio
   * @param size
   * @param projection
   * @returns {*}
   */
  canvasFunction(extent, resolution, pixelRatio, size, projection) {
    if (!this.canvasLayer.canvas) {
      this.canvasLayer.canvas = createCanvas(size[0], size[1])
    } else {
      this.canvasLayer.canvas.width = size[0];
      this.canvasLayer.canvas.height = size[1];
    }
    this.render(this.canvasLayer.canvas);
    return this.canvasLayer.canvas
  }

  /**
   * get map current extent
   * @returns {Array}
   */
  getMapExtent() {
    return this.$Map.getBounds();;
  }

  /**
   * add layer to map
   * @param map
   */
  addTo(map) {
    this.init(map, this.options);
  }

  /**
   * remove layer
   */
  removeLayer() {
    if (!this.$Map) return;
    this.unEvents();
    this.$Map.removeLayer(this.layer_);
    delete this.$Map;
    delete this.layer_;
    delete this.canvasLayer.canvas;
  }

  getContext() {
    return this.canvasLayer.canvas.getContext(this.context);
  }

  /**
   * handle click event
   * @param event
   */
  clickEvent(event) {
    const pixel = event.pixel;
    super.clickEvent.apply(window._innerLayer, [{
      x: pixel[0],
      y: pixel[1]
    }, event]);
  }

  /**
   * handle mousemove/pointermove event
   * @param event
   */
  mousemoveEvent(event) {
    const pixel = event.pixel;
    super.mousemoveEvent.apply(window._innerLayer, [{
      x: pixel[0],
      y: pixel[1]
    }, event]);
  }

  /**
   * add animator event
   */
  addAnimatorEvent() {
    this.$Map.on('movestart', this.animatorMovestartEvent);
    this.$Map.on('moveend', this.animatorMoveendEvent);
  }

  /**
   * bind event
   */
  onEvents() {
    const map = this.$Map;
    this.unEvents();
    if (this.options.methods) {
      if (this.options.methods.click) {
        map.on('click', this.clickEvent);
      }
      if (this.options.methods.mousemove) {
        map.on('move', this.mousemoveEvent);
      }
    }
  }

  /**
   * unbind events
   */
  unEvents() {
    const map = this.$Map;
    if (this.options.methods) {
      if (this.options.methods.click) {
        map.off('click', this.clickEvent);
      }
      if (this.options.methods.pointermove) {
        map.off('move', this.mousemoveEvent);
      }
    }
  }

  animatorMovestartEvent() {
    super.animatorMovestartEvent.apply(window._innerLayer);
  }

  animatorMoveendEvent(event) {
    super.animatorMoveendEvent.apply(window._innerLayer);
  }
  /**
   * set map cursor
   * @param cursor
   * @param feature
   */
  setDefaultCursor(cursor, feature) {
    if (!this.$Map) return;
    const element = this.$Map.getTargetElement()
    if (feature) {
      if (element.style.cursor !== cursor) {
        this.previousCursor_ = element.style.cursor
        element.style.cursor = cursor
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_
      this.previousCursor_ = undefined
    }
  }
}

export default MapBoxLayers
