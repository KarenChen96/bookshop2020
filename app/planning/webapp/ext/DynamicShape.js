sap.ui.define([
	"sap/gantt/simple/BaseShape"
], function (BaseShape) {
	"use strict";

	var PROPAGATED_PROPERTIES = ["rowYCenter", "shapeUid", "selected"];

	var DynamicShape = BaseShape.extend("projectplanning.DynamicShape", {
		metadata: {
			properties: {
				activeShape: { type: "int", defaultValue: 0 }
			},
			aggregations: {
				shapes: { type: "sap.gantt.simple.BaseShape", multiple: true, singularName: "shape", sapGanttLazy: true }
			}
		}
	});

	DynamicShape.prototype.renderElement = function (oRm, oElement) {
		var iActiveShape = oElement.getActiveShape(),
			aShapes = oElement.getShapes();
		if (iActiveShape >= 0 && iActiveShape < aShapes.length) {
			var oSelectedShape = aShapes[iActiveShape];
			oSelectedShape._iBaseRowHeight = oElement._iBaseRowHeight;
			oSelectedShape.renderElement(oRm, oSelectedShape);
		}
	};

	DynamicShape.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {
		BaseShape.prototype.setProperty.apply(this, arguments);
		if (PROPAGATED_PROPERTIES.indexOf(sPropertyName) >= 0) {
			this.getShapes().forEach(function (oShape) {
				oShape.setProperty(sPropertyName, oValue, bSuppressInvalidate);
			});
		}
		if (sPropertyName === "shapeId") {
			this.getShapes().forEach(function (oShape) {
				var sShapeId = oShape.getShapeId();
				if (!sShapeId) {
					oShape.setProperty(sPropertyName, oValue, bSuppressInvalidate);
				}
			});
		}
	};

	return DynamicShape;
});
