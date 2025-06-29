/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_transformReportFactory = (function () {
    
    var propertyReport = $.__bodymovin.bm_propertyReport;
    var positionReport = $.__bodymovin.bm_positionReport;
    var rotationReport = $.__bodymovin.bm_rotationReport;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function Transform(transform, isThreeD) {
        this.transform = transform;
        this.isThreeD = isThreeD || false;
        this.process();
    }

    Transform.prototype.processProperties = function() {
        if (this.transform.Scale) {
            this.scale = propertyReport(this.transform.Scale);
        }
        if (this.transform.Opacity) {
            this.opacity = propertyReport(this.transform.Opacity);
        }
        if (this.transform.property('Start Opacity')) {
            this.startOpacity = propertyReport(this.transform.property('Start Opacity'));
        }
        if (this.transform.property('End Opacity')) {
            this.endOpacity = propertyReport(this.transform.property('End Opacity'));
        }
        if (this.transform.property('Anchor Point')) {
            this.anchorPoint = propertyReport(this.transform.property('Anchor Point'));
        }
        
        this.rotation = rotationReport(this.transform, this.isThreeD);
        this.position = positionReport(this.transform, this.isThreeD);

        if (this.transform.property('Skew') && this.transform.property('Skew').canSetExpression) {
            this.skew = propertyReport(this.transform.property('Skew'));
            this.skewAxis = propertyReport(this.transform.property('Skew Axis'));
        }
    }

    Transform.prototype.process = function() {
        this.processProperties();
    }

    Transform.prototype.serialize = function() {
        return {
            anchorPoint: this.anchorPoint ? this.anchorPoint.serialize(): undefined,
            scale: this.scale ? this.scale.serialize() : undefined,
            opacity: this.opacity ? this.opacity.serialize() : undefined,
            rotation: this.rotation ? this.rotation.serialize() : undefined,
            position: this.position.serialize(),
            skew: this.skew ? this.skew.serialize() : undefined,
            skewAxis: this.skewAxis ? this.skewAxis.serialize() : undefined,
            startOpacity: this.startOpacity ? this.startOpacity.serialize() : undefined,
            endOpacity: this.endOpacity ? this.endOpacity.serialize() : undefined,
        }
    }



    return function(transform, isThreeD) {
        return new Transform(transform, isThreeD);
    }
    
}());