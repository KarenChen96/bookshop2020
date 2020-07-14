sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/theming/Parameters"
], function (Device, Parameters) {
	"use strict";

	return {
		colorDef: {
			shape: {
				// #abdbf2
				TaskDone: Parameters.get("sapUiChartPaletteSequentialHue1Light3"),
				// #5cbae5
				TaskOpen: Parameters.get("sapUiChartPaletteSequentialHue1Light1"),
				// #bac1c4
				PhaseOpen: Parameters.get("sapUiChartNeutral"),
				// #d5dadc
				PhaseDone: Parameters.get("sapUiChartPaletteSemanticNeutralLight2")
			}
		},

		init: function () {
			var i18nBundle = new sap.ui.model.resource.ResourceModel({
				bundleName: "projectplanning.i18n.i18n"
			}).getResourceBundle();

			// this.sLBLTask = i18nBundle.getText("LABEL_TASK_ID");
			this.sLBLTask = i18nBundle.getText("LABEL_COST_CENTER");
			this.sLBLTaskName = i18nBundle.getText("LABEL_OBJECT_NAME");
			this.sLBLPlannedStart = i18nBundle.getText("LABEL_START_DATETIME");
			this.sLBLPlannedFinish = i18nBundle.getText("LABEL_FINISH_DATETIME");
		},

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		/**
		 * get shape type according to object type
		 *
		 * @param {int}
		 *            HierarchyNodeLevel: for project header, hierarchy level = 1  .
		 *            
		 * @return {int}
		 *             1: task, 0: project header   
		 *                          
		 * @public
		 */
		formatShapeType: function (HierarchyNodeLevel) {
			if (HierarchyNodeLevel > 0) {
				return 1;
			}
			else {
				return 0;
			}
		},

		/**
		 * format start date, set time to 00:00:00
		 *
		 * @param {object}
		 *            oStart: start date
		 * @param {object}
		 *            oEnd: end date
		 *            
		 * @return {object}
		 *              return formatted start date             
		 * @public
		 */
		formatStartDate: function (oStart, oEnd) {
			if (oStart) {
				return new Date(oStart.getUTCFullYear(), oStart.getUTCMonth(), oStart.getUTCDate(), 0, 0, 0);
			}
			else if (oEnd) {
				return new Date(oEnd.getUTCFullYear(), oEnd.getUTCMonth(), oEnd.getUTCDate(), 23, 59, 59);
			}
		},

		/**
		 * format end date, set time to 23:59:59
		 *
		 * @param {object}
		 *            oStart: start date
		 * @param {object}
		 *            oEnd: end date
		 *            
		 * @return {object}
		 *              return formatted end date 
		 *                          
		 * @public
		 */
		formatEndDate: function (oStart, oEnd) {
			if (oEnd) {
				return new Date(oEnd.getUTCFullYear(), oEnd.getUTCMonth(), oEnd.getUTCDate(), 23, 59, 59);
			}
			else if (oStart) {
				return new Date(oStart.getUTCFullYear(), oStart.getUTCMonth(), oStart.getUTCDate(), 0, 0, 0);
			}
		},

		/**
		 * format shape tooltip
		 *
		 * @param {string}
		 *            sTaskID: task id
		 * @param {string}
		 *            sTaskName: task name
		 * @param {object}
		 *            oStart: task start date
		 * @param {object}
		 *            oEnd: task end date
		 *            
		 * @return {string}
		 *              tooltip string 
		 *            
		 * @public
		 */
		formatTooltip: function (sTaskID, sTaskName, oStart, oEnd) {
			if (!sTaskID || !sTaskName || !oStart || !oEnd) { return ""; }

			var sEOL = Device.browser.msie ? "\u2028" : "\n";
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance();

			return this.sLBLTask + ": " + sTaskID + sEOL +
				this.sLBLTaskName + ": " + sTaskName + sEOL +
				this.sLBLPlannedStart + ": " + oDateFormat.format(this.formatStartDate(oStart, null)) + sEOL +
				this.sLBLPlannedFinish + ": " + oDateFormat.format(this.formatEndDate(null, oEnd));
		},
		
		/**
		 * format row action button visibility, hide row action for unauthorized task (WBSElementInternalID is null)
		 *
		 * @param {int}
		 *            HierarchyNodeLevel: Hierarchy level
		 * @param {string}
		 *            ProjectUUID: Project UUID
		 *            
		 * @return {boolean}
		 *              whether to display row action 
		 *            
		 * @public
		 */	
		formatRowActionVisible:function(HierarchyNodeLevel,ProjectUUID){
			if((HierarchyNodeLevel === 0) || (ProjectUUID !== "00000000-0000-0000-0000-000000000000"))
			{
				return true;
			}
			else
			{
				return false;
			}
		},

		/**
		 * format row highlight status
		 *
		 * @param {boolean}
		 *            bIsActiveEntity: whether it's in edit mode
		 * @param {boolean}
		 *            bHasActiveEntity: whether it has a active entity
		 *            
		 * @return {string}
		 *              object status used for highlight 
		 *                          
		 * @public
		 */			
		formatRowStatus:function(bIsActiveEntity, bHasActiveEntity){
			if(bIsActiveEntity === false && bHasActiveEntity === false)
			{
				return "Information";
				
			}
			else
			{
				return "None";
			}
		}		
	};
});