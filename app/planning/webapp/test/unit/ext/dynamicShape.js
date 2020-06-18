/*global QUnit*/

sap.ui.define([
    "sap/gantt/simple/BaseChevron",
    "sap/gantt/simple/BaseRectangle",
    "i2d/ppm/projectplannings1/ext/DynamicShape",
    "sap/ui/thirdparty/sinon",
    "sap/ui/thirdparty/sinon-qunit"
], function (BaseChevron, BaseRectangle, DynamicShape) {
    "use strict";

    QUnit.module("Dynamic Shape");

    QUnit.test("Active shape selects correct value", function (assert) {
        BaseChevron.prototype.renderElement = function () { this.bRendered = true; };
        BaseRectangle.prototype.renderElement = function () { this.bRendered = true; };
        var oShape = new DynamicShape({
            activeShape: 1,
            shapes: [
                new BaseChevron(),
                new BaseRectangle()
            ]
        });

        oShape._iBaseRowHeight = 33;
        oShape.renderElement(oShape, oShape);
        assert.equal(!!oShape.getShapes()[1].bRendered, true, "Rectangle should be rendered.");
        assert.equal(!!oShape.getShapes()[0].bRendered, false, "Chevron shouldn't be rendered.");
    });

    QUnit.module("Stand Alone");

    QUnit.test("Important properties get propagated", function (assert) {
        var oInnerShape = new BaseRectangle();
        var oShape = new DynamicShape({
            shapes: oInnerShape
        });
        oShape.setRowYCenter(5);
        oShape.setSelected(true);
        oShape.setProperty("shapeUid", "test");
        assert.equal(oInnerShape.getRowYCenter(), 5, "rowYCenter should be propagated.");
        assert.equal(oInnerShape.getSelected(), true, "selected should be propagated.");
        assert.equal(oInnerShape.getShapeUid(), "test", "shapeUid should be propagated.");
        oShape.destroy();
    });

    QUnit.test("ShapeId is propagated only if not set", function (assert) {
        var oInnerShapeWith = new BaseRectangle({
                shapeId: "inner"
            }),
            oInnerShapeWithout = new BaseRectangle(),
            oShape = new DynamicShape({
                shapes: [oInnerShapeWith, oInnerShapeWithout]
            });
        oShape.setShapeId("test");
        assert.equal(oInnerShapeWith.getShapeId(), "inner", "Shape with defined rowId should keep the row ID.");
        assert.equal(oInnerShapeWithout.getShapeId(), "test", "Shape without defined rowId should get propagated ID.");
        oShape.destroy();
    });
});
