/*jslint vars: true , plusplus: true, continue:true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $*/
$.__bodymovin.bm_audioHelper = (function () {
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var settingsHelper = $.__bodymovin.bm_settingsHelper;
    var ob = {};
    
    function exportAudio(layerInfo, data, frameRate) {
        // For now nothing additional is getting exported
        // since the audio is rasterized with all effects applied during export
        // bm_timeremapHelper.exportTimeremap(layerInfo, data, frameRate);
        if (!settingsHelper.shouldRasterizeWaveform()) {
            var stretch = data.sr;
            var audioProperty = layerInfo.property('Audio');
            data.au = {
                lv: bm_keyframeHelper.exportKeyframes(audioProperty.property('Audio Levels'), frameRate, stretch),
            }
            
        }
        
    }
    
    ob.exportAudio = exportAudio;
    
    return ob;
}());
    