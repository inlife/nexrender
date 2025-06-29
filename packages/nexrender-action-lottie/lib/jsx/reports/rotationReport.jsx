/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_rotationReport = (function () {
    
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function Rotation(transform, isThreeD) {
        this.transform = transform;
        this.isThreeDimensional = isThreeD;
        this.process();
    }

    generalUtils.extendPrototype(Rotation, MessageClass);

    Rotation.prototype.processExpressions = function() {
    }

    Rotation.prototype.process = function() {
        if (this.isThreeDimensional) {
            this.rx = propertyReport(this.transform.property('ADBE Rotate X'));
            this.ry = propertyReport(this.transform.property('ADBE Rotate Y'));
            this.rz = propertyReport(this.transform.property('ADBE Rotate Z'));
            this.or = propertyReport(this.transform.Orientation);
        } else {
            this.r = propertyReport(this.transform.rotation);
        }
    }

    Rotation.prototype.serialize = function() {
        if (this.isThreeDimensional) {
            return {
                isThreeD: true,
                rotationX: this.rx.serialize(),
                rotationY: this.ry.serialize(),
                rotationZ: this.rz.serialize(),
                orientation: this.or.serialize(),
            }
        } else {
            return {
                isThreeD: false,
                rotation: this.r.serialize(),
            }
        }
    }


    return function(property, isThreeD) {
    	return new Rotation(property, isThreeD);
    }
    
}());