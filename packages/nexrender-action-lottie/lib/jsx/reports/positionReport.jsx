/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_positionReport = (function () {
    
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function Position(transform, isThreeD) {
        this.transform = transform;
        this.isThreeD = isThreeD;
        this.process();
    }

    generalUtils.extendPrototype(Position, MessageClass);

    Position.prototype.processExpressions = function() {
    }

    Position.prototype.process = function() {
        if (this.transform.position.dimensionsSeparated) {
            this.px = propertyReport(this.transform.property('ADBE Position_0'));
            this.py = propertyReport(this.transform.property('ADBE Position_1'));
            if (this.isThreeD) {
                this.pz = propertyReport(this.transform.property('ADBE Position_2'));
            }
        } else {
            this.p = propertyReport(this.transform.position);
        }
    }

    Position.prototype.serialize = function() {
        if (this.transform.position.dimensionsSeparated) {
            return {
                dimensionsSeparated: true,
                positionX: this.px.serialize(),
                positionY: this.py.serialize(),
                positionZ: this.isThreeD ? this.pz.serialize() : undefined,
            }
        } else {
            return {
                dimensionsSeparated: false,
                position: this.p.serialize(),
            }
        }
    }


    return function(property, isThreeD) {
    	return new Position(property, isThreeD);
    }
    
}());