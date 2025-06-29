// Apply Pseudo Effect as Animation Preset
// By Tomas Sinkunas (www.rendertom)

/*
Script applies Pseudo Effect as Animation preset, eliminating the need for the end user to install Pseudo Effect to XML and restart AE.
How to make it work:
1. Install Pseudo Effect on your machine.
2. Apply Pseudo Effect to a layer and export it as Animation Preset. Animation Presets are not backwards compatible, so use as lowest AE version as you can.
3. Convert exported FFX file to binary string and paste it to myPseudoEffect.presetBinary property.
4. Done. Your clients dont need to install Pseudo Effect as it will be applied ad Animation Preset. Enjoy.
*/
$.__bodymovin.presetHelper = (function () {

    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_downloadManager = $.__bodymovin.bm_downloadManager;
	var ob = {
		applyPreset: applyPreset,
	};

	var pseudoEffects = [
		{
			path: '/assets/annotations/bodymovin_text_props.ffx',
			matchName: 'Pseudo/Bodymovin Text Props',
			name: 'Text Properties',
		}
	]

	function applyPreset(layer, matchName, pseudoEffectData) {
		// Define your Pseudo Effect here

		var myComp = app.project.activeItem;
		if (!myComp || !(myComp instanceof CompItem)) {
			myComp = app.project.items.addComp("My Comp", 1920, 1080, 1, 10, 24);
			myComp.openInViewer();
		}

		var myLayer = layer;
		if (!myLayer) 
			myLayer = myComp.layers.addSolid([0,0,0], "My Layer", myComp.width, myComp.height, 1);

		var effectsProp = myLayer.property("ADBE Effect Parade");

		// APPLY PSEUDO EFFECT
		if (effectsProp.canAddProperty(pseudoEffectData.matchName)) {
			// bm_eventDispatcher.log('COULD ADD')
			effectsProp.addProperty(pseudoEffectData.matchName);
		} else {
			// bm_eventDispatcher.log('COULD NOT ADD')
			applyPseudoEffect(pseudoEffectData, effectsProp);
		}



		///// HELPER FUNCTIONS /////
		function applyPseudoEffect(myPseudoEffect, effectsProp) {
			var animationPreset	= createResourceFile(myPseudoEffect);
			if(animationPreset) {

				var masterLayer = effectsProp.parentProperty;
				var curentComp 	= masterLayer.containingComp;

				var tempSolid 		= curentComp.layers.addSolid([0,0,0], "Temp Solid", 10, 10, 1);
				var tempSolidSource = tempSolid.source;
				var tempSolidFolder = tempSolidSource.parentFolder;

				tempSolid.applyPreset(File(animationPreset));
				myPseudoEffect.matchName = tempSolid.property("ADBE Effect Parade").property(1).matchName;

				masterLayer.selected = true;
				try {
					effectsProp.addProperty(myPseudoEffect.matchName);
				} catch(err) {
					bm_eventDispatcher.log(err.message)
				}

				tempSolidSource.remove();
				if (tempSolidFolder.numItems === 0) tempSolidFolder.remove();

			}
		}

		function createResourceFile (myPseudoEffect) {
			try {
				var extensionFolder = bm_downloadManager.getExtensionFolder();
				var myFile = new File(extensionFolder.absoluteURI + myPseudoEffect.path)
				if (myFile.exists) {
					return myFile;
				} else {
					return false;
				}
			} catch(err){
				$.__bodymovin.bm_eventDispatcher.alert("Error in createResourceFile function\n" + err.toString());
			}
		}
	}

	return ob;
}())
