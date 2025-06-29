/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, PropertyValueType*/

$.__bodymovin.bm_keyframeBakerHelper = (function () {


    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
    var renderHelper = $.__bodymovin.bm_renderHelper;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    'use strict';
    var ob;
    var easePointsTemplates = (
        function() {
            var simple_in = {x:1,y:1};
            var array_1d_in = {x:[1],y:[1]};
            var array_2d_in = {x:[1,1],y:[1,1]};
            var array_3d_in = {x:[1,1,1],y:[1,1,1]};
            var templates;
            var inPointTemplate = {};
            inPointTemplate[PropertyValueType.ThreeD_SPATIAL] = simple_in;
            inPointTemplate[PropertyValueType.TwoD_SPATIAL] = simple_in;
            inPointTemplate[PropertyValueType.SHAPE] = simple_in;
            inPointTemplate[PropertyValueType.NO_VALUE] = simple_in;
            inPointTemplate[PropertyValueType.COLOR] = array_1d_in;
            inPointTemplate[PropertyValueType.OneD] = array_1d_in;
            inPointTemplate[PropertyValueType.TwoD] = array_2d_in;
            inPointTemplate[PropertyValueType.ThreeD] = array_3d_in;
            var simple_out = {x:0,y:0};
            var array_1d_out = {x:[0],y:[0]};
            var array_2d_out = {x:[0,0],y:[0,0]};
            var array_3d_out = {x:[0,0,0],y:[0,0,0]};
            var outPointTemplate = {};
            outPointTemplate[PropertyValueType.ThreeD_SPATIAL] = simple_out;
            outPointTemplate[PropertyValueType.TwoD_SPATIAL] = simple_out;
            outPointTemplate[PropertyValueType.SHAPE] = simple_out;
            outPointTemplate[PropertyValueType.NO_VALUE] = simple_out;
            outPointTemplate[PropertyValueType.COLOR] = array_1d_out;
            outPointTemplate[PropertyValueType.OneD] = array_1d_out;
            outPointTemplate[PropertyValueType.TwoD] = array_2d_out;
            outPointTemplate[PropertyValueType.ThreeD] = array_3d_out;
            templates = {
                inPoint: inPointTemplate,
                outPoint: outPointTemplate,
            }
            return templates;
        }()
    )

    function equal(value1, value2) {
        var i, len;
        if (typeof value1 === 'number') {
            return value1 === value2;
        } else if (value1.length && value1[0].i) {
            i = 0;
            len = value1[0].i.length;
            while (i < len) {
                if (!equal(value1[0].i[i], value2[0].i[i])
                    || !equal(value1[0].o[i], value2[0].o[i])
                    || !equal(value1[0].v[i], value2[0].v[i])
                ) {
                    return false;
                }
                i += 1;
            }
            return value1.c === value2.c;
        } else {
            i = 0;
            len = value1.length;
            while (i < len) {
                if (value1[i] !== 0 || value2[i] !== 0) {
                    var diff = Math.abs(value1[i] - value2[i]);
                    var nonZeroValue = Math.abs(value1[i] || value2[i]);
                    // bm_eventDispatcher.log('diff: ' + diff)
                    // bm_eventDispatcher.log('nonZeroValue: ' + nonZeroValue)
                    // bm_eventDispatcher.log('diff / nonZeroValue: ' + diff / nonZeroValue)
                    // bm_eventDispatcher.log('value1: ' + value1[i])
                    // bm_eventDispatcher.log('value2: ' + value2[i])
                    if (diff > 0.00001 && diff / nonZeroValue > 0.001) {
                        return false;
                    }
                }
                i += 1;
            }
            return true;
        }
    }

    function getSlopeFactoredByTime(point1, point2, time) {
        var slope = [];
        for(var i = 0; i < point1.length; i += 1) {
            slope[i] = (point2[i] - point1[i]) / time;
        }
        return slope;
    }

    function checkSlopesEquality(value1, value2, value3, timeDiff1, timeDiff2) {
        var slope1 = getSlopeFactoredByTime(value2, value1, timeDiff1);
        var slope2 = getSlopeFactoredByTime(value3, value2, timeDiff2);

        // bm_eventDispatcher.log('============')
        // bm_eventDispatcher.log('VAL 1:')
        // bm_eventDispatcher.log(value1)
        // bm_eventDispatcher.log('VAL 2:')
        // bm_eventDispatcher.log(value2)
        // bm_eventDispatcher.log('VAL 3:')
        // bm_eventDispatcher.log(value3)
        // bm_eventDispatcher.log('TIME 1:')
        // bm_eventDispatcher.log(timeDiff1)
        // bm_eventDispatcher.log('TIME 2:')
        // bm_eventDispatcher.log(timeDiff2)
        // bm_eventDispatcher.log('SLOPE 1:')
        // bm_eventDispatcher.log(slope1)
        // bm_eventDispatcher.log('SLOPE 2:')
        // bm_eventDispatcher.log(slope2)
        return equal(slope1, slope2);
    }

    function checkPointsSlope(points1, points2, points3, timeDiff1, timeDiff2) {
        var point1, point2, point3;
        for (var i = 0; i < points1.length; i += 1) {
            point1 = points1[i];
            point2 = points2[i];
            point3 = points3[i];
            if (!checkSlopesEquality(point1, point2, point3, timeDiff1, timeDiff2)) {
                return false;
            }
        }
        return true;
    }

    function areCollinear(key1, key2, key3) {
        var timeDiff1 = key2.t - key1.t;
        var timeDiff2 = key3.t - key2.t;
        if (key1.s.length && key1.s[0].i) {
            var value1 = key1.s[0];
            var value2 = key2.s[0];
            var value3 = key3.s[0];
            if (checkPointsSlope(value1.v, value2.v, value3.v, timeDiff1, timeDiff2)
                && checkPointsSlope(value1.i, value2.i, value3.i, timeDiff1, timeDiff2)
                && checkPointsSlope(value1.o, value2.o, value3.o, timeDiff1, timeDiff2)
            ) {
                return true;
            }
        } else if (typeof key1.s === 'number') {
            var diff1 = key2.s[0] - key1.s[0];
            var diff2 = key3.s[0] - key2.s[0];
            if (Math.abs((diff1 / timeDiff1) - (diff2 / timeDiff2)) < 0.002
            ) {
                return true;
            }
        } else {
            if (checkSlopesEquality(key1.s, key2.s, key3.s, timeDiff1, timeDiff2)) {
                return true;
            }
        }
        return false;
    }

    function checkPrevValueFromKeyframes(key, keyframes) {
        if (keyframes.length > 1) {
            var prevKey = keyframes[keyframes.length - 1];
            var secondPrevKey = keyframes[keyframes.length - 2];
            if ((equal(prevKey.s, key.s) && equal(secondPrevKey.s, key.s))
                || areCollinear(secondPrevKey, prevKey, key)
            ) {
                keyframes.pop();
            } else {
                // bm_eventDispatcher.log('ARE DIFFERENT AT:' + key.t)
            }
        }
    }

    function roundValue(value) {
        if (typeof value === 'number') {
            return bm_generalUtils.roundNumber(value, 3);
        } else if (value.length && value[0].i) {
            return value;
        } else {
            return bm_generalUtils.roundNumber(value, 3);
        }
    }

    function getBakedValueAtTime(prop, time) {
        var value = prop.valueAtTime(time, false);
        if (prop.propertyValueType === PropertyValueType.SHAPE) {
            // Values are getting rounded here instead of after slope calculation because of floating point differences
            // And because shapes should never change in amounts smaller than 0.1 pixels.
            value = {
                i : bm_generalUtils.roundNumber(value.inTangents, 3),
                o : bm_generalUtils.roundNumber(value.outTangents, 3),
                v : bm_generalUtils.roundNumber(value.vertices, 3),
                c: value.closed
            }
            value = [value];
        } else {
            if (!(value instanceof Array)) {
                value = [value];
            }
        }
        return value;
    }

    function bakeExpressions(prop, frameRate) {
        var keyframes = [];
        var range = renderHelper.getCurrentRange();
        var time = range[0];
        var index = 0;
        var totalFrames = (range[1] - range[0]) * frameRate;
        for (index = 0; index < totalFrames; index += 1) {
            var value = getBakedValueAtTime(prop, time + index / frameRate);
            var key = {
                s: value,
                t: time * frameRate + index,
                i: easePointsTemplates.inPoint[prop.propertyValueType],
                o: easePointsTemplates.outPoint[prop.propertyValueType],
            }
            checkPrevValueFromKeyframes(key, keyframes);
            keyframes.push(key);
        }
        for (var i = 0; i < keyframes.length; i += 1) {
            keyframes[i].s = roundValue(keyframes[i].s);
        }
        if (keyframes.length > 2
            && equal(keyframes[keyframes.length - 1].s, keyframes[keyframes.length - 2].s)
        ) {
            keyframes.pop();
        }
        if (keyframes.length > 2
            && equal(keyframes[0].s, keyframes[1].s)
        ) {
            keyframes.shift();
        }
        return {
            k: keyframes,
        }
    }
    
    return bakeExpressions;

}())