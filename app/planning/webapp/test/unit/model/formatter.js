/*global QUnit*/

sap.ui.define([
	"i2d/ppm/projectplannings1/model/formatter"
], function (formatter) {
	"use strict";

	QUnit.module("Number unit");

	function numberUnitValueTestCase(assert, sValue, fExpectedNumber) {
		// Act
		var fNumber = formatter.numberUnit(sValue);

		// Assert
		assert.strictEqual(fNumber, fExpectedNumber, "The rounding was correct");
	}

	QUnit.test("Should round down a 3 digit number", function (assert) {
		numberUnitValueTestCase.call(this, assert, "3.123", "3.12");
	});

	QUnit.test("Should round up a 3 digit number", function (assert) {
		numberUnitValueTestCase.call(this, assert, "3.128", "3.13");
	});

	QUnit.test("Should round a negative number", function (assert) {
		numberUnitValueTestCase.call(this, assert, "-3", "-3.00");
	});

	QUnit.test("Should round an empty string", function (assert) {
		numberUnitValueTestCase.call(this, assert, "", "");
	});

	QUnit.test("Should round a zero", function (assert) {
		numberUnitValueTestCase.call(this, assert, "0", "0.00");
	});

	QUnit.test("formatShapeType -- work package", function (assert) {
		var shape = formatter.formatShapeType(2);
		assert.strictEqual(shape, 1, "work package is rectangle");
	});

	QUnit.test("formatShapeType -- header", function (assert) {
		var shape = formatter.formatShapeType(0);
		assert.strictEqual(shape, 0, "header is chevron");
	});

	QUnit.test("formatStartDate", function (assert) {
		var oToday = new Date();
		var oDay = formatter.formatStartDate(oToday, null);
		assert.strictEqual(oDay.getHours(), 0, "Hour is 00");
		assert.strictEqual(oDay.getMinutes(), 0, "Minute is 00");
		assert.strictEqual(oDay.getSeconds(), 0, "Second is 00");

		oDay = formatter.formatStartDate(null, oToday);
		assert.strictEqual(oDay.getHours(), 23, "Hour is 23");
		assert.strictEqual(oDay.getMinutes(), 59, "Minute is 59");
		assert.strictEqual(oDay.getSeconds(), 59, "Second is 59");

	});

	QUnit.test("formatEndDate", function (assert) {
		var oToday = new Date();
		var oDay = formatter.formatEndDate(null, oToday);
		assert.strictEqual(oDay.getHours(), 23, "Hour is 23");
		assert.strictEqual(oDay.getMinutes(), 59, "Minute is 59");
		assert.strictEqual(oDay.getSeconds(), 59, "Second is 59");

		oDay = formatter.formatEndDate(oToday, null);
		assert.strictEqual(oDay.getHours(), 0, "Hour is 00");
		assert.strictEqual(oDay.getMinutes(), 0, "Minute is 00");
		assert.strictEqual(oDay.getSeconds(), 0, "Second is 00");
	});

	QUnit.test("formatTooltip", function (assert) {
		var sEOL = "\n";
		var oToday = new Date();
		var sTooltip = formatter.formatTooltip("Hello", "World", oToday, oToday);
		var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance();
		assert.strictEqual(sTooltip,
			formatter.sLBLTask + ": " + "Hello" + sEOL +
			formatter.sLBLTaskName + ": " + "World" + sEOL +
			formatter.sLBLPlannedStart + ": " + oDateFormat.format(formatter.formatStartDate(oToday, null)) + sEOL +
			formatter.sLBLPlannedFinish + ": " + oDateFormat.format(formatter.formatEndDate(null, oToday)),
			"Tooltip is correct");
	});
	
	
	QUnit.test("formatRowActionVisible", function (assert) {

		var bVisible = formatter.formatRowActionVisible(0, "1234");
		assert.strictEqual(bVisible, true, "Display row action for root node");
		
		bVisible = formatter.formatRowActionVisible(1, "1234");
		assert.strictEqual(bVisible, true, "Display row action for authorized node");

		bVisible = formatter.formatRowActionVisible(1, "00000000-0000-0000-0000-000000000000");
		assert.strictEqual(bVisible, false, "Hide row action for authorized node");
	});
	
	
	QUnit.test("formatRowStatus", function (assert) {

		var sHighlight = formatter.formatRowStatus(false, false);
		assert.strictEqual(sHighlight, "Information", "show highlight flag");
		
		sHighlight = formatter.formatRowStatus(true, false);
		assert.strictEqual(sHighlight, "None", "No highlight flag");

		sHighlight = formatter.formatRowStatus(false, true);
		assert.strictEqual(sHighlight, "None", "No highlight flag");
	});	
	
});
