nexrender.selectCompositionsByName(NX.get("composition"), function (mainComp) {
    var logPath = NX.get("logPath");
    var log = new File(logPath);
    log.open("w", "TEXT", "ttxt");
    log.write("logPath: " + logPath + "\n");
    log.write("serverUrl: " + NX.get("serverUrl") + "\n");
    log.write("composition: " + NX.get("composition") + "\n");
    log.write("outputPath: " + NX.get("outputPath") + "\n");
    log.write("bodymovinPath: " + NX.get("bodymovinPath") + "\n");
    $.logPath = logPath;
    $.log = log;
    $.nxSocket = new Socket();
    if ($.nxSocket.open(NX.get("serverUrl"))) {
        $.log.writeln("Connected to server");
    }
    log.close();

    $.evalFile(NX.get("bodymovinPath") + "/initializer.jsx");

    var settings = NX.get("lottieSettings");

    if (settings.banner.original_width === '/*MAIN_COMP.WIDTH*/') {
        settings.banner.original_width = mainComp.width;
    }
    if (settings.banner.original_height === '/*MAIN_COMP.HEIGHT*/') {
        settings.banner.original_height = mainComp.height;
    }

    $.__bodymovin.bm_bannerExporter.setLottiePaths(NX.get("lottiePaths"));
    $.__bodymovin.bm_renderManager.render(
        mainComp,
        NX.get("outputPath"),
        NX.get("outputPath"),
        settings,
        0
    );
    $.log.open("a", "TEXT", "ttxt");
    $.log.writeln("original width: " + settings.banner.original_width);
    $.log.writeln("original height: " + settings.banner.original_height);
    $.log.writeln("render done");
    $.log.writeln(settings);
    $.log.close();
    $.nxSocket.close();
});
