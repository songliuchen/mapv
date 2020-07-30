/**
 * @enum Unit
 * @memberOf SuperMap
 * @description  距离单位枚举。
 * 该类定义了一系列距离单位类型。
 * @type {string}
 */
var Unit = {
    /**  米 */
    METER: "METER",
    /**  千米 */
    KILOMETER: "KILOMETER",
    /**  英里 */
    MILE: "MILE",
    /**  码 */
    YARD: "YARD",
    /**  度 */
    DEGREE: "DEGREE",
    /**  毫米 */
    MILLIMETER: "MILLIMETER",
    /**  厘米 */
    CENTIMETER: "CENTIMETER",
    /**  英寸 */
    INCH: "INCH",
    /**  分米 */
    DECIMETER: "DECIMETER",
    /**  英尺 */
    FOOT: "FOOT",
    /**  秒 */
    SECOND: "SECOND",
    /**  分 */
    MINUTE: "MINUTE",
    /**  弧度 */
    RADIAN: "RADIAN"
};
export {
    Unit
}

var getMeterPerMapUnit = function (mapUnit) {
    var earchRadiusInMeters = 6378137;
    var meterPerMapUnit;
    if (mapUnit === Unit.METER) {
        meterPerMapUnit = 1;
    } else if (mapUnit === Unit.DEGREE) {
        // 每度表示多少米。
        meterPerMapUnit = (Math.PI * 2 * earchRadiusInMeters) / 360;
    } else if (mapUnit === Unit.KILOMETER) {
        meterPerMapUnit = 1.0e-3;
    } else if (mapUnit === Unit.INCH) {
        meterPerMapUnit = 1 / 2.5399999918e-2;
    } else if (mapUnit === Unit.FOOT) {
        meterPerMapUnit = 0.3048;
    } else {
        return meterPerMapUnit;
    }
    return meterPerMapUnit;
};

export {
    getMeterPerMapUnit
}

/**
     * 将图层添加到Map时调用
     */
var createUniqueID = function (prefix) {
    if (prefix == null) {
        prefix = "id_";
    }
    return prefix + Date.parse(new Date());
};

export {
    createUniqueID
}
