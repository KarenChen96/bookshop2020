/*global QUnit*/

sap.ui.define([
		"i2d/ppm/projectplannings1/ext/TablePersoController",
		"sap/ui/table/TreeTable",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	], function (TablePerso) {
		"use strict";

		QUnit.module("tablePersonalization", {
			setup:function() {
				this.oTreeTable = new sap.ui.table.TreeTable();
				this.oTablePerso = new TablePerso({table: this.oTreeTable});
			},
			teardown:function() {
				this.oTablePerso = undefined;
			}
		});

		// QUnit.test("Open Dialog", function (assert) {

		// 	// System under test
		// 	this.oTablePerso.openDialog();                         

		// 	// Assert
		// 	assert.strictEqual(true, true, "Open Dialog passed");
		// });

	}
);
