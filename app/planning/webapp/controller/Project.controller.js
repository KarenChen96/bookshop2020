/*global location history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"../model/formatter",
	"../ext/TablePersoController",
	"../ext/DynamicShape",
	"sap/gantt/simple/DimensionLegend",
	"sap/gantt/simple/LegendColumnConfig",
	"sap/gantt/simple/LegendRowConfig",
	"sap/ui/model/json/JSONModel",
	"sap/gantt/simple/GanttRowSettings",
	"sap/m/MessageBox",
	"sap/m/QuickView",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/ActionSheet",
	"sap/m/MessageView",
	"sap/m/Dialog",
	"sap/ui/generic/app/navigation/service/NavigationHandler",
	"sap/ui/generic/app/navigation/service/SelectionVariant",
	"sap/ui/generic/app/util/MessageUtil",
	"sap/ui/core/ValueState"
], function (Controller, Log,Formatter, TablePersoController, DynamicShape,
	DimensionLegend, LegendColumnConfig, LegendRowConfig) {
	"use strict";

	return Controller.extend("projectplanning.controller.Project", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the project controller is instantiated.
		 * @public
		 */
		onInit: function () {
			//var oCurrentTime = new Date();
			//this._nTimeStamp = oCurrentTime.getTime(); 
			//Log.error(">>>>>> Planning APP -- Init, controller timestamp: " + this._nTimeStamp, "<<<<<<");			
			this._initEventBus();
			this._initModel();
			this._initControl();
			this._initAppState();
			this._initGanttChart();
			this._initSmartVariant();

		},

		/** 
		 * Called upon desctuction of the View.
		 * @public
		 */
		onExit: function () {
			this._oTreeTable.unbindAggregation("rows");
			if (this._oTPC) {
				this._oTPC.exit();
			}
			if (this._oActionSheet) {
				this._oActionSheet.destroy();
			}
			if (this._oOpenInActionSheet) {
				this._oOpenInActionSheet.destroy();
			}
			if (this._oMessagePopover) {
				this._oMessagePopover.destroy();
			}
			if (this._oMessageDialog) {
				this._oMessageDialog.destroy();
			}
			if (this._oDiscardDraftPopover) {
				this._oDiscardDraftPopover.destroy();
			}
			if (this._oUnsaveChangesDialog) {
				this._oUnsaveChangesDialog.destroy();
			}
			if (this._oObjectMarkerPopover) {
				this._oObjectMarkerPopover.destroy();
			}	
			if (this._oDemandDetailPopover) {
				this._oDemandDetailPopover.destroy();
			}				

			this._oEventBus.unsubscribe("Component", "suspend", this.onComponentSuspend, this);
			this._oEventBus.unsubscribe("Component", "Restore", this.onComponentRestore, this);			
			//Log.error("<<<<<< Planning APP -- Exit, controller timestamp: " + this._nTimeStamp, ">>>>>>");  
		},

		/**
		 * init event bus, subscribe to component resotre event
		 *
		 * @private
		 */
		_initEventBus: function () {
			this._oEventBus = sap.ui.getCore().getEventBus();
			this._oEventBus.subscribe("Component", "suspend", this.onComponentSuspend, this);
			this._oEventBus.subscribe("Component", "Restore", this.onComponentRestore, this);
		},

		/**
		 * init model, create resource i18 modle and configure odata model .
		 *
		 * @private
		 */
		_initModel: function () {
			Formatter.init();

			this.i18nBundle = new sap.ui.model.resource.ResourceModel({
				bundleName: "projectplanning.i18n.i18n"
			}).getResourceBundle();

			this._oDataModel = this.getOwnerComponent().getModel();
			this._oDataModel.setDefaultCountMode(sap.ui.model.odata.CountMode.Inline);
			this._oDataModel.setRefreshAfterChange(false);
			this._oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this._oDataModel.attachPropertyChange(this.onPropertyChange, this);
			
			var aDeferredGroups = this._oDataModel.getDeferredGroups();
			if (aDeferredGroups.indexOf("Changes") < 0) {
				aDeferredGroups.push("Changes");
				this._oDataModel.setDeferredGroups(aDeferredGroups);
			}
			/*
			this._oDataModel.setChangeBatchGroups({
				"*": {
					batchGroupId: "Changes",
					changeSetId: "Changes",
					single: false
				}
			});			
			*/
			this._oEditDeferred = $.Deferred();
			this._oEditDeferred.resolve();

			this._oEarliestStartDate = null;
			this._oLatestFinishDate = null;
			this._bIsDraftModified = false;

			this._oMetadataAnalyser = null;

			this._oDataModel.getMetaModel().loaded().then(function () {
				this._parseMetadata();
			}.bind(this));

			this._oDataPath = {
				taskPath: "/C_EnterpriseProjElementPlanTP",
				projectPath: "/C_EnterpriseProjectPlanTP",
				taskNavigation: "to_Task",
				pmNavigation: "to_Manager",
				statusFunction: "/C_EnterpriseProjectPlanTPRead_status",
				editFunction: "/C_EnterpriseProjectPlanTPEdit",
				saveFunction: "/C_EnterpriseProjectPlanTPActivation",
				preparation:"/C_EnterpriseProjectPlanTPPreparation",
				copyFunction:"/A12ED8E57C25E42D6BF245FCCopy_workpackage",
				addFunction:"/A12ED8E57C25E42D6BF245FC7Add_workpackage",
				deleteFunction:"/A12ED8E57C25E42D6BF245Delete_workpackage",
				releaseStatus:"/C_EnterpriseProjElementPlanTPRelease",
				completeStatus:"/A12ED8E57C25E42D6BF2Technically_complete",
				closeStatus:"/C_EnterpriseProjElementPlanTPClose",
				lockStatus:"/C_EnterpriseProjElementPlanTPLock",
				unlockStatus:"/C_EnterpriseProjElementPlanTPUnlock",
				indentFunction:"/C_EnterpriseProjElementPlanTPIndent",
				outdentFunction:"/C_EnterpriseProjElementPlanTPOutdent",
				moveupFunction:"/C_EnterpriseProjElementPlanTPMoveup",
				movedownFunction:"/C_EnterpriseProjElementPlanTPMovedown"
			};

			this._oHeaderModel = new sap.ui.model.json.JSONModel();
			this._oHeaderData = this._oHeaderData || {
				ProjectName: null,
				Project: null,
				ProcessingStatusText: null,
				ProjectProfileCodeText: null,
				PersonFullName: null,
				WBSElementObject: null,
				EarliestStartDate: null,
				LatestFinishDate: null
			};
			this._oHeaderModel.setData(this._oHeaderData);

			this._oUIModel = new sap.ui.model.json.JSONModel();
			this._oUIData = {
				editable: false,
				messageCount: 0
			};
			this._oUIModel.setData(this._oUIData);

			this._oStatusData = {
				status: null,
				taskUUID: null
			};
			this._oStatusModel = new sap.ui.model.json.JSONModel();
			this._oStatusModel.setData(this._oStatusData);

			this._oLegendModel = new sap.ui.model.json.JSONModel();
			this._oLegendModel.setData([{
				"LegendRowConfigs": [{
					"text": this.i18nBundle.getText("LABEL_LEGEND_PROJECT"),
					"shapeName": "project",
					"shapeClass": "sap.gantt.simple.BaseRectangle"
				}, {
					"text": this.i18nBundle.getText("LABEL_LEGEND_WORK_PACKAGE"),
					"shapeName": "task",
					"shapeClass": "sap.gantt.simple.BaseRectangle"
				}]
			}]);
			
			this._nFirstVisibleRow = 0;
			this._bAppValid = true;
			//this._bCoPilotContextsReady = false;      
			this._oCoPilotContexts = [{
				listGroupName:null,
				aContexts:[]
			}];

			this._aMandatoryColumns = ["ColTaskID", "ColCostCenter", "ColProfitCenter"];
			
			this._operations = {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			};			
			//filed name <==> column name, to be compatible with earlier version. new column will use metadata name
			this._oFieldMapping = 
			{
				TaskName: this.i18nBundle.getText("LABEL_OBJECT_NAME"),
				Task : this.i18nBundle.getText("LABEL_TASK_ID"),
				ProcessingStatus : this.i18nBundle.getText("LABEL_PROCESSING_STATUS"),
				PlannedStartDate : this.i18nBundle.getText("LABEL_START_DATETIME"),
				PlannedEndDate : this.i18nBundle.getText("LABEL_FINISH_DATETIME"),
				ResponsibleCostCenter : this.i18nBundle.getText("LABEL_COST_CENTER"),
				ProfitCenter : this.i18nBundle.getText("LABEL_PROFIT_CENTER"),
				Plant : this.i18nBundle.getText("LABEL_PLANT"),
				FunctionalArea : this.i18nBundle.getText("LABEL_FUNCTIONAL_AREA"),
				FactoryCalendar : this.i18nBundle.getText("LABEL_CALENDAR"),
				NmbrOfProjDmndRequests:this.i18nBundle.getText("LABEL_DEMAND")
			};			
			
			//used to check navigation authorization for Open In 
			this._aNavAuthorization = null;
			this._bIsRevenueProject = false;
		},

		/**
		 * init UI control.
		 *
		 * @private
		 */
		_initControl: function () {
			this._oView = this.getView();
			this._oObjectPage = this._oView.byId("ObjectPageLayout");
			this._oActionButton = this._oView.byId("button_action");
			this._oOpenInButton = this._oView.byId("button_open_in");
			this._oEditButton = this._oView.byId("button_edit");
			this._oMsgButton = this._oView.byId("button_message");
			this._oBtnCopy = this._oView.byId("btnCopy");
			this._oBtnAdd = this._oView.byId("btnAdd");
			this._oBtnDelete = this._oView.byId("btnDelete");
			this._oBtnStatus = this._oView.byId("btnStatus");
			this._oBtnIndent = this._oView.byId("btnIndent");
			this._oBtnOutdent = this._oView.byId("btnOutdent");
			this._oBtnMoveUp = this._oView.byId("btnMoveUp");
			this._oBtnMoveDown = this._oView.byId("btnMoveDown");			
			this._oBtnSettings = this._oView.byId("btnSettings");
			this._oDraftIndication = this._oView.byId("draft_indication");
			this._oGanttContainer = this._oView.byId("ganttContainer");
			this._oGanttChart = this._oView.byId("ganttChartWithTable");
			this._oTreeTable = this._oView.byId("treeTable");
			this._oTreeTable.attachToggleOpenState(this.onToggleOpenState, this);
			this._oObjectMarker = this._oView.byId("objectMarker");

			this._oBtnExpand = this._oView.byId("btnExpand");
			this._oBtnCollapse = this._oView.byId("btnCollapse");
			this._oTabBar = this._oView.byId("idIconTabBarNoIcons");

			this._oBtnSave = this._oView.byId("button_save");
			this._oBtnCancel = this._oView.byId("button_cancel");

			this._oLinkProjectManager = this._oView.byId("linkProjectManager");
			this._oLinkProcessingStatus = this._oView.byId("linkProcessingStatus");

			this._oSmartVariant = this._oView.byId("btnSmartVariant");

			this._oActionSheet = null;
			this._oOpenInActionSheet = null;

			this._sBindingPath = "";
			this._oProjectHeader = null;
			this._bEditMode = false;
			this._bInitialFlag = true;
			this._bRendered = false;
			this._oNavigationHandler = null;

			this._sProjectUUID = null;
			this._bIsActiveEntity = true;
			this._sActiveUUID = null;

			this._oMessageManager = this._oMessageManager || sap.ui.getCore().getMessageManager();
			this._oView.setModel(this._oMessageManager.getMessageModel(), "message");
			this._oMessageManager.registerObject(this._oView, true);
			this._oMessageManager.removeAllMessages();

			this._oView.byId("projectHeaderTitle").setModel(this._oHeaderModel, "header");
			this._oView.byId("projectPageHeader").setModel(this._oHeaderModel, "header");

			this._oView.setModel(this._oUIModel, "ui");
			this._oGanttContainer.setModel(this._oLegendModel, "legend");
			this._oView.setModel(this._oStatusModel, "processing");
			
			this._createMessagePopover();
			
			this._oView.addStyleClass("sapUiSizeCompact");
		},

		/**
		 * init gantt chart control
		 *
		 * @private
		 */
		_initGanttChart: function () {
			var oRowSettings = new sap.gantt.simple.GanttRowSettings({
				highlight:{
					parts:[
						{path:'IsActiveEntity'},
						{path:'HasActiveEntity'}
					],
					formatter: Formatter.formatRowStatus
				},
				rowId: "{TaskUUID}",
				shapes1: new projectplanning.DynamicShape({
					shapeId: "{TaskUUID}",
					activeShape: {
						path: 'HierarchyNodeLevel',
						formatter: Formatter.formatShapeType
					},
					shapes: [
						new sap.gantt.simple.BaseChevron({
							time: {
								parts: [
									{ path: 'PlannedStartDate' },
									{ path: 'PlannedEndDate' }
								],
								formatter: Formatter.formatStartDate
							},
							endTime: {
								parts: [
									{ path: 'PlannedStartDate' },
									{ path: 'PlannedEndDate' }
								],
								formatter: Formatter.formatEndDate
							},
							fill: {
								path: "ProcessingStatus",
								formatter: function (sProcessingStatus) {
									if (sProcessingStatus === "20" || sProcessingStatus === "40" || sProcessingStatus === "42") {
										return Formatter.colorDef.shape.PhaseDone;
									} else {
										return Formatter.colorDef.shape.PhaseOpen;
									}
								}
							},
							tooltip: {
								parts: [
									{ path: "Task" },
									{ path: "TaskName" },
									{ path: "PlannedStartDate" },
									{ path: "PlannedEndDate" }
								],
								formatter: Formatter.formatTooltip.bind(Formatter)
							},
							height: 19,
							hoverable: true
						}),
						new sap.gantt.simple.BaseRectangle({
							time: {
								parts: [
									{ path: 'PlannedStartDate' },
									{ path: 'PlannedEndDate' }
								],
								formatter: Formatter.formatStartDate
							},
							endTime: {
								parts: [
									{ path: 'PlannedStartDate' },
									{ path: 'PlannedEndDate' }
								],
								formatter: Formatter.formatEndDate
							},
							fill: {
								path: "ProcessingStatus",
								formatter: function (sProcessingStatus) {
									if (sProcessingStatus === "20" || sProcessingStatus === "40" || sProcessingStatus === "42") {
										return Formatter.colorDef.shape.TaskDone;
									} else {
										return Formatter.colorDef.shape.TaskOpen;
									}
								}
							},
							tooltip: {
								parts: [
									{ path: "Task" },
									{ path: "TaskName" },
									{ path: "PlannedStartDate" },
									{ path: "PlannedEndDate" }
								],
								formatter: Formatter.formatTooltip.bind(Formatter)
							},
							height: 19,
							hoverable: true
						})
					]
				})
			});
			this._oTreeTable.setRowSettingsTemplate(oRowSettings);
			this._oGanttChart.setAxisTimeStrategy(this._createAxisTimeStrategy());
			this._oGanttChart.setModel(this._oDataModel);
		},

		/**
		 * create share action sheet popover
		 *
		 * @private
		 */
		_createActionSheet: function () {
			this._oActionSheet = this._oActionSheet || new sap.m.ActionSheet({
				showCancelButton: false,
				buttons: [
					new sap.m.Button({
						icon: "sap-icon://email",
						text: this.i18nBundle.getText("BUTTON_SEND_EMAIL"),
						press: $.proxy(this.shareEmailPressed, this)
					}),
					new sap.m.Button({
						icon: "sap-icon://share-2",
						text: this.i18nBundle.getText("BUTTON_JAM_SHARE"),
						press: $.proxy(this.shareJamPressed, this)
					}),
					new sap.ushell.ui.footerbar.AddBookmarkButton({
						title: this.i18nBundle.getText("appTitle"),
						subtitle: this._oHeaderData.Project,
						info: this._oHeaderData.ProjectName
					})
				],
				placement: sap.m.PlacementType.Bottom
			});
		},

		/**
		 * create open in action sheet popover
		 *
		 * @private
		 */
		_createOpenInActionSheet: function () {
			
			var aButtons = [];
			var oButton = null;
			if(this._aNavAuthorization[0] && this._aNavAuthorization[0].supported)
			{
				oButton = new sap.m.Button({
					visible: "{= !${ui>/editable}}",
					text: this.i18nBundle.getText("BUTTON_PROJECT_BUILDER"),
					press: $.proxy(this.onProjectBuilderPress, this)
				});
				aButtons.push(oButton);
			}
			
			if(this._aNavAuthorization[1] && this._aNavAuthorization[1].supported)
			{
				oButton = new sap.m.Button({
					text: this.i18nBundle.getText("BUTTON_PROJECT_CONTROL"),
					press: $.proxy(this.onProjectControlPress, this)
				});
				aButtons.push(oButton);
			}		
			
			if(this._aNavAuthorization[2] && this._aNavAuthorization[2].supported)
			{
				oButton = new sap.m.Button({
					visible: "{= !${ui>/editable}}",
					text: this.i18nBundle.getText("BUTTON_MONITOR_PROJECT"),
					press: $.proxy(this.onMonitorProjectPress, this)
				});
				aButtons.push(oButton);
			}			
			
			if(this._aNavAuthorization[3] && this._aNavAuthorization[3].supported)
			{
				oButton = new sap.m.Button({
					visible: "{= !${ui>/editable}}",
					text: this.i18nBundle.getText("BUTTON_PROJECT_COST"),
					press: $.proxy(this.onProjectCostPress, this)
				});
				aButtons.push(oButton);
			}		
			
			if(this._aNavAuthorization[4] && this._aNavAuthorization[4].supported)
			{
				oButton = new sap.m.Button({
					visible: "{= !${ui>/editable}}",
					text: this.i18nBundle.getText("BUTTON_PROJECT_BUDGET"),
					press: $.proxy(this.onProjectBudgetPress, this)
				});
				aButtons.push(oButton);
			}	
			
			if(this._aNavAuthorization[5] && this._aNavAuthorization[5].supported)
			{
				oButton = new sap.m.Button({
					visible: "{= !${ui>/editable}}",
					text: this.i18nBundle.getText("BUTTON_PROJECT_PROCUREMENT"),
					press: $.proxy(this.onProjectProcurementPress, this)
				});
				aButtons.push(oButton);
			}			
			
			if(this._aNavAuthorization[6] && this._aNavAuthorization[6].supported)
			{
				oButton = new sap.m.Button({
					text: this.i18nBundle.getText("BUTTON_PROJECT_BRIEF"),
					press: $.proxy(this.onProjectBriefPress, this)
				});
				aButtons.push(oButton);
			}	
	
			
			this._oOpenInActionSheet = this._oOpenInActionSheet || new sap.m.ActionSheet({
				showCancelButton: false,
				buttons: aButtons,
				placement: sap.m.PlacementType.Bottom
			});

			this._oOpenInActionSheet.setModel(this._oUIModel, "ui");
		},

		/**
		 * release processing status button pressed event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */		
		onReleaseButtonPressed:function(oEvent){
			this.onStatusChanged(oEvent, this._oDataPath.releaseStatus);
		},
		
		/**
		 * complete processing status button pressed event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */				
		onCompleteButtonPressed:function(oEvent){
			this.onStatusChanged(oEvent, this._oDataPath.completeStatus);
		},

		/**
		 * close processing status button pressed event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */		
		onCloseButtonPressed:function(oEvent){
			this.onStatusChanged(oEvent, this._oDataPath.closeStatus);
		},

		/**
		 * lock processing status button pressed event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */		
		onLockButtonPressed:function(oEvent){
			this.onStatusChanged(oEvent, this._oDataPath.lockStatus);
		},

		/**
		 * unlock processing status button pressed event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */		
		onUnlockButtonPressed:function(oEvent){
			this.onStatusChanged(oEvent, this._oDataPath.unlockStatus);
		},
		
		

		/**
		 * parse navigation related parameter from x-appstate
		 *
		 * @param {object}
		 *            oAppData: which contains the navigation-related selection variant as a JSON-formatted string
		 * @param {object}
		 *            oURLParameters: url parameters. we ignored all the url parameters.
		 * @param {string}
		 *            sNavType: navigation type
		 *
		 * @private
		 */
		_parseNaviationParameter: function (oAppData, oURLParameters, sNavType) {
			var bNavigationBack = false;
			if (sNavType === sap.ui.generic.app.navigation.service.NavType.xAppState) {
				var oSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant(oAppData.selectionVariant);
				var aPara = oSelectionVariant.getSelectOption("ProjectUUID");
				if (aPara && aPara.length) {
					this._sProjectUUID = aPara[0].Low.toUpperCase();
				}
				this._sActiveUUID = this._sProjectUUID;
				aPara = oSelectionVariant.getSelectOption("IsActiveEntity");
				if (aPara && aPara.length) {
					this._bIsActiveEntity = aPara[0].Low;
				}
			} else if (sNavType === sap.ui.generic.app.navigation.service.NavType.iAppState) {
				bNavigationBack = true;
				if (oAppData.customData) {
					this._sProjectUUID = oAppData.customData.ProjectUUID;
					this._bIsActiveEntity = oAppData.customData.IsActiveEntity;	
					this._sActiveUUID = oAppData.customData.ActiveUUID;
				} else {
					var oSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant(oAppData.selectionVariant);
					var aPara = oSelectionVariant.getSelectOption("ProjectUUID");
					if (aPara && aPara.length) {
						this._sProjectUUID = aPara[0].Low.toUpperCase();
					}
					this._sActiveUUID = this._sProjectUUID;

					aPara = oSelectionVariant.getSelectOption("IsActiveEntity");
					if (aPara && aPara.length) {
						this._bIsActiveEntity = aPara[0].Low;
					}
				}
			}

			//this._sProjectUUID = "42F2E9AF-C507-1EE9-9FBF-98379C5E22AE"; // Project to test WP : HWP_20181030104415
			// this._sProjectUUID = "42F2E9AF-C507-1EE9-9FBF-98379C5E22AE";
			//this._bIsActiveEntity = "true";

			if (this._bIsActiveEntity === "false") {
				this._bEditMode = true;
			} else {
				this._bEditMode = false;
			}

			this._setUIByEditStatus();

			if (this._sProjectUUID && this._bIsActiveEntity !== null) {
				if (bNavigationBack && this._bEditMode) {
					this._checkDraftExist();
				} else {
					this._loadProjectData();
				}
			} else {
				var msg = this.i18nBundle.getText("MSG_INVALID_URL");
				this._showInvalidAppState(msg);
			}
		},

		_loadTaskList: function () {
			this._oView.setBusy(true);

			this._sProjectPath = this._oDataPath.projectPath + "(ProjectUUID=guid\'" + this._sProjectUUID + "\',IsActiveEntity=" + this._bIsActiveEntity +
				")";
			this._sBindingPath = this._sProjectPath + "/" + this._oDataPath.taskNavigation;

			this._oTreeTable.bindAggregation("rows", {
				path: this._sBindingPath,
				sorter: [new sap.ui.model.Sorter("HierarchyNodeOrdinalNumber")],
				parameters: {
					operationMode: "Server",
					treeAnnotationProperties: {
						hierarchyLevelFor: "HierarchyNodeLevel",
						hierarchyParentNodeFor: "ParentObjectUUID",
						hierarchyNodeFor: "TaskUUID",
						hierarchyDrillStateFor: "ProjElmntHierarchyDrillState",
						hierarchyNodeDescendantCountFor: "HierarchyNodeSubTreeSize"
					},
					numberOfExpandedLevels: 2,
					rootLevel: 0,
					restoreTreeStateAfterChange: true
				}
			});					

			this._oTreeTable.getBinding("rows").attachDataReceived(this.onDataReceived, this);
		},

		/**
		 * check project status after app restored
		 *
		 * @public
		 */
		_checkDraftExist: function () {
			var that = this;
			this._oView.setBusy(true);
			this._sProjectPath = this._oDataPath.projectPath + "(ProjectUUID=guid\'" + this._sProjectUUID + "\',IsActiveEntity=" + this._bIsActiveEntity +
				")";
			this._oDataModel.read(this._sProjectPath, {
				urlParameters: {
					$expand: "DraftAdministrativeData"
				},
				success: function (oData) {
					if (!oData.DraftAdministrativeData) //draft was deleted, need to switch display mode.
					{
						that._sProjectUUID = that._sActiveUUID;
						that._bIsActiveEntity = "true";
						that._bEditMode = false;
						that._setUIByEditStatus();
						that._resetProjectData();
						that._loadProjectData();
					} else { //draft still exist, update the project header, then load tree
						that._oHeaderData = oData;
						that._oHeaderModel.setData(that._oHeaderData);
						if(oData.DraftAdministrativeData.LastChangeDateTime > oData.DraftAdministrativeData.CreationDateTime){
							that._bIsDraftModified = true;
						}
						that._setAxisTime(oData.EarliestStartDate, oData.LatestFinishDate);
						that._loadTaskList();
					}
				},
				error: function (oEvent) {
					//draft was deleted, need to switch display mode.
					that._sProjectUUID = that._sActiveUUID;
					that._bIsActiveEntity = "true";
					that._bEditMode = false;
					that._setUIByEditStatus();
					that._resetProjectData();
					that._loadProjectData();
				}
			});
		},

		_setMandatoryColumnsLabel: function (bRequired) {
			var aColumns = this._oTreeTable.getColumns();
			aColumns.forEach(function (oColumn) {
				var aSplits = oColumn.getId().split("-");
				if (this._aMandatoryColumns.indexOf(aSplits[aSplits.length - 1]) !== -1) {
					oColumn.getLabel().setRequired(bRequired);
				}
			}, this);
		},

		/**
		 * set control visible according to edit state
		 *
		 * @private
		 */
		_setUIByEditStatus: function () {
			this._oUIData.editable = this._bEditMode;
			this._oUIModel.setData(this._oUIData);

			//hide edit button and object marker first.
			//1. display mode : will set the edit button visibility after got "Update_mc" from header
			//2. display mode : will set object marker after got DraftAdministrativeData from project header
			this._oEditButton.setVisible(false);
			this._oObjectMarker.setVisible(false);

			if (this._bEditMode) {
				//edit mode

				this._oBtnCopy.setVisible(true);
				this._oBtnCopy.setEnabled(false);
				this._oBtnAdd.setVisible(true);
				this._oBtnAdd.setEnabled(false);
				this._oBtnDelete.setVisible(true);					
				this._oBtnDelete.setEnabled(false);							
				this._oBtnIndent.setVisible(true);
				this._oBtnIndent.setEnabled(false);
				this._oBtnOutdent.setVisible(true);
				this._oBtnOutdent.setEnabled(false);
				this._oBtnMoveUp.setVisible(true);
				this._oBtnMoveUp.setEnabled(false);
				this._oBtnMoveDown.setVisible(true);
				this._oBtnMoveDown.setEnabled(false);
				this._oBtnStatus.setVisible(false);
				this._oBtnStatus.setEnabled(false);
				//this._oOpenInButton.setVisible(false);
				this._oDraftIndication.clearDraftState();
				this._oObjectPage.setShowFooter(true);
				this._setMandatoryColumnsLabel(true);
			} else {
				//display mode
				this._oBtnCopy.setVisible(false);
				this._oBtnAdd.setVisible(false);
				this._oBtnDelete.setVisible(false);
				this._oBtnStatus.setVisible(true);
				this._oBtnIndent.setVisible(false);
				this._oBtnOutdent.setVisible(false);
				//this._oOpenInButton.setVisible(true);
				this._oBtnMoveUp.setVisible(false);
				this._oBtnMoveDown.setVisible(false);				
				this._oBtnStatus.setEnabled(false);
				this._oObjectPage.setShowFooter(false);
				this._setMandatoryColumnsLabel(false);
			}
			//this._oMessageManager.removeAllMessages();
			this._removeNonTransientMessages();
			if (this._bRendered) {
				this._ajustLayout();
			}
		},
		
		/**
		 * show application error popover
		 * 
		 * @param {string}
		 *            sMsg: error message
		 * @private
		 */		
		_showInvalidAppState:function(sMsg){
			this._bAppValid = false;
			this._oActionButton.setEnabled(false);
			//this._oOpenInButton.setEnabled(false);
			var oToolbar = this._oGanttContainer.getToolbar();
			if(oToolbar)
			{
				oToolbar.setEnabled(false);
			}
			sap.m.MessageBox.error(sMsg);
		},

		/**
		 * remove Demand column from table
		 *
		 * @private
		 */		
		_removeDemandColumn:function(){
			var aColumns = this._oTreeTable.getColumns();
			var oLabel, sLableText;
			for(var i=0; i<aColumns.length; i++)
			{
				oLabel = aColumns[i].getLabel();
				if(oLabel && oLabel.getText)
				{
					sLableText = oLabel.getText();
				}
				
				if(sLableText === this._oFieldMapping["NmbrOfProjDmndRequests"])
				{
					this._oTreeTable.removeColumn(aColumns[i]);
					break;
				}
			}
			
		},

		/**
		 * Analyze startup parameter to decide OData filter.
		 *
		 * @private
		 */
		_initAppState: function () {
			var that = this;
			this._oNavigationHandler = this._oNavigationHandler || new sap.ui.generic.app.navigation.service.NavigationHandler(this);
			var oParseNavigationPromise = this._oNavigationHandler.parseNavigation();

			oParseNavigationPromise.done(function (oAppData, oURLParameters, sNavType) {
				that._parseNaviationParameter(oAppData, oURLParameters, sNavType);
			});

			oParseNavigationPromise.fail(function () {
				var msg = that.i18nBundle.getText("MSG_INVALID_URL");
				that._showInvalidAppState(msg);			
			});
			
			this._oCrossAppNav = this._oCrossAppNav || sap.ushell.Container.getService("CrossApplicationNavigation"); 
			 
		
			var oNavProjectBuilder = { 
				target: { 
					semanticObject: "Project", 
					action: "displayDetails" 
				}
			}; 
		
			var oNavProjectControl = { 
				target: { 
					semanticObject: "EnterpriseProject", 
					action: "maintain" 
				}
			}; 		

			var oNavMonitorProject = { 
				target: { 
					semanticObject: "EnterpriseProject", 
					action: "monitor" 
				}
			}; 	
			
			var oNavProjectCost = { 
				target: { 
					semanticObject: "Project", 
					action: "displayFinancialReport" 
				}
			}; 				
		
			var oNavProjectBudget = { 
				target: { 
					semanticObject: "EnterpriseProject", 
					action: "displayProjectBudget" 
				}
			}; 	

			var oNavProjectProcurement = { 
				target: { 
					semanticObject: "Project", 
					action: "manageProcurement" 
				}
			};	
			
			var oNavProjectBrief = { 
				target: { 
					semanticObject: "EnterpriseProject", 
					action: "showProjectBrief" 
				}
			};
			
			var oNavProjectDemand = { 
				target: { 
					semanticObject: "ProjectDemand", 
					action: "manage" 
				}
			};			
			
			var aArgs = [oNavProjectBuilder, oNavProjectControl, oNavMonitorProject, oNavProjectCost, oNavProjectBudget, oNavProjectProcurement, oNavProjectBrief, oNavProjectDemand];
			this._oCrossAppNav.isNavigationSupported(aArgs).then(function(aResponses)  
			{ 
				that._oOpenInButton.setEnabled(true);
				that._aNavAuthorization = aResponses;
				
				if(!(aResponses[7] && aResponses[7].supported))
				{
					that._removeDemandColumn();
				}
			}); 			
		},

		/**
		 * Analyze metadata to support field extension
		 *
		 * @return {array}
		 *              aIgnoredFields: ignored fields
		 *
		 * @private
		 */
		_parseMetadata: function () {
			var aIgnoredFields = ["TaskName","Task",  "ProcessingStatus", "PlannedStartDate", "PlannedEndDate", "ResponsibleCostCenter",
									"ProfitCenter","Plant", "FunctionalArea","FactoryCalendar", "NmbrOfProjDmndRequests"];
			this._oMetadataAnalyser = this._oMetadataAnalyser || new sap.ui.comp.odata.MetadataAnalyser(this._oDataModel);
			var aODataFields = this._oMetadataAnalyser.getFieldsByEntitySetName("C_EnterpriseProjElementPlanTP");

			if (aODataFields) {
				for (var x in aODataFields) {
					var sFieldName = aODataFields[x]["com.sap.vocabularies.Common.v1.FieldControl"] && aODataFields[x][
						"com.sap.vocabularies.Common.v1.FieldControl"
					].Path;
					if (sFieldName && aIgnoredFields.indexOf(sFieldName) < 0) {
						aIgnoredFields.push(sFieldName);
					}
					
					if(!aODataFields[x].visible)
					{
						if (aIgnoredFields.indexOf(aODataFields[x]) < 0) {
							aIgnoredFields.push(aODataFields[x]);
						}
					}
				}
				this._createExtensionField(aODataFields, aIgnoredFields);
			}

			this._createTablePersoController();

			return aIgnoredFields;
		},

		/**
		 * create new column to table if there is any extension filed in metadata
		 *
		 * @param {array}
		 *            aODataFields: fileds of latest OData Metadata
		 * @param {array}
		 *            aIgnoredFields: ignored fileds which should not to be displayed on table
		 *
		 * @private
		 */
		_createExtensionField: function (aODataFields, aIgnoredFields) {
			for (var i = 0; i < aODataFields.length; i++) {
				var oField = aODataFields[i];
				if (aIgnoredFields.indexOf(oField.name) > -1 || !oField.visible) {
					continue;
				}
				
				var sColumnName = oField.fieldLabel || oField.name;
				
				this._oFieldMapping[oField.name] = sColumnName;

				this._oGanttChart.getTable().addColumn(
					new sap.ui.table.Column({
						width: "200px",
						visible: false,
						name : sColumnName,
						label: new sap.m.Label({
							text: sColumnName
						}),
						template: new sap.ui.comp.smartfield.SmartField({
							value: {
								path: oField.name
							},
							contextEditable: "{= !${IsActiveEntity} }",
							customData: [
								new sap.ui.core.CustomData({
									key: "defaultInputFieldDisplayBehaviour",
									value: "descriptionOnly"
								})
							]
						})
					})
				);
			}
		},
		
		/**
		 * set copilot context, used to add object from screen
		 *
		 * @private
		 */		
		_updateCopilotContexts:function(){
			
			//var oRowContext = this._oTreeTable.getContextByIndex(0);
			//var sPath = oRowContext.getPath();
			//var oContext = new sap.ui.model.Context(this._oDataModel,sPath);
			//var sPath = this._oHeaderData.__metadata.id.split("/").pop();
			var sPath = this._oHeaderData.__metadata.id.substring(this._oHeaderData.__metadata.id.lastIndexOf("/"));
			var oContext = new sap.ui.model.Context(this._oDataModel,sPath);
			this._oCoPilotContexts[0].aContexts = [];
	 		this._oCoPilotContexts[0].aContexts.push(oContext);		
	 		this.getOwnerComponent().setCopilotContexts(this._oCoPilotContexts);
	 		
			//if(!this._bCoPilotContextsReady)	
			//{
				this._bCoPilotContextsReady = true;
				sap.ui.getCore().getEventBus().publish("sap.cp.ui.core.event.EventChannel", "CoPilotContextsReady");
			//}
		},

		/**
		 * remove billing element column from table
		 *
		 * @private
		 */		
		_removeBEColumn:function(){
			var aColumns = this._oTreeTable.getColumns();
			for(var i=0; i<aColumns.length; i++)
			{
				if(aColumns[i].getProperty("name") === this._oFieldMapping["WBSElementIsBillingElement"])
				{
					this._oTreeTable.removeColumn(aColumns[i]);
					break;
				}
			}
			
		},

		/**
		 * load task list
		 *
		 * @private
		 */
		_loadProjectData: function () {
			this._oView.setBusy(true);
			this._sProjectPath = this._oDataPath.projectPath + "(ProjectUUID=guid\'" + this._sProjectUUID + "\',IsActiveEntity=" + this._bIsActiveEntity +
				")";
			this._sBindingPath = this._sProjectPath + "/" + this._oDataPath.taskNavigation;
			var that = this;
			this._oDataModel.read(this._sProjectPath, {
				urlParameters: {
					$expand: "DraftAdministrativeData"
				},
				success: function (oData) { 
					that._oHeaderData = oData;
					that._oHeaderModel.setData(that._oHeaderData);
					that._updateCopilotContexts();
					that._setAxisTime(oData.EarliestStartDate, oData.LatestFinishDate);
					if("YP05" !== oData.ProjectProfileCode)
					{
						that._removeBEColumn();
					} else {
						that._bIsRevenueProject = true;
					}

					if ((oData.Update_mc) && (!that._bEditMode)) {
						that._oEditButton.setVisible(true);
					}
					
					if((!that._bEditMode) && (oData.DraftAdministrativeData))
					{
						if(oData.DraftAdministrativeData.DraftIsCreatedByMe)
						{ //own draft
							that._oObjectMarker.setType(sap.m.ObjectMarkerType.Draft);
						}
						else if(oData.DraftAdministrativeData.InProcessByUser)
						{ //locked 
							that._oObjectMarker.setType(sap.m.ObjectMarkerType.Locked);
						}
						else
						{ //unsaved changes
							that._oObjectMarker.setType(sap.m.ObjectMarkerType.Unsaved);
						}
						that._oObjectMarker.setVisible(true);
					}

					if (that._bEditMode) {
						that._sActiveUUID = oData.ActiveUUID;
						
						if(oData.DraftAdministrativeData && oData.DraftAdministrativeData.LastChangeDateTime && 
									oData.DraftAdministrativeData.CreationDateTime && 
									oData.DraftAdministrativeData.LastChangeDateTime > oData.DraftAdministrativeData.CreationDateTime)
						{
							that._bIsDraftModified = true;
						}
					}

				},
				error: function (oEvent) {
					that._handleErrorMessage(oEvent, that._operations.getCollection);
				}
			});

			this._oTreeTable.bindAggregation("rows", {
				path: this._sBindingPath,
				sorter: [new sap.ui.model.Sorter("HierarchyNodeOrdinalNumber")],
				parameters: {
					operationMode: "Server",
					treeAnnotationProperties: {
						hierarchyLevelFor: "HierarchyNodeLevel",
						hierarchyParentNodeFor: "ParentObjectUUID",
						hierarchyNodeFor: "TaskUUID",
						hierarchyDrillStateFor: "ProjElmntHierarchyDrillState",
						hierarchyNodeDescendantCountFor: "HierarchyNodeSubTreeSize"
					},
					numberOfExpandedLevels: 2,
					rootLevel: 0,
					restoreTreeStateAfterChange: true
				}
			});				


			this._oTreeTable.getBinding("rows").attachDataReceived(this.onDataReceived, this);
		},

		/**
		 * tree table data received event callback
		 *
		 * @param {object}
		 *            data: odata response data
		 * @public
		 */
		onDataReceived: function (data) {
			this._oView.setBusy(false);
			//this._updateCopilotContexts();
			var oBindings = this._oTreeTable.getBinding("rows");

			if (this._bInitialFlag) {
				this._bInitialFlag = false;
				this._ajustLayout();
			}
			oBindings.detachDataReceived(this.onDataReceived, this);
		},

		/**
		 * set axis time
		 *
		 * @param {object}
		 *            startTime: project start time.
		 *
		 * @param {object}
		 *            endTime: project end time.
		 *
		 * @private
		 */
		_setAxisTime: function (startTime, endTime) {
			if (!startTime || !endTime) {
				return;
			}
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMddHHmmss"
			});

			var sStartDate = oDateFormat.format(new Date(startTime.getTime() - 30 * 24 * 60 * 60 * 1000)); //one month before statr date
			var sEndDate = oDateFormat.format(new Date(endTime.getTime() + 30 * 24 * 60 * 60 * 1000)); // one month after end date

			var oTotalHorizon = new sap.gantt.config.TimeHorizon({
				startTime: sStartDate,
				endTime: sEndDate
			});
			var oZoomStrategy = this._createAxisTimeStrategy();
			oZoomStrategy.setTotalHorizon(oTotalHorizon);
			oZoomStrategy.setVisibleHorizon(oTotalHorizon);
			this._oGanttChart.setAxisTimeStrategy(oZoomStrategy);
		},

		/**
		 * create axis time strategy
		 *
		 * @return {object}
		 * 		oZoomStrategy: zoom strategy object
		 *
		 * @private
		 */
		_createAxisTimeStrategy: function () {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMddHHmmss"
			});

			var oToday = new Date();
			var sStartDate = oDateFormat.format(new Date(oToday.getTime() - 180 * 24 * 60 * 60 * 1000)); // half year ago from today
			var sEndDate = oDateFormat.format(new Date(oToday.getTime() + 180 * 24 * 60 * 60 * 1000)); // half year later from today

			var oTimeLineOptions = {
				"1day": {
					innerInterval: {
						unit: sap.gantt.config.TimeUnit.day,
						span: 1,
						range: 54
					},
					largeInterval: {
						unit: sap.gantt.config.TimeUnit.week,
						span: 1,
						pattern: "MMM yyyy, '" + this.i18nBundle.getText("LABEL_TIME_AXIS_WEEK") + "' ww"
					},
					smallInterval: {
						unit: sap.gantt.config.TimeUnit.day,
						span: 1,
						pattern: "EEE dd"
					}
				},
				"1week": {
					innerInterval: {
						unit: sap.gantt.config.TimeUnit.week,
						span: 1,
						range: 45
					},
					largeInterval: {
						unit: sap.gantt.config.TimeUnit.month,
						span: 1,
						pattern: "LLLL yyyy"
					},
					smallInterval: {
						unit: sap.gantt.config.TimeUnit.week,
						span: 1,
						pattern: "'" + this.i18nBundle.getText("LABEL_TIME_AXIS_CW") + "' w"
					}
				},
				"1month": {
					innerInterval: {
						unit: sap.gantt.config.TimeUnit.month,
						span: 1,
						range: 35
					},
					largeInterval: {
						unit: sap.gantt.config.TimeUnit.month,
						span: 3,
						pattern: "yyyy, QQQ"
					},
					smallInterval: {
						unit: sap.gantt.config.TimeUnit.month,
						span: 1,
						pattern: "LLL"
					}
				},
				"1quarter": {
					innerInterval: {
						unit: sap.gantt.config.TimeUnit.month,
						span: 3,
						range: 35
					},
					largeInterval: {
						unit: sap.gantt.config.TimeUnit.year,
						span: 1,
						pattern: "yyyy"
					},
					smallInterval: {
						unit: sap.gantt.config.TimeUnit.month,
						span: 3,
						pattern: "QQQ"
					}
				},
				"1year": {
					innerInterval: {
						unit: sap.gantt.config.TimeUnit.year,
						span: 1,
						range: 50
					},
					largeInterval: {
						unit: sap.gantt.config.TimeUnit.year,
						span: 5,
						pattern: "yyyy"
					},
					smallInterval: {
						unit: sap.gantt.config.TimeUnit.year,
						span: 1,
						pattern: "yyyy"
					}
				}
			};

			var oZoomStrategy = new sap.gantt.axistime.ProportionZoomStrategy({
				totalHorizon: new sap.gantt.config.TimeHorizon({
					startTime: sStartDate,
					endTime: sEndDate
				}),
				visibleHorizon: new sap.gantt.config.TimeHorizon({
					startTime: sStartDate,
					endTime: sEndDate
				}),

				coarsestTimeLineOption: oTimeLineOptions["1year"],
				finestTimeLineOption: oTimeLineOptions["1day"],
				timeLineOption: oTimeLineOptions["1year"],
				timeLineOptions: oTimeLineOptions
			});

			return oZoomStrategy;
		},

		/**
		 * get Transient Messages from message manager
		 *
		 * @param {boolean}
		 *            bTransient: transient flag. 
		 * 
		 * @return {array}
		 * 		aExpectMessages: array of expected message (transient or nontransient)
		 * 
		 * @private
		 */			
		_getExpectedMessages:function(bTransient)
		{
			var aExpectMessages = [], oMessage;
			var aMessages = this._oMessageManager.getMessageModel().getData();

			for (var i = 0; i < aMessages.length; i++) {
				oMessage = aMessages[i];
				if (oMessage.getPersistent() === bTransient) {
					aExpectMessages.push(oMessage);
				}
			}
			
			return aExpectMessages;
		},			
		

		/**
		 * delete NonTransient Messages from message manager
		 *
		 * @private
		 */		
		_removeNonTransientMessages:function()
		{
			var aNonTransientMessages = this._getExpectedMessages(false);
			if (aNonTransientMessages.length > 0) {
				this._oMessageManager.removeMessages(aNonTransientMessages);
			}
		},	


		/**
		 * delete Transient Messages from message manager
		 *
		 * @private
		 */		
		_removeTransientMessages:function()
		{
			var aTransientMessages = this._getExpectedMessages(true);
			if (aTransientMessages.length > 0) {
				this._oMessageManager.removeMessages(aTransientMessages);
			}
		},	


		/**
		 * delete action related Messages from message manager
		 *
		 * @private
		 */		
		_removeActionInfoMessages:function()
		{
			var oMessage;
			var aMessages = this._oMessageManager.getMessageModel().getData();
			for (var i = 0; i < aMessages.length; i++) 
			{
				oMessage = aMessages[i];
				if ((oMessage.getTarget() === this._oDataPath.taskPath) && (oMessage.getType() === sap.ui.core.MessageType.Information))
				{
					this._oMessageManager.removeMessages(oMessage);
				}
			}			
		},	

		/**
		 * retrieve OData error message.
		 *
		 * @param {object}
		 *            oError: OData response context.
		 * 
		 * @param {string}
		 *            sOperation: current operation.
		 * @private
		 */
		_handleErrorMessage: function (oError,sOperation) {
			if(oError)
			{
				var oResponse = {
					response: oError
				};
				var oErrorResponse = sap.ui.generic.app.util.MessageUtil.parseErrorResponse(oResponse);
				var sMessageText = oErrorResponse.messageText;
				var sMessageDescription = null;
				
				switch (oErrorResponse.httpStatusCode) {
					case "400":
						switch (sOperation) {
							case this._operations.modifyEntity:
								// if a draft patch failed with a 400 we rely on a meaningful message from the backend
								break;
							case this._operations.callAction:
								sMessageText = this.i18nBundle.getText("MSG_BAD_REQUEST_ACTION");
								break;
							case this._operations.deleteEntity:
								sMessageText = this.i18nBundle.getText("MSG_BAD_REQUEST_DELETE");
								break;
							case this._operations.editEntity:
								sMessageText = this.i18nBundle.getText("MSG_BAD_REQUEST_EDIT");
								break;
							case this._operations.saveEntity:
							case this._operations.activateDraftEntity:
								break;
							default:
								break;
						}
						break;	
					case "401":
						sMessageText = this.i18nBundle.getText("MSG_ERROR_AUTHENTICATED_FAILED");
						sMessageDescription = this.i18nBundle.getText("MSG_ERROR_AUTHENTICATED_FAILED_DESC");
						break;
					case "403":
						switch (sOperation) {
							case this._operations.callAction:
								sMessageText = this.i18nBundle.getText("MSG_ERROR_NOT_AUTORIZED_ACTION");
								break;
							case this._operations.deleteEntity:
								sMessageText = this.i18nBundle.getText("MSG_ERROR_NOT_AUTORIZED_DELETE");
								break;
							case this._operations.editEntity:
								sMessageText = this.i18nBundle.getText("MSG_ERROR_NOT_AUTORIZED_EDIT");
								break;
							default:
								sMessageText = this.i18nBundle.getText("MSG_ERROR_NOT_AUTORIZED");
								sMessageDescription = this.i18nBundle.getText("MSG_ERROR_NOT_AUTORIZED_DESC");
								break;
						}
						break;			
					default:
						break;
				}
	
				if (!oErrorResponse.containsTransientMessage) {
					sap.ui.generic.app.util.MessageUtil.addTransientErrorMessage(sMessageText, sMessageDescription, this._oDataModel);
				}				
			}
			
			var aTransientMessages = this._getExpectedMessages(true);
			if (aTransientMessages.length === 0) {
				return;
			}			
			var sState = sap.ui.core.ValueState.Success;
			var sTitle = this.i18nBundle.getText("LABEL_MESSAGES");
			for (var i = 0; i < aTransientMessages.length; i++) {
				var oMessage = aTransientMessages[i];
				if (oMessage.type === sap.ui.core.MessageType.Error) {
					// Error
					sState = sap.ui.core.ValueState.Error;
					sTitle = this.i18nBundle.getText("LABEL_ERROR");
					break;
				}
				if (oMessage.type === sap.ui.core.MessageType.Warning) {
					// Warning
					sState = sap.ui.core.ValueState.Warning;
					sTitle = this.i18nBundle.getText("LABEL_WARNING");
					continue;
				}
				if (oMessage.type === sap.ui.core.MessageType.Information || oMessage.type === sap.ui.core.MessageType.None) {
					// information
					sState = sap.ui.core.ValueState.None;
					sTitle = this.i18nBundle.getText("LABEL_MESSAGES");
					continue;
				}
			}

			if (!this._oMessageDialog) {
				this._createMessageDialog();
			}
			
			this._oMessageDialog.setState(sState);
			this._oMessageDialog.setTitle(sTitle);
			
			var oItemBinding = this._oMessageDialog.getContent()[0].getBinding("items");

			var	oErrorFilter = new sap.ui.model.Filter({
					path: "persistent",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: true
				});			
				
			var oActivationFilter = new sap.ui.model.Filter({
					path: "fullTarget",
					operator: sap.ui.model.FilterOperator.NotStartsWith,
					value1: this._oDataPath.preparation
				});				
				
			var oCurrentPersistentFilter = new sap.ui.model.Filter({
				filters: [oErrorFilter, oActivationFilter],
				and: true
			});				
				
			oItemBinding.filter(oCurrentPersistentFilter);				
			
			if (oItemBinding.getLength() > 0) {
				this._oMessageDialog.open();
			}
		},

		/**
		 * retrieve OData error message.
		 *
		 * @param {object}
		 *            oEvent: OData response context.
		 *
		 * @return {string}
		 * 		sMessage: OData error message
		 *
		 * @private
		 */
		_parseErrorMessage: function (oEvent) {
			var sMessage, oResponse;
			try {
				oResponse = jQuery.parseJSON(oEvent.responseText);
			} catch (err) {
				oResponse = null;
			}

			if (oResponse && oResponse.error && oResponse.error.message && oResponse.error.message.value) {
				sMessage = oResponse.error.message.value + "\r\n\r\n";
			} else {
				sMessage = " (" + oEvent.statusText + ")\r\n" + oEvent.message + "\r\n\r\n";
			}
			return sMessage;
		},

		/**
		 * adjust gantt chart height after rendering.
		 *
		 * @public
		 */
		onAfterRendering: function () {
			this._bRendered = true;
			this._ajustLayout();
		},

		/**
		 * adjust gantt chart height
		 *
		 * @private
		 */
		_ajustLayout: function () {
			var that = this;

			var oLayout = this._oView.byId("ObjectPageLayout");

			var iViewHeight = this._oView.$().height();
			var iHeaderTitleHeight = oLayout._getTitleAreaHeight();
			
			if (this._iHeaderContentHeight == null) {
				this._iHeaderContentHeight = oLayout.getHeader().$().get(0).getBoundingClientRect().height;
			}

			var iHeaderContentHeight = this._bHeaderTitleNotExpanded ? 0 : this._iHeaderContentHeight;
			//var iTabHeaderHeight = this._oTabBar._getIconTabHeader().$().height();

			var bShowFooter = oLayout.getShowFooter();
			var iPageFooterHeight = bShowFooter ? this._oObjectPage.getFooter().$().height() + 20 : 0;
			var iPageFooterPadding = 60;
			var iGanttHeight = iViewHeight;

			iGanttHeight = iViewHeight - iHeaderTitleHeight - iHeaderContentHeight - iPageFooterHeight - iPageFooterPadding;

			/*
			console.log("iGanttHeight===" + iGanttHeight, "=== iViewHeight ===", iViewHeight, "=== iHeaderTitleHeight ===", iHeaderTitleHeight,
						"===iHeaderContentHeight====", iHeaderContentHeight, "== this._iHeaderContentHeight ==", this._iHeaderContentHeight, "== iPageFooterHeight ==", iPageFooterHeight);
			*/
			
			this._oView.byId("ganttContainer").setHeight(iGanttHeight + "px");

			if (this._sResizeListenerId == null) {
				this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getView(), function () {
					that._ajustLayout.apply(that);
				});
			}
			if (!this._bAdjustToolbar) {
				this._oToolbar = this._oGanttContainer.getToolbar();
				this._oToolbar.removeContent(this._oBtnSettings);
				this._oToolbar.insertContent(this._oBtnSettings, this._oToolbar.getContent().length);
				this._oToolbar.removeContent(this._oToolbar.oToolbarSpacer);
				this._oToolbar.oToolbarSpacer = null;
				this._bAdjustToolbar = true;
			}
		},

		/**
		 * header state change event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 *
		 * @public
		 */
		onHeaderStateChange: function (oEvent) {
			this._bHeaderTitleNotExpanded = !oEvent.getParameters().isExpanded;
			this._ajustLayout();
		},

		/**
		 * initialize smart variant control
		 *
		 * @private
		 */
		_initSmartVariant: function () {
			var that = this;
			this._oCurrentVariant = "STANDARD";
			this._oTreeTable.fetchVariant = function () {
				if (that._oCurrentVariant === "STANDARD" || that._oCurrentVariant === null) {
					return {};
				}
				return that._oCurrentVariant;
			};

			this._oTreeTable.applyVariant = function (oVariantJSON, sContext) {
				that._oCurrentVariant = oVariantJSON;
				if (that._oCurrentVariant === "STANDARD") {
					that._oCurrentVariant = null;
				}
				
				that._setSelectedVariantToTable();
			};

			var oPersInfo = new sap.ui.comp.smartvariants.PersonalizableInfo({
				type: "table",
				keyName: "id"
			});

			oPersInfo.setControl(this._oTreeTable);
			this._oSmartVariant.addPersonalizableControl(oPersInfo);
			this._oSmartVariant.initialise(this.onVariantInitialised, this._oTreeTable);
		},

		/**
		 * variant initilised event callback
		 *
		 * @public
		 */
		onVariantInitialised: function () {
			if (!this._oCurrentVariant) {
				this._oCurrentVariant = "STANDARD";
			}
		},

		/**
		 * column settings changed event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */
		onVariantChange: function (oEvent) {
			var bDataChanged = oEvent.getParameter("dataChanged");
			if (bDataChanged) {
				var aColumnsData = [];
				var aColumns = this._oTreeTable.getColumns();
				aColumns.forEach(function (oColumn, index) {
					var aColumn = {};
					//aColumn.fieldName = oColumn.getProperty("name");
					aColumn.fieldName = oColumn.getLabel().getText();
					aColumn.Id = oColumn.getId();
					aColumn.index = index;
					aColumn.Visible = oColumn.getVisible();
					aColumnsData.push(aColumn);
				});
				this._oCurrentVariant = {
					"ColumnsVal": aColumnsData
				};
				this._oSmartVariant.currentVariantSetModified(true);
			}
		},

		/**
		 * apply variant to table, change column order and visibility.
		 *
		 * @private
		 */
		_setSelectedVariantToTable: function () {
			var aTableColumns = this._oTreeTable.getColumns();
			var aColumns;
			if (this._oCurrentVariant && this._oCurrentVariant.ColumnsVal) {
				aColumns = this._oCurrentVariant.ColumnsVal;
			} else {
				// null means the standard variant is selected or the variant which is not available, then show all columns
				aColumns = this._aInitialColumnsData;
			}
			
			// Hide all columns first
			aTableColumns.forEach(function (oColumn) {
				oColumn.setVisible(false);
			});
			// re-arrange columns according to the saved variant
			aColumns.forEach(function (aColumn) {
				var aTableColumn = $.grep(aTableColumns, function (el, id) {
					//return el.getProperty("name") === aColumn.fieldName;
					return el.getLabel().getText() === aColumn.fieldName;
				});
				if (aTableColumn.length > 0) {
					aTableColumn[0].setVisible(aColumn.Visible);
					this._oTreeTable.removeColumn(aTableColumn[0]);
					this._oTreeTable.insertColumn(aTableColumn[0], aColumn.index);
				}
			}.bind(this));
			if (this._oTPC) {
				this._oTPC.setCurrentColumns(aColumns);
			}
		},

		/**
		 * personalization setting button press event callback
		 *
		 * @public
		 */
		onP13nDialog: function () {
			var that = this;
			if (!this._oTPC) {
				this._createTablePersoController();
			}

			this._oTPC.openDialog({ 
				mandatoryColumns: this._aMandatoryColumns,
				toastMsg: that.i18nBundle.getText("MSG_DESELECT_ALL_SETTING")
			});
		},

		/**
		 * create table personalization controller
		 *
		 * @private
		 */
		_createTablePersoController: function () {
			var aColumnsData = [];
			var aColumns = this._oTreeTable.getColumns();
			aColumns.forEach(function (oColumn, index) {
				var aColumn = {};
				//aColumn.fieldName = oColumn.getProperty("name");
				aColumn.fieldName = oColumn.getLabel().getText();
				aColumn.Id = oColumn.getId();
				aColumn.index = index;
				aColumn.Visible = oColumn.getVisible();
				aColumnsData.push(aColumn);
			});
			this._aInitialColumnsData = aColumnsData;
			
			this._oTPC = this._oTPC || new TablePersoController({
				table: this._oTreeTable,
				persoDialogConfirm: $.proxy(this.onVariantChange, this)
			});
			this._oTPC.setCurrentColumns(aColumnsData);
		},

		/**
		 * check whether axis time changed
		 *
		 * @param {string}
		 *            sPath: which field was changed
		 * @param {object}
		 *            oValue: changed date property
		 * 
		 * @return {boolean} 
		 *			bChanged: whether time axis changed
		 * @private
		 */
		_checkAxisTime: function (sPath, oValue) {
			if ((this._oEarliestStartDate === null) || (this._oLatestFinishDate === null)) {
				this._oEarliestStartDate = this._oHeaderData.EarliestStartDate;
				this._oLatestFinishDate = this._oHeaderData.LatestFinishDate;
			}

			var nDiff = 0, bChanged = false;
			
			if(oValue)
			{
				if ((sPath === "PlannedStartDate") && (this._oEarliestStartDate)) {
					nDiff = Math.abs((this._oEarliestStartDate.getTime() - oValue.getTime()) / 86400000);
				} else if ((sPath === "PlannedEndDate") && (this._oLatestFinishDate)) {
					nDiff = Math.abs((this._oLatestFinishDate.getTime() - oValue.getTime()) / 86400000);
				}
			}
			
			if(nDiff >= 30)
			{
				bChanged = true;
			}			
			return bChanged;
		},

		/**
		 * OData model property change event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */
		onPropertyChange: function (oEvent) {
			var sField = oEvent.getParameter("path");
			var oValue = oEvent.getParameter("value");
			var oContext = oEvent.getParameter("context");
			var sPath = oContext.getPath();
			var oRowData = this._oDataModel.getProperty(sPath);
			var bNeedCheckTimeAxis = this._checkAxisTime(sField, oValue);
			var bNeedReadHeader = false;
			var bNeedRefreshTreeOfRevProj = false;

			var nIndex = -1;
			var aIndices = this._oTreeTable.getSelectedIndices();
			if(aIndices.length > 0)
			{
				nIndex = aIndices[0];
			}

			
			if((oRowData.HierarchyNodeLevel === 0) || bNeedCheckTimeAxis)
			{
				bNeedReadHeader = true;
			}
			
			//Judge if the project is a revenue project
			if(this._bIsRevenueProject && 
				(sField === "WBSElementIsBillingElement"
				|| (oRowData.WBSElementIsBillingElement === true && (sField === "ProfitCenter" || sField === "FunctionalArea")))){
				bNeedRefreshTreeOfRevProj = true;
			}	
			
			var that = this;

			var aDeferred = this._getDeferredObject();

			this._bIsDraftModified = true;

			var data = {};
			data[sField] = oValue;

			aDeferred[0].always(function () {
				that._oDraftIndication.showDraftSaving();
				that._removeTransientMessages();
				that._removeActionInfoMessages();
				that._oDataModel.update(sPath, data,{
					success: function () {
						that._oDraftIndication.showDraftSaved();
						that._handleErrorMessage(null, that._operations.modifyEntity);
						
						//refresh the whole tree if user edit billing element
						if(bNeedRefreshTreeOfRevProj/*sField === "WBSElementIsBillingElement"*/)
						{
							var oBinding = that._oTreeTable.getBinding("rows");
							var oFunc = function(){
								aDeferred[1].resolve();
								if(nIndex > -1)
								{
									that._oTreeTable.setSelectedIndex(nIndex);	
								}
								that._oView.setBusy(false);
							};			
							that._oView.setBusy(true);
							oBinding._restoreTreeState().then(
								function () {
									oFunc();
								},
								function () {
									oFunc();
								}
							);
							
							// toast out a message if it is a change on  "WBSElementIsBillingElement"
							var hasBillingError = that.hasError(sPath , sField);
							if(
							   oRowData.WBSElementIsBillingElement === true 
						     && hasBillingError === false
						     && oRowData.ProjElmntHierarchyDrillState !== "leaf"
							){ 
								var sMessage = that._getChangeBESuccessMsg(oRowData);
								sap.m.MessageToast.show(sMessage);
							}
						}						
					},
					error: function (oError) {
						that._oDraftIndication.clearDraftState();
						that._handleErrorMessage(oError, that._operations.modifyEntity);
						if(bNeedRefreshTreeOfRevProj/*sField === "WBSElementIsBillingElement"*/)
						{
							aDeferred[1].resolve();
						}
					}
				});
				
				if(!bNeedRefreshTreeOfRevProj/*sField !== "WBSElementIsBillingElement"*/)
				{
					that._oDataModel.read(sPath, {
						success: function (oData) {
							if(!bNeedReadHeader)
							{
								aDeferred[1].resolve();
							}
							if ((oRowData.HierarchyNodeLevel === 0) && ((sField === "TaskName") || (sField === "Task"))) {
								that._oHeaderData.Project = oData.Task;
								that._oHeaderData.ProjectName = oData.TaskName;
								that._oHeaderModel.setData(that._oHeaderData);
							}
						},
						error: function () {
							if(!bNeedReadHeader)
							{
								aDeferred[1].resolve();
							}
						}
					});
					
					if(bNeedReadHeader)
					{
						that._oDataModel.read(that._sProjectPath, {
							success: function (oData) {
								aDeferred[1].resolve();
								if(bNeedCheckTimeAxis)
								{
									if (oData.EarliestStartDate && oData.LatestFinishDate) {
										that._oEarliestStartDate = oData.EarliestStartDate;
										that._oLatestFinishDate = oData.LatestFinishDate;
										that._setAxisTime(that._oEarliestStartDate, that._oLatestFinishDate);
									}
								}
							},
							error: function () {
								aDeferred[1].resolve();
							}
						});					
					}					
				}
			});
		},

		/**
		 * processing status link click event callback
		 *
		 * @public
		 */
		openProcessingStatus: function () {
			var that = this;
			if (!this.oStatusQuickView) {
				this.oStatusQuickView = new sap.m.QuickView({
					placement: "Auto",
					pages: [
						new sap.m.QuickViewPage({
							header: that.i18nBundle.getText("TITLE_STATUS_QUICKVIEW"),
							groups: [
								new sap.m.QuickViewGroup({
									elements: [
										new sap.m.QuickViewGroupElement({
											label: that.i18nBundle.getText("LABEL_PROCESSING_STATUS"),
											value: "{quickView>/ProcessingStatus}"
										}),
										new sap.m.QuickViewGroupElement({
											label: that.i18nBundle.getText("LABEL_SYSTEM_STATUS"),
											value: "{quickView>/SystemStatus}"
										})
									]
								})
							]
						})
					]
				});

				this._oProcessingStatusModel = new sap.ui.model.json.JSONModel();
				this.oStatusQuickView.setModel(this._oProcessingStatusModel, "quickView");
			}

			var wbsElement = this._oHeaderData.WBSElementObject;
			var processingStatus = this._oHeaderData.ProcessingStatusText;

			this._oDataModel.callFunction(this._oDataPath.statusFunction, {
				method: "POST",
				urlParameters: {
					"Id": wbsElement,
					"IsActiveEntity": this._bIsActiveEntity,
					"ProjectUUID": this._sProjectUUID
				},
				success: function (data, response) {
					var strStatus = "";
					for (var i = 0; i < data.results.length; i++) {
						if (i > 0) {
							strStatus += "\r\n";
						}
						strStatus += data.results[i].StatusT;
					}

					var oData = {
						ProcessingStatus: processingStatus,
						SystemStatus: strStatus
					};

					that._oProcessingStatusModel.setData(oData);
					that.oStatusQuickView.openBy(that._oLinkProcessingStatus);
				},
				error: function (oEvent) {
					var oData = {
						ProcessingStatus: processingStatus,
						SystemStatus: ""
					};
					that._oProcessingStatusModel.setData(oData);
					that.oStatusQuickView.openBy(that._oLinkProcessingStatus);
				}
			});
		},

		/**
		 * project manager link click event callback
		 *
		 * @public
		 */
		openProjectManager: function () {
			var that = this;
			if (!this.oPMQuickView) {
				this.oPMQuickView = new sap.m.QuickView({
					placement: "Auto",
					pages: [
						new sap.m.QuickViewPage({
							title: "{PersonFullName}",
							icon: "sap-icon://person-placeholder",
							groups: [
								new sap.m.QuickViewGroup({
									elements: [
										new sap.m.QuickViewGroupElement({
											label: that.i18nBundle.getText("LABEL_EMAIL_ADDRESS"),
											value: "{DefaultEmailAddress}",
											type: sap.m.QuickViewGroupElementType.email,
											visible:"{= !!${DefaultEmailAddress}}"
										}),
										new sap.m.QuickViewGroupElement({
											label: that.i18nBundle.getText("LABEL_PHONE_NUMBER"),
											value: "{PhoneNumber}",
											type: sap.m.QuickViewGroupElementType.phone,
											visible:"{= !!${PhoneNumber}}"
										}),
										new sap.m.QuickViewGroupElement({
											label: that.i18nBundle.getText("LABEL_MOBILE_NUMBER"),
											value: "{MobilePhoneNumber}",
											type: sap.m.QuickViewGroupElementType.phone,
											visible:"{= !!${MobilePhoneNumber}}"
										})
									]
								})
							]
						})
					]
				});
				this.oPMQuickView.setModel(this._oDataModel);
			}

			var sPath = this._sProjectPath + "/" + this._oDataPath.pmNavigation;
			this.oPMQuickView.bindElement({
				path: sPath
			});
			this.oPMQuickView.openBy(this._oLinkProjectManager);
		},

		/**
		 * expand all button click event callback
		 *
		 * @public
		 */
		onExpandPressed: function () {
			this._oView.setBusy(true);
			this._oTreeTable.getBinding("rows").attachDataReceived(this.onDataReceived, this);
			this._oTreeTable.expandToLevel(100);
			this._oTreeTable.fireToggleOpenState();
		},

		/**
		 * collapse all button click event callback
		 *
		 * @public
		 */
		onCollapsePressed: function () {
			/*
			var oBindings = this._oTreeTable.getBinding("rows");
			var aNodes = oBindings.getNodes();
			var nLen = aNodes.length;
			var i;

			for (i = nLen - 1; i >= 0; i--) {
				if (this._oTreeTable.isExpanded(i)) {
					this._oTreeTable.collapse(i);
				}
			}
			*/
			this._oView.setBusy(true);
			this._oTreeTable.getBinding("rows").attachDataReceived(this.onDataReceived, this);
			this._oTreeTable.expandToLevel(1);
			this._oTreeTable.fireToggleOpenState();
		},

		/**
		 * call OData function to switch to edit mode,
		 * no PreserveChanges flag was sent, a non-locking draft of another user will be overwritten.
		 *
		 * @private
		 */
		_editEntity: function () {
			var that = this;
			this._oView.setBusy(true);
			this._removeTransientMessages();
			this._oDataModel.callFunction(this._oDataPath.editFunction, {
				method: "POST",
				urlParameters: {
					ProjectUUID: this._sProjectUUID,
					IsActiveEntity: true
				},
				success: function (data, response) {
					that._sProjectUUID = data.ProjectUUID;
					that._bIsActiveEntity = "false";
					that._bEditMode = true;
					that._loadProjectData();
					that._setUIByEditStatus();
					that._resetProjectData();
					that._handleErrorMessage(null, that._operations.editEntity);
				},
				error: function (oResponse) {
					that._oView.setBusy(false);
					that._handleErrorMessage(oResponse, that._operations.editEntity);
				}
			});
		},

		/**
		 * This dialog is opened when the user wants to edit an entity, for which a non-locking draft of another user exists.
		 * The dialog asks the user, whether he wants to continue editing anyway. If this is the case editing is triggered.
		 *
		 * @private
		 */
		_createUnsaveChangesDialog: function () {
			var that = this;
			this._oUnsaveChangesDialog = this._oUnsaveChangesDialog || new sap.m.Dialog({
				title: this.i18nBundle.getText("LABEL_WARNING"),
				titleAlignment: sap.m.TitleAlignment.Center,
				state: sap.ui.core.ValueState.Warning,
				content: [
					new sap.m.Text({
						text: "{Dialog>/unsavedChangesQuestion}"
					})
				],
				buttons: [
					new sap.m.Button({
						text: this.i18nBundle.getText("BUTTON_EDIT"),
						press: function () {
							that._oUnsaveChangesDialog.close();
							that._editEntity();
						}
					}),
					new sap.m.Button({
						text: this.i18nBundle.getText("BUTTON_CANCEL"),
						press: function () {
							that._oUnsaveChangesDialog.close();
						}
					})
				]
			});

			this._oUnsaveChangesDialog.addStyleClass("sapUiContentPadding");
			this._oDialogModel = this.oDialogModel || new sap.ui.model.json.JSONModel({
				unsavedChangesQuestion: ""
			});
			this._oUnsaveChangesDialog.setModel(this._oDialogModel, "Dialog");
		},

		/**
		 * check whether project was locked by others.
		 * If oError is faulty the method is called at the beginning of the editing process. In this case this method  must find out whether
		 *	 a) Another user possesses a locking draft for the entity
		 *	 b) Another user possesses a non-locking draft for the entity
		 *	 c) No draft exists for this object
		 *
		 * @param {object}
		 *            oError: object that was returned from the backend..
		 *
		 * @private
		 */
		_checkUserLock: function (oError) {
			var that = this;
			this._removeTransientMessages();
			this._oDataModel.read(this._sProjectPath, {
				urlParameters: {
					$expand: "DraftAdministrativeData"
				},
				success: function (oData) {
					var sMsg;
					if (!oData.DraftAdministrativeData) { // no draft exists for the object at all
						if (oError) { // It seems that the draft that was responsible for producing oError has meanwhile vanished
							that._oView.setBusy(false);
							sMsg = that._parseErrorMessage(oError);
							sap.m.MessageBox.error(sMsg);
						}
					} else {
						if (oData.DraftAdministrativeData.InProcessByUser) { // locked by other user
							that._oView.setBusy(false);
							sMsg = that._parseErrorMessage(oError);
							sap.m.MessageBox.error(sMsg);
						} else {
							//unsaved draft exist
							var sUserDescription = oData.DraftAdministrativeData.CreatedByUserDescription || oData.DraftAdministrativeData.CreatedByUser;
							var sDialogContentText = that.i18nBundle.getText("MSG_DRAFT_LOCKED_BY_USER", [sUserDescription]);
							if (!that._oUnsaveChangesDialog) {
								that._createUnsaveChangesDialog();
							}
							that._oDialogModel.setProperty("/unsavedChangesQuestion", sDialogContentText);
							that._oView.setBusy(false);
							that._oUnsaveChangesDialog.open();
						}
					}

				},
				error: function (oEvent) {
					that._oView.setBusy(false);
					that._handleErrorMessage(oEvent, that._operations.editEntity);
				}
			});
		},

		/**
		 * edit button press event callback
		 * call OData function to switch to edit mode,
		 * set PreserveChanges to true, we must ensure that a non-locking draft of another user is not overwritten without notice.
		 *
		 * @public
		 */
		onEditPress: function () {
			var that = this;
			var aDeferred = this._getDeferredObject();
			aDeferred[0].always(function () {
				if(that._bEditMode === true)
				{
					aDeferred[1].resolve();
					return;
				}
				that._oView.setBusy(true);
				that._removeTransientMessages();
				that._oDataModel.callFunction(that._oDataPath.editFunction, {
					method: "POST",
					urlParameters: {
						PreserveChanges: true,
						ProjectUUID: that._sProjectUUID,
						IsActiveEntity: true
					},
					success: function (data, response) {
						that._sProjectUUID = data.ProjectUUID;
						that._bIsActiveEntity = "false";
						that._bEditMode = true;
						aDeferred[1].resolve();						
						that._loadProjectData();
						that._setUIByEditStatus();
						that._resetProjectData();
						that._handleErrorMessage(null, that._operations.editEntity);
					},
	
					error: function (oResponse) {
						aDeferred[1].resolve();
						if (oResponse && oResponse.statusCode === "409") {
							that._removeTransientMessages();
							that._checkUserLock(oResponse);
						} else {
							that._oView.setBusy(false);
							that._handleErrorMessage(oResponse, that._operations.editEntity);
						}
					}
				});				
			});
		},

		/**
		 * save button press event callback
		 * call OData function to save draft
		 *
		 * @public
		 */
		onSavePress: function () {
			var that = this;
			var aDeferred = this._getDeferredObject();
			aDeferred[0].always(function () {
				if(that._bEditMode === false)
				{
					aDeferred[1].resolve();
					return;
				}				
				if (false === that._checkBeforeSave()) {
					var sTitle = that.i18nBundle.getText("LABEL_ERROR");
					that._oMessageDialog.setTitle(sTitle);					
					that._oMessageDialog.setState(sap.ui.core.ValueState.Error);
					that._oMessageDialog.open();
					aDeferred[1].resolve();
					return;
				}
				that._oView.setBusy(true);
				that._removeTransientMessages();
				that._oDataModel.callFunction(that._oDataPath.preparation, {
					method: "POST",
					batchGroupId:"Changes",
					changeSetId:"Changes",					
					urlParameters: {
						ProjectUUID: that._sProjectUUID,
						IsActiveEntity: false
					}
				});				
				that._oDataModel.callFunction(that._oDataPath.saveFunction, {
					method: "POST",
					batchGroupId:"Changes",
					changeSetId:"Activation",
					urlParameters: {
						ProjectUUID: that._sProjectUUID,
						IsActiveEntity: false
					},
					success: function (data, response) {
						that._sProjectUUID = data.ProjectUUID;
						that._bIsActiveEntity = "true";
						that._bEditMode = false;
						aDeferred[1].resolve();						
						that._loadProjectData();
						that._setUIByEditStatus();
						that._resetProjectData();
						that._handleErrorMessage(null, that._operations.activateDraftEntity);
					},
					error: function (oEvent) {
						aDeferred[1].resolve();
						that._oView.setBusy(false);
						that._handleErrorMessage(oEvent, that._operations.activateDraftEntity);
					}
				});
				that._oDataModel.submitChanges({groupId: "Changes"});
				
			});
		},

		/**
		 * delete draft, send delete odata request to backend.
		 *
		 * @private
		 */
		_deleteDraft: function () {
			var that = this;
			var activeUUID = this._oHeaderData.ActiveUUID;
			var aDeferred = this._getDeferredObject();
			aDeferred[0].always(function () {
				if(that._bEditMode === false)
				{
					aDeferred[1].resolve();
					return;
				}				
				that._oView.setBusy(true);				
				that._removeTransientMessages();
				that._oDataModel.remove(that._sProjectPath, {
					success: function () {
						that._sProjectUUID = activeUUID;
						that._bIsActiveEntity = "true";
						that._bEditMode = false;
						aDeferred[1].resolve();
						that._loadProjectData();
						that._setUIByEditStatus();
						that._resetProjectData();
						that._handleErrorMessage(null, that._operations.deleteEntity);
					},
					error: function (oEvent) {
						aDeferred[1].resolve();
						that._oView.setBusy(false);
						that._handleErrorMessage(oEvent, that._operations.deleteEntity);
					}
				});
			});
		},

		/**
		 * cancel button press event callback
		 * check whether draft is changed, prompt user to discard draft when draft changed
		 *
		 * @public
		 */
		onCancelPress: function () {
			if (this._bIsDraftModified) {
				if (!this._oDiscardDraftPopover) {
					this._createDiscardDraftPopover();
				}
				this._oDiscardDraftPopover.openBy(this._oBtnCancel);
			} else {
				this._deleteDraft();
			}
		},

		/**
		 * create discard draft popover
		 *
		 * @private
		 */
		_createDiscardDraftPopover: function () {
			var that = this;
			this._oDiscardDraftPopover = this._oDiscardDraftPopover || new sap.m.Popover({
				placement: sap.m.PlacementType.Top,
				showHeader: false,
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.Text({
								text: this.i18nBundle.getText("MSG_DISCARD_EDIT")
							}),
							new sap.m.Button({
								text: this.i18nBundle.getText("BUTTON_DISCARD"),
								width: "100%",
								press: function(){
									that._oDiscardDraftPopover.close();
									that._deleteDraft();
								}
								//$.proxy(this._deleteDraft, this)
							})
						]
					})
				]
			});

			this._oDiscardDraftPopover.addStyleClass("sapUiContentPadding");
		},

		/**
		 * reset navigation context after status changed, e.g. display -> edit, edit -> save, edit -> cancel
		 *
		 * @private
		 */
		_resetProjectData: function () {
			this._oEarliestStartDate = null;
			this._oLatestFinishDate = null;
			this._bIsDraftModified = false;
			if (this._oActionSheet) {
				this._oActionSheet.destroy();
				this._oActionSheet = null;
			}
			if (this._oObjectMarkerPopover) {
				this._oObjectMarkerPopover.destroy();
				this._oObjectMarkerPopover = null;
			}			
		},

		/**
		 * detail button event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */
		onDetailPressed: function (oEvent) {
			var nIndex = oEvent.getParameter("row").getIndex();
			var sBindingPath = this._oTreeTable.getContextByIndex(nIndex).getPath();
			var oRowData = this._oDataModel.getProperty(sBindingPath);
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};
			
			var oNavigationParameters;

			if (nIndex > 0) //user click on work package item
			{
				oNavigationParameters = {
					ProjectUUID: oRowData.ProjectUUID,
					TaskUUID: oRowData.TaskUUID,
					IsActiveEntity: this._bIsActiveEntity
				};
				this._oNavigationHandler.navigate("EnterpriseProject", "processProjectElement", oNavigationParameters, oInnerAppData, null);

			} else //user click on project header
			{
				oNavigationParameters = {
					ProjectUUID: this._sProjectUUID,
					IsActiveEntity: this._bIsActiveEntity
				};
				this._oNavigationHandler.navigate("EnterpriseProject", "maintain", oNavigationParameters, oInnerAppData, null);
			}
		},

		/**
		 * tree table expand/collapse event callback
		 * 
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */
		onToggleOpenState: function (oEvent) {
			this._oTreeTable.fireRowSelectionChange();
		},

		/**
		 * get row object by index
		 *
		 * @param {int}
		 *            nIndex: index number.
		 * 
		 * @return {object}
		 *		oRowData: row object
		 * 
		 * @private
		 */
		_getRowDataByIndex: function (nIndex) {
			var oContext = this._oTreeTable.getContextByIndex(nIndex);
			var oRowData = this._oDataModel.getProperty(oContext.getPath());
			return oRowData;
		},
		
		/**
		 * disable all action button
		 *
		 * @private
		 */		
		_disableActionButton:function(){
			this._oBtnCopy.setEnabled(false);
			this._oBtnAdd.setEnabled(false);
			this._oBtnDelete.setEnabled(false);
			this._oBtnIndent.setEnabled(false);
			this._oBtnOutdent.setEnabled(false);
			this._oBtnMoveUp.setEnabled(false);
			this._oBtnMoveDown.setEnabled(false);
		},

		/**
		 * row selection event callback
		 *
		 * @public
		 */
		onRowSelectionChange: function () {
			var aRowIndices = this._oTreeTable.getSelectedIndices();

			if (aRowIndices.length === 1) {
				this._oBtnAdd.setEnabled(true);
				if(aRowIndices[0] !== 0)
				{
					this._oBtnCopy.setEnabled(true);
					this._oBtnDelete.setEnabled(true);
					this._oBtnIndent.setEnabled(true);
					this._oBtnOutdent.setEnabled(true);
					this._oBtnMoveUp.setEnabled(true);
					this._oBtnMoveDown.setEnabled(true);
				}
				else
				{
					this._oBtnCopy.setEnabled(false);
					this._oBtnDelete.setEnabled(false);
					this._oBtnIndent.setEnabled(false);
					this._oBtnOutdent.setEnabled(false);
					this._oBtnMoveUp.setEnabled(false);
					this._oBtnMoveDown.setEnabled(false);
				}
			} else {
				this._disableActionButton();
			}

			if(!this._bEditMode)
			{
				if (aRowIndices.length === 1) {
					var oRowData = this._getRowDataByIndex(aRowIndices[0]);
					if (oRowData.WBSElementInternalID != 0) {
						this._oStatusData["status"] = oRowData.ProcessingStatus;
						this._oStatusData["taskUUID"] = oRowData.TaskUUID;
						this._oStatusModel.setData(this._oStatusData);
						this._oBtnStatus.setEnabled(true);						
					} else {
						this._oBtnStatus.setEnabled(false);
					}
				} else {
					this._oBtnStatus.setEnabled(false);
				}
			}
		},
		
		/**
		 * copy button press event callback
		 *
		 * @public
		 */
		onCopyPressed: function() {
			var oBinding = this._oTreeTable.getBinding("rows");
			var aRowIndices = this._oTreeTable.getSelectedIndices();
			if(aRowIndices.length !== 1)
			{//add action only enabled when one row selected
				return;
			}
			
			var oRowData = this._getRowInfoByIndex(aRowIndices[0])["data"];			
			var bCanCopy = false;
			
			if(oRowData.ProjectUUID !== "00000000-0000-0000-0000-000000000000")
			{
				bCanCopy = true;
			}
			
			if(bCanCopy)
			{
				var oNode = oBinding.getNodeByIndex(aRowIndices[0]);
				var nAddedRowIndex;
				if(aRowIndices[0] === 0)
				{
					nAddedRowIndex = 1;
				}
				else
				{
					if(this._oTreeTable.isExpanded(aRowIndices[0]))
					{
						nAddedRowIndex = aRowIndices[0] + oNode.magnitude + 1;
					}
					else
					{
						nAddedRowIndex = aRowIndices[0] + 1;
					}				
				}
				this._disableActionButton();
				var that = this;
				var aDeferred = this._getDeferredObject();
				aDeferred[0].always(function () {
					that._oView.setBusy(true);
					that._removeActionInfoMessages();
					that._removeTransientMessages();
					that._oDataModel.callFunction(that._oDataPath.copyFunction, {
						method: "POST",
						urlParameters: {
							TaskUUID:oRowData.TaskUUID,
							IsActiveEntity: false,
							HierarchyNodeLevel:oRowData.HierarchyNodeLevel
						},
						success: function (odata, response) {
							that._bIsDraftModified = true;
							oBinding._restoreTreeState().then(
								function () {
									aDeferred[1].resolve();
									oBinding._fireChange();
									setTimeout(function () {
										var nVisibleRowCount = that._oTreeTable.getVisibleRowCount();
										var nFirstVisibleRow = that._oTreeTable.getFirstVisibleRow();	
										var nNewFirstRow = nFirstVisibleRow;
										if(nAddedRowIndex >= (nVisibleRowCount + nFirstVisibleRow))
										{
											nNewFirstRow = nAddedRowIndex - Math.round(nVisibleRowCount / 2);
											that._oTreeTable.setFirstVisibleRow(nNewFirstRow);
										}
										that._oView.setBusy(false);	
										var sMsg = that.i18nBundle.getText("MSG_OBJECT_CREATED");
										sap.m.MessageToast.show(sMsg);
										that._oTreeTable.setSelectedIndex(nAddedRowIndex);
									}, 1000);
								},
								function () {
									aDeferred[1].resolve();
									oBinding._fireChange();
									that._oView.setBusy(false);
								}
							);						
						},
						error: function (oEvent) {
							aDeferred[1].resolve();
							that._oView.setBusy(false);
							that.onRowSelectionChange();
							that._handleErrorMessage(oEvent, that._operations.addEntry);
						}
					}); // End that._oDataModel.callFunction
				});	// End aDeferred[0].always			
			}//End if(bCanCopy)
			else
			{
				var sMsg = this.i18nBundle.getText("MSG_CAN_NOT_COPY");
				this._addInformationMessage(sMsg, null);				
			}
		},
		
		/**
		 * add button press event callback
		 *
		 * @public
		 */
		onAddPressed: function () {
			var oBinding = this._oTreeTable.getBinding("rows");
			var aRowIndices = this._oTreeTable.getSelectedIndices();
			if(aRowIndices.length !== 1)
			{//add action only enabled when one row selected
				return;
			}

			var oNode = oBinding.getNodeByIndex(aRowIndices[0]);
			var oRowContext = this._oTreeTable.getContextByIndex(aRowIndices[0]);
			var sBindingPath = oRowContext.getPath();
			var oRowData = this._oDataModel.getProperty(sBindingPath);	
			var nAddedRowIndex;
			if(aRowIndices[0] === 0)
			{
				nAddedRowIndex = 1;
			}
			else
			{
				if(this._oTreeTable.isExpanded(aRowIndices[0]))
				{
					nAddedRowIndex = aRowIndices[0] + oNode.magnitude + 1;
				}
				else
				{
					nAddedRowIndex = aRowIndices[0] + 1;
				}				
			}
			this._disableActionButton();
			var that = this;
			var aDeferred = this._getDeferredObject();
			aDeferred[0].always(function () {
				that._oView.setBusy(true);
				that._removeActionInfoMessages();
				that._removeTransientMessages();
				that._oDataModel.callFunction(that._oDataPath.addFunction, {
					method: "POST",
					urlParameters: {
						TaskUUID:oRowData.TaskUUID,
						IsActiveEntity: false,
						HierarchyNodeLevel:oRowData.HierarchyNodeLevel
					},
					success: function (odata, response) {
						that._bIsDraftModified = true;
						oBinding._restoreTreeState().then(
							function () {
								aDeferred[1].resolve();
								oBinding._fireChange();
								setTimeout(function () {
									var nVisibleRowCount = that._oTreeTable.getVisibleRowCount();
									var nFirstVisibleRow = that._oTreeTable.getFirstVisibleRow();	
									var nNewFirstRow = nFirstVisibleRow;
									if(nAddedRowIndex >= (nVisibleRowCount + nFirstVisibleRow))
									{
										nNewFirstRow = nAddedRowIndex - Math.round(nVisibleRowCount / 2);
										that._oTreeTable.setFirstVisibleRow(nNewFirstRow);
									}
									that._oView.setBusy(false);	
									var sMsg = that.i18nBundle.getText("MSG_OBJECT_CREATED");
									sap.m.MessageToast.show(sMsg);
									that._oTreeTable.setSelectedIndex(nAddedRowIndex);
									/*
									var oName = that._oTreeTable.getCellControl(nAddedRowIndex, 0, true);
									if(oName)
									{
										oName.focus();	
									}
									else
									{
										var aRows = that._oTreeTable.getRows();
										var oRow = aRows[nAddedRowIndex - nNewFirstRow];
										oName = oRow.getCells()[0];
										oName.focus();	
									}
									*/

								}, 1000);
								
							},
							function () {
								aDeferred[1].resolve();
								oBinding._fireChange();
								that._oView.setBusy(false);
							}
						);						
					},
					error: function (oEvent) {
						aDeferred[1].resolve();
						that._oView.setBusy(false);
						that.onRowSelectionChange();
						that._handleErrorMessage(oEvent, that._operations.addEntry);
					}
				});
			});			
		},

		/**
		 * Get message for successful deletion based on child count
		 *
		 * @param {object}
		 *            oRowData: row context.
		 * 
		 * @return {string}
		 *		sMessage: message for successful deletion
		 *
		 * @private
		 */
		_getDeleteSuccessMsg:function(oRowData){
			var sMessage;
			
			if(oRowData.ProjElmntHierarchyDrillState === "leaf")
			{
				sMessage = this.i18nBundle.getText("MSG_OBJECT_DELETED", [oRowData.Task]);	
			}
			else
			{
				sMessage = this.i18nBundle.getText("MSG_OBJECT_AND_CHILD_DELETED", [oRowData.Task]);	
			}	
			return sMessage;
		},

		_getChangeBESuccessMsg:function(oRowData){
			var sMessage;
			
			if(oRowData.WBSElementIsBillingElement === true  )
			{
				sMessage = this.i18nBundle.getText("MSG_BE_CHECKED", [oRowData.Task]);	
			}

			return sMessage;
		},		
		
		/**
		 * delete button press event callback
		 *
		 * @public
		 */
		onDeletePressed: function () {
			var aRowIndices = this._oTreeTable.getSelectedIndices();
			if(aRowIndices.length < 1)
			{//delete action only enabled at least one row selected
				return;
			}
			this._disableActionButton();
			var oBinding = this._oTreeTable.getBinding("rows");
			var oRowContext = this._oTreeTable.getContextByIndex(aRowIndices[0]);
			var sBindingPath = oRowContext.getPath();
			var oRowData = this._oDataModel.getProperty(sBindingPath);				
			var that = this;
			var aDeferred = this._getDeferredObject();
			aDeferred[0].always(function () {
				that._oView.setBusy(true);
				that._removeTransientMessages();
				that._oDataModel.callFunction(that._oDataPath.deleteFunction, {
					method: "POST",
					urlParameters: {
						TaskUUID:oRowData.TaskUUID,
						IsActiveEntity: false,
						HierarchyNodeLevel:oRowData.HierarchyNodeLevel
					},
					success: function (odata, response){
						//oBinding.removeContext(oRowContext);
						that._bIsDraftModified = true;
						that._oMessageManager.removeAllMessages();
						var oFunc = function(){
							aDeferred[1].resolve();
							that._oView.setBusy(false);
							that._oTreeTable.setSelectedIndex(aRowIndices[0]);
							var sMessage = that._getDeleteSuccessMsg(oRowData);
							sap.m.MessageToast.show(sMessage);
							//that._addInformationMessage(sMessage, null);
							/*
							if(!that._oMessagePopover || !that._oMessagePopover.isOpen())
							{
								setTimeout(function () {
									that.onMessagesButtonPress();	
								}, 100);							
							}
							*/
						};
						oBinding._restoreTreeState().then(
							function () {
								oFunc();							
							},
							function () {
								oFunc();
							}
						);
					},
					error: function (oEvent) {
						aDeferred[1].resolve();
						that.onRowSelectionChange();
						that._oView.setBusy(false);		
						that._handleErrorMessage(oEvent, that._operations.deleteEntity);
					}
				});						
			});				
		},

		/**
		 * delete selected work package
		 *
		 * @public
		 */
		/*
		_deleteWorkPackage:function(){
			var aRowIndices = this._oTreeTable.getSelectedIndices();
			var oBinding = this._oTreeTable.getBinding("rows");
			var that = this, i = 0;
			var aDeferred = this._getDeferredObject();
			aDeferred[0].always(function () {
				that._oView.setBusy(true);
				var sBindingPath,oContext,oRowData, aRemoved = [], nDeleted = 0;
				for(i = 0; i < aRowIndices.length; i++)
				{
					sBindingPath = that._oTreeTable.getContextByIndex(aRowIndices[i]).getPath();
					oContext = that._oTreeTable.getContextByIndex(aRowIndices[i]);
					oRowData = that._oDataModel.getProperty(sBindingPath);	
					var oItem = {};
					oItem.context = oContext;
					oItem.level = oRowData.HierarchyNodeLevel;
					aRemoved.push(oItem);
				}
				
				aRemoved.sort(function(a,b){
					return b.level - a.level;
				});
				
				var fnHandleError = function(oError){
					aDeferred[1].resolve();
					oBinding._fireChange();
					that._oView.setBusy(false);		
					that._handleErrorMessage(oError, that._operations.deleteEntity);
				};
				var fnSuccess = function(oData, oResponse){
					if(++nDeleted === aRowIndices.length)
					{
						that._bIsDraftModified = true;
						for(i = 0; i < aRemoved.length; i++)
						{
							oBinding.removeContext(aRemoved[i].context);	
						}
						oBinding._restoreTreeState().then(
							function () {
								aDeferred[1].resolve();
								oBinding._fireChange();
								that._oView.setBusy(false);
							},
							function () {
								aDeferred[1].resolve();
								oBinding._fireChange();
								that._oView.setBusy(false);
							}
						);
					}

				};
				for(i = 0; i < aRowIndices.length; i++)
				{
					sBindingPath = that._oTreeTable.getContextByIndex(aRowIndices[i]).getPath();
					oRowData = that._oDataModel.getProperty(sBindingPath);	
					that._oDataModel.callFunction(that._oDataPath.deleteFunction, {
						method: "POST",
						urlParameters: {
							TaskUUID:oRowData.TaskUUID,
							IsActiveEntity: false
						},
						batchGroupId:"Changes",
						changeSetId:"Deletion",							
						success: fnSuccess,
						error: fnHandleError
					});					
				}
				that._oDataModel.submitChanges({groupId: "Changes"});
				
			});			
		},
		*/

		/**
		 * execute proccessing status change by sending OData request to backend
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * 
		 * @param {string}
		 *            sFunctionName: OData function path.
		 * 
		 * @private
		 */
		onStatusChanged: function (oEvent, sFunctionName) {
			var that = this;
			this._oView.setBusy(true);
			this._removeTransientMessages();
			this._oDataModel.callFunction(sFunctionName, {
				method: "POST",
				urlParameters: {
					TaskUUID: this._oStatusData["taskUUID"],
					IsActiveEntity: true
				},
				success: function (oData, response) {
					var nIdx = that._oTreeTable.getSelectedIndex();
					var oBinding = that._oTreeTable.getBinding("rows");
					var sMsg = that.i18nBundle.getText("MSG_PROCESSING_STATUS_CHANGED");

					oBinding._restoreTreeState().then(
						function () {
							that._oTreeTable.setSelectedIndex(nIdx);
							that._oView.setBusy(false);
							sap.m.MessageToast.show(sMsg);
						},
						function () {
							that._oTreeTable.setSelectedIndex(nIdx);
							that._oView.setBusy(false);
							sap.m.MessageToast.show(sMsg);
						}
					);
				},
				error: function (oError) {
					that._oView.setBusy(false);
					that._handleErrorMessage(oError, that._operations.callAction);
				}
			});
			
			this._oDataModel.read(this._sProjectPath, {
				success: function (oData) {
					that._oHeaderData = oData;
					that._oHeaderModel.setData(that._oHeaderData);
					if (oData.Update_mc) {
						that._oEditButton.setVisible(true);
					} else {
						that._oEditButton.setVisible(false);
					}
				},
				error: function () {}
			});
		},

		/**
		 * move down button press event callback
		 *
		 * @public
		 */
		onMoveDownPressed:function(){
			var nIndex = this._oTreeTable.getSelectedIndices()[0];
			var oRowData = this._getRowInfoByIndex(nIndex)["data"];
			var oBinding = this._oTreeTable.getBinding("rows");
			var bCanMoveDown = false, nSiblingIndex = nIndex, oSiblingRowData,nNextPostion = nIndex +1;

			if(nIndex > 0)
			{
				var nRowCount = oBinding.getLength();
				if(nIndex < nRowCount -1)
				{
					while (nSiblingIndex < nRowCount - 1) 
					{
						oSiblingRowData = this._getRowInfoByIndex(++nSiblingIndex)["data"];
						if (oSiblingRowData.HierarchyNodeLevel === oRowData.HierarchyNodeLevel) 
						{
							bCanMoveDown = true;
							var oNode = oBinding.getNodeByIndex(nIndex);
							var oSiblingNode = oBinding.getNodeByIndex(nSiblingIndex);
							var nOffset = 0;
							
							if(this._oTreeTable.isExpanded(nIndex))
							{
								nOffset = oNode.magnitude;
							}							
							
							if(this._oTreeTable.isExpanded(nSiblingIndex))
							{
								nNextPostion = nSiblingIndex + oSiblingNode.magnitude -nOffset;
							}
							else
							{
								nNextPostion = nSiblingIndex - nOffset;
							}								
							break; 
						}
						
						if (oSiblingRowData.HierarchyNodeLevel < oRowData.HierarchyNodeLevel) 
						{
							bCanMoveDown = false;
							break;
						}						
					}					
					
				}
			}
			this._removeActionInfoMessages();
			if(bCanMoveDown)
			{
				var that = this;
				this._disableActionButton();
				var aDeferred = this._getDeferredObject();
				aDeferred[0].always(function () {
					that._oView.setBusy(true);
					that._oDataModel.callFunction(that._oDataPath.movedownFunction, {
						method: "POST",
						urlParameters: {
							TaskUUID: oRowData.TaskUUID,
							IsActiveEntity: false,
							HierarchyNodeLevel:oRowData.HierarchyNodeLevel
						},
						success: function (oData, response) {
							that._bIsDraftModified = true;
							
							var oFunc = function(){
								aDeferred[1].resolve();
								that._oView.setBusy(false);
								setTimeout(function () {
									that._oTreeTable.setSelectedIndex(nNextPostion);
								}, 100);										
							};
							
							oBinding._restoreTreeState().then(
								function () {
									oFunc();
								},
								function () {
									oFunc();
								}
							);
						},
						error: function (oError) {
							aDeferred[1].resolve();
							that.onRowSelectionChange();
							that._oView.setBusy(false);
							that._handleErrorMessage(oError);
						}
					});							
				});
			}
			else
			{
				var sMsg = this.i18nBundle.getText("MSG_CAN_NOT_MOVEDOWN");
				//sap.m.MessageBox.information(sMsg);
				this._addInformationMessage(sMsg, null);
			}			
		},

		/**
		 * moveup button press event callback
		 *
		 * @public
		 */
		onMoveUpPressed: function () {
			var nIndex = this._oTreeTable.getSelectedIndices()[0];
			var oRowData = this._getRowInfoByIndex(nIndex)["data"];

			var bCanMoveup = false, nSiblingIndex = nIndex;

			if(nIndex > 0)
			{
				var oSiblingRowData = this._getRowInfoByIndex(nIndex -1)["data"];
				if(oSiblingRowData.HierarchyNodeLevel >= oRowData.HierarchyNodeLevel)
				{
					bCanMoveup = true;
				}
				
				if(bCanMoveup)
				{
					while (nSiblingIndex > 0) {
						oSiblingRowData = this._getRowInfoByIndex(--nSiblingIndex)["data"];
						if (oSiblingRowData.HierarchyNodeLevel === oRowData.HierarchyNodeLevel) 
						{
							break; 
						}
					}
				}
			}
			this._removeActionInfoMessages();
			if(bCanMoveup)
			{
				var that = this;
				var oBinding = this._oTreeTable.getBinding("rows");
				this._disableActionButton();
				var aDeferred = this._getDeferredObject();
				aDeferred[0].always(function () {
					that._oView.setBusy(true);
					that._oDataModel.callFunction(that._oDataPath.moveupFunction, {
						method: "POST",
						urlParameters: {
							TaskUUID: oRowData.TaskUUID,
							IsActiveEntity: false,
							HierarchyNodeLevel:oRowData.HierarchyNodeLevel
						},
						success: function (oData, response) {
							that._bIsDraftModified = true;
							
							var oFunc = function(){
								aDeferred[1].resolve();
								that._oView.setBusy(false);
								setTimeout(function () {
									that._oTreeTable.setSelectedIndex(nSiblingIndex);
								}, 100);										
							};
							
							oBinding._restoreTreeState().then(
								function () {
									oFunc();
								},
								function () {
									oFunc();
								}
							);
						},
						error: function (oError) {
							aDeferred[1].resolve();
							that.onRowSelectionChange();
							that._oView.setBusy(false);
							that._handleErrorMessage(oError);
						}
					});							
				});
			}
			else
			{
				var sMsg = this.i18nBundle.getText("MSG_CAN_NOT_MOVEUP");
				//sap.m.MessageBox.information(sMsg);
				this._addInformationMessage(sMsg, null);
			}			
			
		},


		/**
		 * get row context by index
		 * 
		 * @param {int}
		 *            nIndex: row index.
		 * @private
		 */	
		_getRowInfoByIndex: function (nIndex) {
			var oBinding = this._oTreeTable.getBinding();
			var oNode = oBinding.getNodeByIndex(nIndex);
			var oContext = oBinding.getContextByIndex(nIndex);
			var oRowData = this._oDataModel.getProperty(oContext.getPath());
			return {
				node: oNode,
				context: oContext,
				data: oRowData
			};
		},

		/**
		 * Outdent button press event callback
		 *
		 * @public
		 */
		onOutdentPressed: function () {
			var nIndex = this._oTreeTable.getSelectedIndices()[0];
			var oRowData = this._getRowInfoByIndex(nIndex)["data"];
			
			this._removeActionInfoMessages();
			if(oRowData.HierarchyNodeLevel > 1)
			{
				var that = this;
				var oBinding = this._oTreeTable.getBinding("rows");
				var nRowCount = oBinding.getLength();
				var bNeedExpand = false;
				if(nIndex < nRowCount -1)
				{
					var oSiblingRowData = this._getRowInfoByIndex(nIndex + 1)["data"];
					if(oSiblingRowData.HierarchyNodeLevel === oRowData.HierarchyNodeLevel)
					{
						bNeedExpand = true;
					}
				}
				this._disableActionButton();
				var aDeferred = this._getDeferredObject();
				aDeferred[0].always(function () {
					that._oView.setBusy(true);
					that._oDataModel.callFunction(that._oDataPath.outdentFunction, {
						method: "POST",
						urlParameters: {
							TaskUUID: oRowData.TaskUUID,
							IsActiveEntity: false,
							HierarchyNodeLevel:oRowData.HierarchyNodeLevel
						},
						success: function (oData, response) {
							that._bIsDraftModified = true;
							
							var sMessage = "";	
							if(oRowData.WBSElementIsBillingElement === true){
								sMessage = that.i18nBundle.getText("MSG_BE_CHECKED",[oRowData.Task]);				
								sap.m.MessageToast.show(sMessage);
							}
							
							var oFunc = function(){
								aDeferred[1].resolve();
								that._oView.setBusy(false);
								if(bNeedExpand)
								{
									oBinding.expand(nIndex);		
								}
								setTimeout(function () {
									that._oTreeTable.setSelectedIndex(nIndex);
								}, 1000);								
							};
							
							oBinding._restoreTreeState().then(
								function () {
									oFunc();
								},
								function () {
									oFunc();
								}
							);
						},
						error: function (oError) {
							aDeferred[1].resolve();
							that.onRowSelectionChange();
							that._oView.setBusy(false);
							that._handleErrorMessage(oError);
						}
					});							
				});				
			}
			else
			{
				var sMsg = this.i18nBundle.getText("MSG_CAN_NOT_OUTDENT");
				//sap.m.MessageBox.information(sMsg);
				this._addInformationMessage(sMsg, null);
			}
			

		},

		/**
		 * Indent button press event callback
		 *
		 * @public
		 */
		onIndentPressed: function () {
			var nIndex = this._oTreeTable.getSelectedIndices()[0];
			var oRowData = this._getRowInfoByIndex(nIndex)["data"];

			var bCanIndent = false, nSiblingIndex = nIndex;

			if(nIndex > 0)
			{
				var oSiblingRowData = this._getRowInfoByIndex(nIndex -1)["data"];
				if(oSiblingRowData.HierarchyNodeLevel >= oRowData.HierarchyNodeLevel)
				{
					bCanIndent = true;
				}
				
				if(bCanIndent)
				{
					while (nSiblingIndex > 0) {
						oSiblingRowData = this._getRowInfoByIndex(--nSiblingIndex)["data"];
						if (oSiblingRowData.HierarchyNodeLevel === oRowData.HierarchyNodeLevel) 
						{
							break; 
						}
					}
				}
			}
			
			this._removeActionInfoMessages();

			if(bCanIndent)
			{
				var that = this;
				var oBinding = this._oTreeTable.getBinding("rows");
				this._disableActionButton();
				var aDeferred = this._getDeferredObject();
				aDeferred[0].always(function () {
					that._oView.setBusy(true);
					that._oDataModel.callFunction(that._oDataPath.indentFunction, {
						method: "POST",
						urlParameters: {
							TaskUUID: oRowData.TaskUUID,
							IsActiveEntity: false,
							HierarchyNodeLevel:oRowData.HierarchyNodeLevel
						},
						success: function (oData, response) {
							that._bIsDraftModified = true;
							
							var oFunc = function(){
								aDeferred[1].resolve();
								that._oView.setBusy(false);
								var sMessage = "";	
								if(oSiblingRowData.WBSElementIsBillingElement === true){
									sMessage = that.i18nBundle.getText("MSG_BE_CHECKED",[oSiblingRowData.Task]);				
									sap.m.MessageToast.show(sMessage);
								}else if(!oBinding.isExpanded(nSiblingIndex))
								{
									sMessage = that.i18nBundle.getText("MSG_INDENTED_SUCCESSFULLY", [oRowData.Task, oSiblingRowData.Task]);				
									sap.m.MessageToast.show(sMessage);
								}

								setTimeout(function () {
									that._oTreeTable.setSelectedIndex(nIndex);
								}, 1000);										

							};
							
							oBinding._restoreTreeState().then(
								function () {
									oFunc();
								},
								function () {
									oFunc();
								}
							);
						},
						error: function (oError) {
							aDeferred[1].resolve();
							that.onRowSelectionChange();
							that._oView.setBusy(false);
							that._handleErrorMessage(oError);
						}
					});							
				});
			}
			else
			{
				var sMsg = this.i18nBundle.getText("MSG_CAN_NOT_INDENT");
				//sap.m.MessageBox.information(sMsg);
				this._addInformationMessage(sMsg, null);
			}
		},
		
		/**
		 * add a information message to message model, and display message popover
		 * 
		 * @param {string}
		 *            sMessage: Text of the message to add.
		 * @param {string}
		 *            sDescription: Long text of the message .
		 * 
		 * @private
		 */			
		_addInformationMessage:function(sMessage, sDescription){
			var oInformationMessage = new sap.ui.core.message.Message({
				message: sMessage,
				description: sDescription,
				type: sap.ui.core.MessageType.Information,
				processor: this._oDataModel,
				target: this._oDataPath.taskPath, //to disable activetile to prevent navigation
				persistent: false
			});
			sap.ui.getCore().getMessageManager().addMessages(oInformationMessage);		
			
			if(!this._oMessagePopover || !this._oMessagePopover.isOpen())
			{
				var that = this;
				setTimeout(function () {
					that.onMessagesButtonPress();	
				}, 100);							
			}			
		},

		/**
		 * Message Item press event callback
		 * 
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */
		activeTitlePressed:function(oEvent){
			var oMessageItem = oEvent.getParameter("item");
			var oMessage = oMessageItem.getBindingContext("message").getObject();
			var regex = new RegExp(/\/C_EnterpriseProjElementPlanTP\(TaskUUID=guid'(.+?)',IsActiveEntity=false\)/g);
			var matches = regex.exec(oMessage.target);

			//find task uuid in message target
			if(matches && matches[0])
			{
				var str = ",IsActiveEntity=false)/";
				var nLen = str.length;
				var nPos = oMessage.target.lastIndexOf(str);
				var sFieldName = null, sFieldLable = null, bVisibleField = false, bVisibleRow = false, nTargetRowIndex = 0;
				//get field name from message target
				if((nPos >= 0) && ((nPos + nLen) < oMessage.target.length))
				{
					sFieldName = oMessage.target.substring(nPos + nLen, oMessage.target.length);
					if(this._oFieldMapping[sFieldName])
					{
						sFieldLable = this._oFieldMapping[sFieldName];
					}
					//find column by field name
					var aTableColumns = this._oTreeTable.getColumns();
					for(var i = 0; i < aTableColumns.length; i++)
					{
						if((sFieldLable === aTableColumns[i].getLabel().getText()) && (aTableColumns[i].getVisible() === true))
						{
							bVisibleField = true;
							break;
						}
					}
				}
				//error message for visible column, so just jump to corresponding row and try to focus on the control.
				if(bVisibleField)
				{
					var oBinding = this._oTreeTable.getBinding("rows");
					var nRowCount = oBinding.getLength();
					var oContext = oBinding.getContexts(0, nRowCount);
					for(var j = 0; j < nRowCount; j++)
					{
						if(oContext[j] && oContext[j].sPath === matches[0])
						{
							nTargetRowIndex = j;
							bVisibleRow = true;
							break;
						}
					}
				} 
				
				if(bVisibleField && bVisibleRow)
				{
					var nVisibleRowCount = this._oTreeTable.getVisibleRowCount();
					var nFirstVisibleRow = this._oTreeTable.getFirstVisibleRow();	
					if((nTargetRowIndex >= (nVisibleRowCount + nFirstVisibleRow))  || (nTargetRowIndex < nFirstVisibleRow))
					{
						this._oTreeTable.setFirstVisibleRow(nTargetRowIndex);
					}
					this._oTreeTable.setSelectedIndex(nTargetRowIndex);
					if(oMessage.controlIds && oMessage.controlIds[0])
					{
						var oControl = sap.ui.getCore().byId(oMessage.controlIds[0]);
						if(oControl)
						{
							oControl.focus();	
						}
					}					
				}
				else //error message for hidden column, navigate to work package app
				{
					var strTaskUUID = matches[1];
					var oMyCustomData = {
						ProjectUUID: this._sProjectUUID,
						IsActiveEntity: this._bIsActiveEntity,
						ActiveUUID: this._sActiveUUID
					};				
					var oInnerAppData = {
						selectionVariant: {},
						tableVariantId: {},
						customData: oMyCustomData
					};				
					var oNavigationParameters = {
						ProjectUUID: this._sProjectUUID,
						TaskUUID: strTaskUUID,
						IsActiveEntity: this._bIsActiveEntity
					};
					this._oNavigationHandler.navigate("EnterpriseProject", "processProjectElement", oNavigationParameters, oInnerAppData, null);					
				}
			}
		},
		
		/**
		 * get group title for message item
		 * 
		 * @param {string}
		 *            sTarget: message target path.
		 * @private
		 */		
		_getGroupTitle:function(sTarget){
			var sTitle = "";
			//parse task uuid from message target path
			var regex = new RegExp(/\/C_EnterpriseProjElementPlanTP\(TaskUUID=guid'(.+?)',IsActiveEntity=false\)/g);
			var matches = regex.exec(sTarget);
			if(matches && matches[0])
			{
				//read task ID from odata model
				var oRowData = this._oDataModel.getProperty(matches[0]);
				if(oRowData && oRowData.Task)
				{
					sTitle = oRowData.Task;
				}
			}
			return sTitle;
		},
		
		/**
		 * get activetile based on message target
		 * 
		 * @param {string}
		 *            sTarget: message target path.
		 * @private
		 */			
		_getActiveTile:function(sTarget){
			var bActiveTile = false;
			var regex = new RegExp(/\/C_EnterpriseProjElementPlanTP\(TaskUUID=guid'(.+?)',IsActiveEntity=false\)/g);
			var matches = regex.exec(sTarget);
			if(matches && matches[0] && matches[1])
			{
				bActiveTile =  true;
			}
			return bActiveTile;
		},

		/**
		 * create message popover
		 *
		 * @private
		 */
		_createMessagePopover: function () {
			var that = this;
			var oMessageTemplate = new sap.m.MessageItem({
				type: "{message>type}",
				title: "{message>message}",
				description: "{message>description}",
				subtitle: "{message>additionalText}",
				longtextUrl:"{message>descriptionUrl}",
				groupName:{
								path: 'message>target', 
								formatter:function(sTarget)
								{
									return that._getGroupTitle(sTarget);
								}
				},
				activeTitle:{
								path: 'message>target', 
								formatter:function(sTarget)
								{
									return that._getActiveTile(sTarget);
								}
				}
			});
			
			this._oMessagePopover = new sap.m.MessagePopover({
				items: {
					path: "message>/",
					template: oMessageTemplate
				},
				groupItems: true,
				initiallyExpanded: true,
				activeTitlePress:$.proxy(this.activeTitlePressed, this)
			});
			this._oMessagePopover.setModel(this._oMessageManager.getMessageModel(), "message");
			
			var oItemBinding = this._oMessagePopover.getBinding("items");

			var	oErrorFilter = new sap.ui.model.Filter({
					path: "persistent",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: false
				});			
				
			var oContextPathFilter = new sap.ui.model.Filter({
					path: "target",
					operator: sap.ui.model.FilterOperator.StartsWith,
					value1: this._oDataPath.taskPath
				});					

			var oModelFilter = new sap.ui.model.Filter({
				filters: [oErrorFilter, oContextPathFilter],
				and: true
			});				

			var oValidationFilter = new sap.ui.model.Filter({
					path: "validation",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: true
				});				
			
			
			//disable message from project header
			var oFilter = new sap.ui.model.Filter({
				filters: [oModelFilter, oValidationFilter],
				and: false
			});				
			
			
			//enable project header message
			/*
			var oFilter = new sap.ui.model.Filter({
				filters: [oErrorFilter, oValidationFilter],
				and: false
			});			
			*/
			
			oItemBinding.filter(oFilter);
			oItemBinding.attachChange(function() {
				var iCount = oItemBinding.getLength();
				that._oUIData.messageCount = iCount;
				that._oUIModel.setData(that._oUIData);				
			});			
			
		},

		/**
		 * create message dialog, check the error before saving
		 *
		 * @private
		 */
		_createMessageDialog: function () {
			var that = this;
			var oMessageTemplate = new sap.m.MessageItem({
				type: "{message>type}",
				title: "{message>message}",
				description: "{message>description}",
				subtitle: "{message>additionalText}",
				longtextUrl: "{message>descriptionUrl}",
				groupName:{
								path: 'message>target', 
								formatter:function(sTarget)
								{
									return that._getGroupTitle(sTarget);
								}
				}				
			});

			var oMessageView = new sap.m.MessageView({
				items: {
					path: "message>/",
					template: oMessageTemplate
				},
				groupItems: true
			});
			oMessageView.setModel(this._oMessageManager.getMessageModel(), "message");
			this._oMessageDialog = new sap.m.Dialog({
				state: "Error",
				titleAlignment: sap.m.TitleAlignment.Center,
				title: this.i18nBundle.getText("LABEL_ERROR"),
				content: oMessageView,
				endButton: new sap.m.Button({
					press: function () {
						oMessageView.navigateBack();
						that._oMessageDialog.close();
						that._removeTransientMessages();
					},
					text: this.i18nBundle.getText("BUTTON_CLOSE")
				}),
				contentHeight: "440px",
				contentWidth: "440px",
				verticalScrolling: false
			});
		},

		/**
		 * check the error before saving
		 *
		 * @return {boolean}
		 * 		true: can save
		 *		false: can't save
		 *
		 * @private
		 */
		_checkBeforeSave: function () {

			if (!this._oMessageDialog) {
				this._createMessageDialog();
			}

			var oItemBinding = this._oMessageDialog.getContent()[0].getBinding("items");
			var oErrorFilter = new sap.ui.model.Filter({
				path: "validation",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: true
			});
			oItemBinding.filter(oErrorFilter);

			if (oItemBinding.getLength() > 0) {
				return false;
			} else {
				return true;
			}
		},

		/**
		 * message manager button press event callback
		 *
		 * @param {object}
		 *            oEvent: event context.
		 * @public
		 */
		onMessagesButtonPress: function (oEvent) {
			if (!this._oMessagePopover) {
				this._createMessagePopover();
			}

			this._oMessagePopover.toggle(this._oMsgButton);
		},

		/**
		 * create deferred object to sync odata operation.
		 *
		 * @return {array}
		 * 		return two deferred objects
		 * @private
		 */
		_getDeferredObject: function () {

			var oPrevious = this._oEditDeferred;
			var oFollowing = $.Deferred();
			this._oEditDeferred = oFollowing;

			return [oPrevious, oFollowing];
		},

		/**
		 * restore row selection after refreshing tree
		 *
		 * @param {array}
		 *            aRowIndices: all indices of actually selected rows
		 * @private
		 */
		_setTableSelection: function (aRowIndices) {
			if (aRowIndices && aRowIndices.length) {
				for (var i = 0; i < aRowIndices.length; i++) {
					this._oTreeTable.addSelectionInterval(aRowIndices[i], aRowIndices[i]);
				}
			}
		},

		/**
		 * refresh tree binding
		 *
		 * @private
		 */
		_refreshTree: function () {
			var oBinding = this._oTreeTable.getBinding("rows");
			var aRowIndices = this._oTreeTable.getSelectedIndices();
			if (oBinding) {
				this._oView.setBusy(true);
				var that = this;
				oBinding._restoreTreeState().then(
					function () {
						that._oView.setBusy(false);
						oBinding._fireChange();
						if(aRowIndices.length > 0)
						{
							that._setTableSelection(aRowIndices);	
						}
						if(that._nFirstVisibleRow !== that._oTreeTable.getFirstVisibleRow())
						{
							that._oTreeTable.setFirstVisibleRow(that._nFirstVisibleRow);	
						}
						that._setAxisTime(that._oHeaderData.EarliestStartDate, that._oHeaderData.LatestFinishDate);
					},
					function (oEvent) {
						that._oView.setBusy(false);
						oBinding._fireChange();
						if(aRowIndices.length > 0)
						{
							that._setTableSelection(aRowIndices);	
						}
						if(that._nFirstVisibleRow !== that._oTreeTable.getFirstVisibleRow())
						{
							that._oTreeTable.setFirstVisibleRow(that._nFirstVisibleRow);	
						}
					}
				);
			}
		},

		/**
		 * application suppend
		 *
		 * @public
		 */		
		onComponentSuspend:function(){
			//Log.error("------ Planning APP -- Suspend, controller timestamp: " + this._nTimeStamp, "------");
			this._nFirstVisibleRow = this._oTreeTable.getFirstVisibleRow();
		},		
		
		/**
		 * check project status after app restored
		 *
		 * @public
		 */
		onComponentRestore: function () {
			//Log.error("++++++ Planning APP -- Restore, controller timestamp: " + this._nTimeStamp, "++++++");
			if(!this._bAppValid)
			{
				var msg = this.i18nBundle.getText("MSG_INVALID_URL");
				this._showInvalidAppState(msg);						
				return;
			}
			var that = this;
			this._oView.setBusy(true);
			this._oDataModel.read(this._sProjectPath, {
				urlParameters: {
					$expand: "DraftAdministrativeData"
				},
				success: function (oData) {
					if (that._bEditMode) //edit mode
					{ //check whehter draft was valid
						if (!oData.DraftAdministrativeData) //draft was deleted, need to switch display mode.
						{
							that._sProjectUUID = that._oHeaderData.ActiveUUID;
							that._bIsActiveEntity = "true";
							that._bEditMode = false;
							that._setUIByEditStatus();
							that._resetProjectData();
							that._loadProjectData();
						} else { //draft still exist, update the project header, then refresh treetable
							that._oHeaderData = oData;
							that._oHeaderModel.setData(that._oHeaderData);
							if(oData.DraftAdministrativeData.LastChangeDateTime > oData.DraftAdministrativeData.CreationDateTime){
								that._bIsDraftModified = true;
							}							
							that._refreshTree();
						}
					} else //display mode
					{ //check whether draft exist
						if (oData.Update_mc) //it's editable
						{
							that._oEditButton.setVisible(true);
						} else {
							that._oEditButton.setVisible(false);
						}
						that._oHeaderData = oData;
						that._oHeaderModel.setData(that._oHeaderData);
						that._refreshTree();
					}
				},
				error: function (oEvent) {
					that._oView.setBusy(false);
					//that._oGanttChart.invalidate(); //fix Incident ID:1980162421
					if (that._bEditMode) { //draft was deleted, need to switch display mode.
						that._sProjectUUID = that._oHeaderData.ActiveUUID;
						that._bIsActiveEntity = "true";
						that._bEditMode = false;
						that._setUIByEditStatus();
						that._resetProjectData();
						that._loadProjectData();
					}
				}
			});

		},
		/**
		 * legend factory
		 *
		 * @public
		 */
		legendFactory: function (sId, oContext) {
			var oScheme = oContext.getProperty();
			var aLegendRowConfigs = oScheme.LegendRowConfigs.map(function (c) {
				return new LegendRowConfig(c);
			});
			return new DimensionLegend({
				title: this.i18nBundle.getText("LABEL_LEGEND"),
				columnConfigs: [
					new LegendColumnConfig({
						text: this.i18nBundle.getText("LABEL_LEGEND_DONE"),
						fillFactory: function (sShapeId) {
							switch (sShapeId) {
							case "task":
								return Formatter.colorDef.shape.TaskDone;
							case "project":
								return Formatter.colorDef.shape.PhaseDone;
							}
						}.bind(this)
					}),
					new LegendColumnConfig({
						text: this.i18nBundle.getText("LABEL_LEGEND_REMAINING"),
						fillFactory: function (sShapeId) {
							switch (sShapeId) {
							case "task":
								return Formatter.colorDef.shape.TaskOpen;
							case "project":
								return Formatter.colorDef.shape.PhaseOpen;
							}
						}.bind(this)
					})
				],
				rowConfigs: aLegendRowConfigs
			});
		},

		/**
		 * share button press event callback
		 *
		 * @public
		 */
		onActionPress: function () {
			if (!this._oActionSheet) {
				this._createActionSheet();
			}
			this._oActionSheet.openBy(this._oActionButton);
		},

		/**
		 * send email button press event callback
		 *
		 * @public
		 */
		shareEmailPressed: function () {
			var sSubject = this.i18nBundle.getText("MSG_EMAIL_TITLE");
			if (this._oHeaderData.Project) {
				sSubject = sSubject + " : " + this._oHeaderData.Project;
			}
			sap.m.URLHelper.triggerEmail(null, sSubject, document.URL);
		},

		/**
		 * share jam button press event callback
		 *
		 * @public
		 */
		shareJamPressed: function () {
			var oShareDialog = sap.ui.getCore().createComponent({
				name: "sap.collaboration.components.fiori.sharing.dialog",
				settings: {
					object: {
						id: document.URL,
						share: this._oHeaderData.Project ? this._oHeaderData.Project : this.i18nBundle.getText("appTitle")
					}
				}
			});
			oShareDialog.open();
		},

		/**
		 * OpenIn button press event callback
		 *
		 * @public
		 */
		onOpenInPress: function () {
			if (!this._oOpenInActionSheet) {
				this._createOpenInActionSheet();
			}
			this._oOpenInActionSheet.openBy(this._oOpenInButton);

		},

		/**
		 * project builder button press event callback
		 *
		 * @public
		 */
		onProjectBuilderPress: function () {
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};

			var oNavigationParameters = {
				Project: this._oHeaderData.Project
			};

			this._oNavigationHandler.navigate("Project", "displayDetails", oNavigationParameters, oInnerAppData, null);
		},

		/**
		 * project control button press event callback
		 *
		 * @public
		 */
		onProjectControlPress: function () {
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};

			var oNavigationParameters = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity
			};

			this._oNavigationHandler.navigate("EnterpriseProject", "maintain", oNavigationParameters, oInnerAppData, null);
		},

		/**
		 * monitor project button press event callback
		 *
		 * @public
		 */
		onMonitorProjectPress: function () {
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};

			var oNavigationParameters = {
				Project: this._oHeaderData.Project
			};

			this._oNavigationHandler.navigate("EnterpriseProject", "monitor", oNavigationParameters, oInnerAppData, null);
		},

		/**
		 * project cost button press event callback
		 *
		 * @public
		 */
		onProjectCostPress: function () {
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};

			var oNavigationParameters = {
				Project: this._oHeaderData.Project
			};

			this._oNavigationHandler.navigate("Project", "displayFinancialReport", oNavigationParameters, oInnerAppData, null);
		},

		/**
		 * project budget button press event callback
		 *
		 * @public
		 */
		onProjectBudgetPress: function () {
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};

			var oNavigationParameters = {
				Project: this._oHeaderData.Project
			};

			this._oNavigationHandler.navigate("EnterpriseProject", "displayProjectBudget", oNavigationParameters, oInnerAppData, null);
		},

		/**
		 * project procurement button press event callback
		 *
		 * @public
		 */
		onProjectProcurementPress: function () {
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};

			var oNavigationParameters = {
				Project: this._oHeaderData.Project,
				DisplayCurrency: "EUR"
			};

			this._oNavigationHandler.navigate("Project", "manageProcurement", oNavigationParameters, oInnerAppData, null);
		},
		
		/**
		 * project brief button press event callback
		 *
		 * @public
		 */
		onProjectBriefPress: function () {
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};

			var oNavigationParameters = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity
			};

			this._oNavigationHandler.navigate("EnterpriseProject", "showProjectBrief", oNavigationParameters, oInnerAppData, null);
		},		
		
		/**
		 * create object marker popover
		 *
		 * @private
		 */
		_createObjectMarkerPopover: function () {
			
			var sUserDescription, sLockString, sTitle, sChangedOn;
			
			sChangedOn = this.i18nBundle.getText("MSG_OBJECT_CHANGED_AT", [this._oHeaderData.DraftAdministrativeData.LastChangeDateTime]);

			if(this._oHeaderData.DraftAdministrativeData.InProcessByUser)
			{
				if(this._oHeaderData.DraftAdministrativeData.DraftIsCreatedByMe)
				{
					sTitle = this.i18nBundle.getText("TITLE_DRAFT_OBJECT");	
				}
				else
				{
					sTitle = this.i18nBundle.getText("TITLE_LOCKED_OBJECT");	
				}
				
				sUserDescription = this._oHeaderData.DraftAdministrativeData.InProcessByUserDescription || this._oHeaderData.DraftAdministrativeData.InProcessByUser 
									|| this._oHeaderData.DraftAdministrativeData.LastChangedByUserDescription || this._oHeaderData.DraftAdministrativeData.LastChangedByUser;
				if(sUserDescription)
				{
					sLockString = this.i18nBundle.getText("MSG_OBJEDT_LOCKED_BY_USER", [sUserDescription]);
				}
				else
				{
					sLockString = this.i18nBundle.getText("MSG_OBJEDT_LOCKED_BY_OTHERS");
				}
			}
			else
			{
				sTitle = this.i18nBundle.getText("TITLE_UNSAVED_CHANGES");
				sUserDescription =  this._oHeaderData.DraftAdministrativeData.LastChangedByUserDescription || this._oHeaderData.DraftAdministrativeData.LastChangedByUser;
				if(sUserDescription)
				{
					sLockString = this.i18nBundle.getText("MSG_OBJEDT_EDITED_BY_USER", [sUserDescription]);
				}
				else
				{
					sLockString = this.i18nBundle.getText("MSG_OBJEDT_EDITED_BY_OTHERS");
				}				
			}

			this._oObjectMarkerPopover = this._oObjectMarkerPopover || new sap.m.Popover({
				placement: sap.m.PlacementType.Horizontal,
				showHeader: true,
				title: sTitle,
				contentWidth:"15.625rem",
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.Text({
								text: sLockString
							}),
							new sap.m.Text({
								text: sChangedOn
							}).addStyleClass("sapUiSmallMarginTop")
						]
					})
				]
			});

			this._oObjectMarkerPopover.addStyleClass("sapUiContentPadding");
		},		
		
		/**
		 * object marker button press event callback
		 *
		 * @public
		 */		
		onObjectMarkerPress:function(){
			if (!this._oObjectMarkerPopover) {
				this._createObjectMarkerPopover();
			}
			this._oObjectMarkerPopover.openBy(this._oObjectMarker);			
		},
		
		/**
		 * navigate to demand app
		 *
		 * @public
		 */			
		onNavigationToDemand:function(){
			var oMyCustomData = {
				ProjectUUID: this._sProjectUUID,
				IsActiveEntity: this._bIsActiveEntity,
				ActiveUUID: this._sActiveUUID
			};
			var oInnerAppData = {
				selectionVariant: {},
				tableVariantId: {},
				customData: oMyCustomData
			};
			var oNavigationParameters = {
				ReferencedObjectUUID: this._oDemandModel.getProperty("/ReferencedObjectUUID"),
				IsActiveEntity: this._bIsActiveEntity
			};
			this._oNavigationHandler.navigate("ProjectDemand", "manage", oNavigationParameters, oInnerAppData, null);
		},
		
		/**
		 * create demand detail popover
		 *
		 * @private
		 */
		_createDemandDetailPopover: function () {
			this._oDemandDetailPopover = this._oDemandDetailPopover || new sap.m.Popover({
				placement: sap.m.PlacementType.Auto,
				showHeader: true,
				title: this.i18nBundle.getText("TITLE_DEMAND_DETAIL"),
				titleAlignment:sap.m.TitleAlignment.Center,
				content: [
					new sap.m.HBox({
						items: 
						[
							new sap.m.VBox({
								//alignItems:sap.m.FlexAlignItems.End,
								items:
								[
									new sap.m.Link({
										text: "{Demand>/serviceDemands}",
										press: $.proxy(this.onNavigationToDemand, this)
									}),
									new sap.m.Link({
										text: "{Demand>/materialDemands}",
										press: $.proxy(this.onNavigationToDemand, this)
									}).addStyleClass("sapUiTinyMarginTop")	
								]
								
							}),
							new sap.m.VBox({
								items:
								[
									new sap.m.Link({
										text : this.i18nBundle.getText("LABEL_SERVICE_DEMANDS"),
										press: $.proxy(this.onNavigationToDemand, this)
									}),
									new sap.m.Link({
										text : this.i18nBundle.getText("LABEL_MATERIAL_DEMANDS"),
										press: $.proxy(this.onNavigationToDemand, this)
									}).addStyleClass("sapUiTinyMarginTop")
								]
								
							}).addStyleClass("sapUiTinyMarginBegin")							
						]
					})
				]
			});

			this._oDemandDetailPopover.addStyleClass("sapUiContentPadding");
			
			this._oDemandModel = this._oDemandModel || new sap.ui.model.json.JSONModel({
				serviceDemands:0,
				materialDemands: 0,
				ReferencedObjectUUID: null
			});
			this._oDemandDetailPopover.setModel(this._oDemandModel, "Demand");				
		},		
		
		/**
		 * demand column press event callback
		 *
		 * @public
		 */			
		onDemandLinkPress:function(oEvent){
			if(!this._oDemandDetailPopover)
			{
				this._createDemandDetailPopover();				
			}
			
			var oItem = oEvent.getSource();
			
			var sBindingPath = oItem.getBindingContext().getPath();
			var oContext = this._oDataModel.getProperty(sBindingPath);	
			
			var oDemandDetail = {
				serviceDemands:0,
				materialDemands: 0,
				ReferencedObjectUUID: null
			};
			
			oDemandDetail.serviceDemands = oContext.NmbrOfProjDmndServiceRequests;
			oDemandDetail.materialDemands = oContext.NmbrOfProjDmndMaterialRequests;
			oDemandDetail.ReferencedObjectUUID = oContext.ReferencedObjectUUID;

			this._oDemandModel.setData(oDemandDetail);
			
			this._oDemandDetailPopover.openBy(oItem);
		
		},
		
  		hasError:function(sPath, sField){
  			if(sField !== "WBSElementIsBillingElement" && sField !== "ProfitCenter" && sField !== "FunctionalArea"){
  				return false;
  			}
  			
			var oErrors = this._oMessageManager.getMessageModel().getData();
			var sErrorPath = sPath + "/" + sField ;
			for(var i = 0; i < oErrors.length; i++)
			{
					if(oErrors[i].target === sErrorPath){
					return true;
				}
			}			
			return false;
		}

	});
});