/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global Folder, File, $ */
$.__bodymovin.bm_settingsHelper = (function () {
    var ob = {};
    var _settings

    function setData(data) {
        _settings = data
    }

    function getData() {
        return _settings
    }

    function shouldCompressImages() {
        return _settings.should_compress && !_settings.original_assets;
    }

    function getCompressionQuality() {
        return _settings.compression_rate;
    }

    function shouldEncodeImages() {
        return _settings.should_encode_images;
    }

    function shouldSkipImages() {
        return _settings.should_skip_images && !_settings.should_encode_images;
    }

    function shouldReuseImages() {
        return _settings.should_reuse_images;
    }

    function shouldIgnoreExpressionProperties() {
        return _settings.ignore_expression_properties;
    }

    function shouldExportOldFormat() {
        return _settings.export_old_format;
    }

    function shouldUseSourceNames() {
        return _settings.use_source_names;
    }

    function shouldSkipDefaultProperties() {
        return _settings.skip_default_properties;
    }

    function shouldIncludeNotSupportedProperties() {
        return _settings.not_supported_properties;
    }

    function shouldIncludeReport() {
        return _settings.export_modes.reports;
    }

    function shouldIncludeHiddenLayers() {
        return _settings.hiddens;
    }

    function shouldIncludeGuidedLayers() {
        return _settings.guideds;
    }

    function shouldBakeExpressions() {
        return _settings.expressions.shouldBake;
    }

    function shouldBakeBeyondWorkArea() {
        return _settings.expressions.shouldBakeBeyondWorkArea;
    }

    function shouldBundleFonts() {
        return !_settings.glyphs && _settings.bundleFonts;
    }

    function shouldInlineFonts() {
        return shouldBundleFonts() && _settings.inlineFonts;
    }

    function shouldPrettyPrint() {
        return _settings.pretty_print;
    }

    function shouldRenderAudio() {
        return _settings.audio.isEnabled;
    }

    function getAudioBitRateTemplate() {
        return _settings.audio.bitrate;
    }

    function shouldTrimData() {
        return _settings.shouldTrimData;
    }

    function shouldRasterizeWaveform() {
        return _settings.audio.shouldRaterizeWaveform;
    }

    function shouldUserOriginalNames() {
        return _settings.original_names;
    }

    function shouldReplaceCharactersWithComps() {
        return _settings.includeExtraChars;
    }

    function shouldUseCompNamesAsIds() {
        return _settings.useCompNamesAsIds;
    }

    function shouldCopyOriginalAsset() {
        return _settings.original_assets;
    }
    function shouldExportEssentialProperties() {
        return _settings.essentialProperties.active;
    }
    function shouldExportEssentialPropertiesAsSlots() {
        return _settings.essentialProperties.useSlots;
    }
    function shouldSkipExternalComposition() {
        return shouldExportEssentialProperties() && _settings.essentialProperties.skipExternalComp;
    }

    ob.set = setData
    ob.get = getData
    ob.shouldCompressImages = shouldCompressImages;
    ob.getCompressionQuality = getCompressionQuality;
    ob.shouldEncodeImages = shouldEncodeImages;
    ob.shouldSkipImages = shouldSkipImages;
    ob.shouldReuseImages = shouldReuseImages;
    ob.shouldIgnoreExpressionProperties = shouldIgnoreExpressionProperties;
    ob.shouldExportOldFormat = shouldExportOldFormat;
    ob.shouldSkipDefaultProperties = shouldSkipDefaultProperties;
    ob.shouldIncludeNotSupportedProperties = shouldIncludeNotSupportedProperties;
    ob.shouldIncludeReport = shouldIncludeReport;
    ob.shouldIncludeHiddenLayers = shouldIncludeHiddenLayers;
    ob.shouldIncludeGuidedLayers = shouldIncludeGuidedLayers;
    ob.shouldBakeExpressions = shouldBakeExpressions;
    ob.shouldBakeBeyondWorkArea = shouldBakeBeyondWorkArea;
    ob.shouldBundleFonts = shouldBundleFonts;
    ob.shouldInlineFonts = shouldInlineFonts;
    ob.shouldPrettyPrint = shouldPrettyPrint;
    ob.shouldRenderAudio = shouldRenderAudio;
    ob.getAudioBitRateTemplate = getAudioBitRateTemplate;
    ob.shouldTrimData = shouldTrimData;
    ob.shouldRasterizeWaveform = shouldRasterizeWaveform;
    ob.shouldUserOriginalNames = shouldUserOriginalNames;
    ob.shouldUseSourceNames = shouldUseSourceNames;
    ob.shouldReplaceCharactersWithComps = shouldReplaceCharactersWithComps;
    ob.shouldUseCompNamesAsIds = shouldUseCompNamesAsIds;
    ob.shouldCopyOriginalAsset = shouldCopyOriginalAsset;
    ob.shouldExportEssentialProperties = shouldExportEssentialProperties;
    ob.shouldExportEssentialPropertiesAsSlots = shouldExportEssentialPropertiesAsSlots;
    ob.shouldSkipExternalComposition = shouldSkipExternalComposition;

    return ob;
}());
