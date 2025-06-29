/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_reportBuilderTypes = (function () {

    return {
        EXPRESSIONS: 'expressions',
        WIGGLE: 'wiggle',
        UNHANDLED_LAYER: 'unhandled layer',
        DISABLED_LAYER: 'disabled layer',
        MOTION_BLUR: 'motion blur',
        PRESERVE_TRANSPARENCY: 'preserve transparency',
        THREE_D_LAYER: 'three d layer',
        EFFECTS: 'effects',
        UNHANDLED_SHAPE_PROPERTY: 'unhandled shape',
        MERGE_PATHS: 'merge paths',
        TEXT_ANIMATORS: 'text animators',
        ANIMATOR_PROPERTIES: 'animator properties',
        LARGE_IMAGE: 'large image',
        ILLUSTRATOR_ASSET: 'illustrator asset',
        CAMERA_LAYER: 'camera layer',
        AUDIO_LAYER: 'audio layer',
        IMAGE_LAYER: 'image layer',
        FAILED_LAYER: 'failed layer',
        ADJUSTMENT_LAYER: 'adjustment layer',
        UNSUPPORTED_STYLE: 'unsupported style',
        LARGE_MASK: 'large mask',
        FILTER_SIZE: 'filter size',
        UNSUPPORTED_PROPERTY: 'unsupported property',
        UNSUPPORTED_MASK_MODE: 'unsupported mask mode',
        LARGE_EFFECTS: 'large effects',
        TEXT_SELECTOR_TYPE: 'text selector type',
        TEXT_SELECTOR_PROPERTIES: 'text selector properties',
        PUCKER_AND_BLOAT: 'pucker and bloat',
    };
}());