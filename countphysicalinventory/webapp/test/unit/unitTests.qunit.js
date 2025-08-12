/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"countphysicalinventory/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
