sap.ui.define([
	"sap/ui/core/syncStyleClass",
	"sap/ui/table/TablePersoController"
], function (syncStyleClass, TablePersoController) {
	"use strict";

	var TablePersoControllerExt = TablePersoController.extend("projectplanning.TablePersoController", {
		constructor: function (sId, mSettings) {
			TablePersoController.apply(this, arguments);
		},
		metadata: {
			aggregations: {
				currentColumns: {
					type: "Object",
					multiple: false
				}
			},
			events: {
				persoDialogConfirm: {
					parameters: {
						dataChanged: { type: "boolean" }
					}
				}
			}
		}
	});

	/**
	 * Opens the personalization dialog for the Table to modify the visibility and
	 * the order of the columns.
	 *
	 * <i>Using this functionality will require to load the sap.m library because the
	 * personalization dialog is only available in this library for now.</i>
	 *
	 * @param {object} mSettings
	 * @public
	 * @experimental since 1.21.2 - API might change / feature requires the sap.m library!
	 */
	TablePersoControllerExt.prototype.openDialog = function (mSettings) {
		var that = this;

		function _open() {
			if (that._oDialog) {
				syncStyleClass("sapUiSizeCompact", that._getTable(), that._oDialog._oDialog);
				that._oDialog.open();

				var aItems = that._oDialog._oList.getItems();
				aItems.forEach(function (oItem) {
					var oCheckbox = oItem.getContent()[0];
					oCheckbox.attachEvent("select", function (oEvent) {
						var aSplits = oItem.getBindingContext("Personalization").getProperty("id").split("-");
						if (mSettings.mandatoryColumns.indexOf(aSplits[aSplits.length - 1]) !== -1) { oCheckbox.setSelected(true); }
					});
				});
			}
		}

		if (!this._oDialog) {
			// include the mobile library to re-use the sap.m.TablePersoDialog
			sap.ui.getCore().loadLibrary("sap.m", { async: true }).then(function () {
				sap.ui.require(["sap/m/TablePersoDialog"], function (TablePersoDialog) {
					// create and open the dialog
					that._oDialog = new TablePersoDialog(that._getTable().getId() + "-PersoDialog", {
						persoService: that.getPersoService(),
						showSelectAll: true,
						showResetAll: true,
						hasGrouping: false,
						contentWidth: mSettings && mSettings.contentWidth,
						contentHeight: mSettings && mSettings.contentHeight || "20rem",
						initialColumnState: that._oInitialPersoData.aColumns,
						columnInfoCallback: function (oTable, mPersoMap, oPersoService) {
							return that._getCurrentTablePersoData(true).aColumns;
						},
						confirm: function () {
							that._adjustTable(this.retrievePersonalizations());
							that.firePersoDialogConfirm({
								dataChanged: (function (aNewColumns, aOldColumns) {
									return !aOldColumns.every(function (oOldColumn, index) {
										return aNewColumns[index].id.indexOf(oOldColumn.fieldName) > -1
											&& aNewColumns[index].visible === oOldColumn.Visible;
									});
								})(this.retrievePersonalizations().aColumns, that.getCurrentColumns())
							});
						}
					});
					that._oDialog._oDialog.removeStyleClass("sapUiPopupWithPadding"); // otherwise height calculation doesn't work properly!

					_open();

					var oSelectAll = that._oDialog._oSelectAllCheckbox;
					oSelectAll.attachEvent("select", function (oEvent) {
						if (!oSelectAll.getSelected()) {
							var aItems = that._oDialog._oList.getItems();
							aItems.forEach(function (oItem) {
								var oCheckbox = oItem.getContent()[0];
								var aSplits = oItem.getBindingContext("Personalization").getProperty("id").split("-");
								if (mSettings.mandatoryColumns.indexOf(aSplits[aSplits.length - 1]) !== -1) { oCheckbox.setSelected(true); }
							});
							// toast out msg when deselected all
							sap.m.MessageToast.show(mSettings.toastMsg);
						}
					});
				});
			});
		} else {
			_open();
		}
	};
	return TablePersoControllerExt;
}, true);
