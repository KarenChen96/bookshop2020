/* global document */
sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"./model/models"
	], function (UIComponent, Device, models) {
		"use strict";

		return UIComponent.extend("projectplanning.Component", {

			metadata : {
				manifest: "json"
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this function, the FLP and device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init : function () {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);

				// set the device model
				this.setModel(models.createDeviceModel(), "device");
				// set the FLP model
				this.setModel(models.createFLPModel(), "FLP");
				
				this._oCopilotContext = null;

				// create the views based on the url/hash
				//this.getRouter().initialize();
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
			 */
			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			},
			
			/**
			 * when navigating away from the application and the application is marked as keep-alive the application is stored in the background and 
			 * this process of storing the application and suspending all activities of the application is called suspend.
			 * 
			 * @public
			 */			
			suspend:function(){
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("Component", "suspend");					
			},
			
			/**
			 * when navigating to an application that was suspended there is a need to restore this application from the suspend mode to active mode and this process is called restore.
			 * 
			 * @public
			 */					
			restore:function(){
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("Component", "Restore");
			},
			
			/**
			 * set context list for copilot -- add object from current screen.
			 * 
			 * @public
			 */				
			setCopilotContexts:function(oContext){
				this._oCopilotContext = oContext;
			},
			
			/**
			 * allows Copilot to add specific objects in the current screen.
			 * 
			 * @public
			 */				
			getCoPilotContexts:function(){
			    return {contextsList : 	this._oCopilotContext};
			}			

		});

	}
);