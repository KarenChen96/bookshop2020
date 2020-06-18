sap.ui.define([
	"i2d/ppm/projectplannings1/controller/Project.controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/comp/smartfield/SmartField",
	"sap/gantt/config/TimeHorizon",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (ProjectController) {
	"use strict";

	QUnit.module("Controller", {
		setup: function () {
			this.oController = new ProjectController();
		},
		teardown: function () {
			//this.oController = undefined;
		}
	});

	QUnit.test("onInit", function (assert) {
		var oControllerStub = {
			_initControl: this.stub(),
			_initModel: this.stub(),
			_initGanttChart: this.stub(),
			_initSmartVariant: this.stub(),
			_initAppState: this.stub(),
			_initEventBus: this.stub()
		};
		var fnIsolateFunction = this.oController.onInit.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._initAppState.calledOnce, true, "onInit passed.");
	});

	QUnit.test("onExit", function (assert) {
		var oControllerStub = {
			_oTreeTable: {
				unbindAggregation: this.stub()
			},
			_oTPC:{
				exit: this.stub()
			},
			_oActionSheet:{
				destroy: this.stub()
			},
			_oOpenInActionSheet:{
				destroy: this.stub()
			},
			_oMessagePopover:{
				destroy: this.stub()
			},
			_oMessageDialog:{
				destroy: this.stub()
			},
			_oDiscardDraftPopover:{
				destroy: this.stub()
			},
			_oUnsaveChangesDialog:{
				destroy: this.stub()
			},
			_oObjectMarkerPopover:{
				destroy: this.stub()
			},	
			_oDemandDetailPopover:{
				destroy: this.stub()
			},
			_oEventBus:{
				unsubscribe: this.stub()
			}			
		};
		var fnIsolateFunction = this.oController.onExit.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oTreeTable.unbindAggregation.calledOnce, true, "onExit passed.");
	});


	QUnit.test("_initControl ", function (assert) {
		var oControllerStub = {
			getView: function () {
				var obj = {
					getId: function () {
						return;
					},
					setModel: function () {

					},
					attachToggleOpenState: function () {

					}
				};

				var oView = {
					byId: function () {
						return obj;
					},
					addStyleClass: function () {
					},
					setModel: function () {
					}
				};

				return oView;
			},
			_oMessageManager: {
				getMessageModel: this.stub(),
				registerObject: this.stub(),
				removeAllMessages: this.stub()
			},
			onToggleOpenState: this.stub(),
			_createMessagePopover: this.stub()
		};
		var fnIsolateFunction = this.oController._initControl.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oMessageManager.registerObject.calledOnce, true, "_initControl passed");
	});

	QUnit.test("_initModel ", function (assert) {
		var oModel = {
			setDefaultCountMode: this.stub(),
			setRefreshAfterChange: this.stub(),
			attachPropertyChange: this.stub(),
			setDefaultBindingMode: this.stub(),
			getMetaModel: function () {
				var oSync = {
					then: function () {

					}
				};

				var metadata = {
					loaded: function () {
						return oSync;
					}
				};
				return metadata;
			},
			getDeferredGroups:function(){
				return ["init"];
			},
			setDeferredGroups: this.stub()
			
		};
		var oControllerStub = {
			getOwnerComponent: function () {
				var component = {
					getModel: function () {
						return oModel;
					}
				};
				return component;
			}
		};
		var fnIsolateFunction = this.oController._initModel.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oModel.setDeferredGroups.calledOnce, true, "_initModel passed");
	});

	QUnit.test("_initGanttChart", function (assert) {
		var oControllerStub = {
			_oTreeTable: {
				setRowSettingsTemplate: this.stub()
			},
			_oGanttChart: {
				setModel: function () { },
				setAxisTimeStrategy: function () { }
			},
			_createAxisTimeStrategy: function () { }
		};

		var fnIsolateFunction = this.oController._initGanttChart.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oTreeTable.setRowSettingsTemplate.calledOnce, true, "_initGanttChart passed.");
	});
	
	QUnit.test("_createActionSheet", function (assert) {
		var oControllerStub = {
			_oHeaderData: {
				ProjectName:"name",
				Project:"id"
			},
			i18nBundle: {
				getText: function () {
					return "project";
				}
			},	
			_oActionSheet:{},
			shareJamPressed: this.stub(),
			shareEmailPressed: this.stub()
		};

		var fnIsolateFunction = this.oController._createActionSheet.bind(oControllerStub);
		fnIsolateFunction();
		assert.notEqual(oControllerStub._oActionSheet, null, "_createActionSheet passed.");
	});	
	
	QUnit.test("_createOpenInActionSheet", function (assert) {
		var oModel = new sap.ui.model.json.JSONModel();
		
		var oControllerStub = {
			i18nBundle: {
				getText: function () {
					return "project";
				}
			},	
			_aNavAuthorization:
			[
				{supported: true},
				{supported: true},
				{supported: true},
				{supported: true},
				{supported: true},
				{supported: true},
				{supported: true}
			],
			_oOpenInActionSheet:null,
			_oUIModel:oModel,
			onProjectBuilderPress: this.stub(),
			onProjectControlPress: this.stub(),
			onMonitorProjectPress: this.stub(),
			onProjectCostPress: this.stub(),
			onProjectBudgetPress: this.stub(),
			onProjectProcurementPress: this.stub(),
			onProjectBriefPress: this.stub()
		};

		var fnIsolateFunction = this.oController._createOpenInActionSheet.bind(oControllerStub);
		fnIsolateFunction();
		assert.notEqual(oControllerStub._oOpenInActionSheet, null, "_createOpenInActionSheet passed.");
	});

	QUnit.test("_parseNaviationParameter xAppState display", function (assert) {
		var oControllerStub = {
			_loadProjectData: this.stub(),
			_setUIByEditStatus: this.stub()
		};

		var oSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant();
		oSelectionVariant.addSelectOption("ProjectUUID", "I", "EQ", "40f2e9af-c5f8-1ed7-85ca-73c61a154209");
		oSelectionVariant.addSelectOption("IsActiveEntity", "I", "EQ", "true");
		var vNavigationParameters= oSelectionVariant.toJSONString();
		
		var oAppData = {
			selectionVariant: vNavigationParameters
		};		
		
		var fnIsolateFunction = this.oController._parseNaviationParameter.bind(oControllerStub);
		fnIsolateFunction(oAppData, null, sap.ui.generic.app.navigation.service.NavType.xAppState);
		assert.equal(oControllerStub._loadProjectData.calledOnce, true, "_parseNaviationParameter passed.");

	});
	
	QUnit.test("_parseNaviationParameter iAppState edit", function (assert) {
		var oControllerStub = {
			_loadProjectData: this.stub(),
			_setUIByEditStatus: this.stub(),
			_checkDraftExist: this.stub()
		};

		var oSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant();
		oSelectionVariant.addSelectOption("ProjectUUID", "I", "EQ", "40f2e9af-c5f8-1ed7-85ca-73c61a154209");
		oSelectionVariant.addSelectOption("IsActiveEntity", "I", "EQ", "false");
		var vNavigationParameters= oSelectionVariant.toJSONString();
		
		var oAppData = {
			selectionVariant: vNavigationParameters
		};		
		
		var fnIsolateFunction = this.oController._parseNaviationParameter.bind(oControllerStub);
		fnIsolateFunction(oAppData, null, sap.ui.generic.app.navigation.service.NavType.iAppState);
		assert.equal(oControllerStub._checkDraftExist.calledOnce, true, "_parseNaviationParameter passed.");
		assert.equal(oControllerStub._loadProjectData.callCount, 0, "_parseNaviationParameter passed.");

	});	
	
	QUnit.test("_parseNaviationParameter iAppState custom data", function (assert) {
		var oControllerStub = {
			_loadProjectData: this.stub(),
			_setUIByEditStatus: this.stub(),
			_checkDraftExist: this.stub()
		};

		var oSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant();
		oSelectionVariant.addSelectOption("ProjectUUID", "I", "EQ", "40f2e9af-c5f8-1ed7-85ca-73c61a154209");
		oSelectionVariant.addSelectOption("IsActiveEntity", "I", "EQ", "false");
		var vNavigationParameters= oSelectionVariant.toJSONString();
		
		var oAppData = {
			selectionVariant: vNavigationParameters,
			customData:{
				ProjectUUID:"40f2e9af-c5f8-1ed7-85ca-73c61a154209",
				IsActiveEntity:"false",
				ActiveUUID:"40f2e9af-c5f8-1ed7-85ca-73c61a154209"
			}
		};		
		
		var fnIsolateFunction = this.oController._parseNaviationParameter.bind(oControllerStub);
		fnIsolateFunction(oAppData, null, sap.ui.generic.app.navigation.service.NavType.iAppState);
		assert.equal(oControllerStub._checkDraftExist.calledOnce, true, "_parseNaviationParameter passed.");
		assert.equal(oControllerStub._loadProjectData.callCount, 0, "_parseNaviationParameter passed.");

	});		
	

	QUnit.test("_parseNaviationParameter fail", function (assert) {
		var oControllerStub = {
			_loadProjectData: this.stub(),
			_setUIByEditStatus: this.stub(),
			_showInvalidAppState: this.stub(),
			i18nBundle: {
				getText: function () {
					return "project list is null";
				}
			}
		};
		
		var oSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant();
		oSelectionVariant.addSelectOption("TaskUUID", "I", "EQ", "40f2e9af-c5f8-1ed7-85ca-73c61a154209");
		oSelectionVariant.addSelectOption("IsActiveEntity", "I", "EQ", "true");
		var vNavigationParameters= oSelectionVariant.toJSONString();		
		
		var oAppData = {
			selectionVariant: vNavigationParameters
		};				
		
		var fnIsolateFunction = this.oController._parseNaviationParameter.bind(oControllerStub);
		fnIsolateFunction(oAppData, null, sap.ui.generic.app.navigation.service.NavType.xAppState);
		assert.equal(oControllerStub._loadProjectData.callCount, 0, "_parseNaviationParameter passed.");

	});

	QUnit.test("_loadTaskList", function (assert) {
		var oBinding = {
			attachDataReceived: this.stub()
		};
		var oControllerStub = {
			_oView: {
				setBusy: function () {

				}
			},
			_oTreeTable: {
				bindAggregation: this.stub(),
				getBinding: function () {
					return oBinding;
				}
			},
			onDataReceived: this.stub(),
			_oDataPath: {
				taskPath: '/ZC_PPGA_TASKHIERARCHYTP_N',
				projectPath: '/ZC_PPGA_ProjectTP_n',
				taskNavigation: 'to_Task'
			}
		};

		var fnIsolateFunction = this.oController._loadTaskList.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oTreeTable.bindAggregation.callCount, 1, "_loadTaskList passed.");
	});

	QUnit.test("_checkDraftExist -- draft valid", function (assert) {
		var data = {
			DraftAdministrativeData:{
				CreatedByUserDescription : "Snow"
			}			
		};
		var oControllerStub = {
			_oView:{
				setBusy:this.stub()
			},
			_sProjectPath:"40f2e9af-c5f8-1ed7-85ca-73c61a154209",
			IsActiveEntity:"false",
			_oHeaderModel: {
				setData: this.stub()
			},
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.success(data);
				}
			},	
			_oDataPath: {
				taskPath: '/ZC_PPGA_TASKHIERARCHYTP_N',
				projectPath: '/ZC_PPGA_ProjectTP_n',
				taskNavigation: 'to_Task'
			},
			_oOpenInButton:{
				setEnabled:this.stub()
			},			
			_oHeaderData:{},
			_setAxisTime: this.stub(),
			_loadTaskList: this.stub()
		};

		var fnIsolateFunction = this.oController._checkDraftExist.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._loadTaskList.callCount, 1, "_checkDraftExist passed.");
	});
	
	QUnit.test("_checkDraftExist -- draft deleted", function (assert) {
		var data = {};
		var oControllerStub = {
			_oView:{
				setBusy:this.stub()
			},
			_sProjectPath:"40f2e9af-c5f8-1ed7-85ca-73c61a154209",
			IsActiveEntity:"false",
			_oHeaderModel: {
				setData: this.stub()
			},
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.success(data);
				}
			},	
			_oDataPath: {
				taskPath: '/ZC_PPGA_TASKHIERARCHYTP_N',
				projectPath: '/ZC_PPGA_ProjectTP_n',
				taskNavigation: 'to_Task'
			},			
			_oHeaderData:{},
			_setAxisTime: this.stub(),
			_loadTaskList: this.stub(),
			_loadProjectData: this.stub(),
			_setUIByEditStatus:this.stub(),
			_resetProjectData:this.stub()			
		};

		var fnIsolateFunction = this.oController._checkDraftExist.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._loadTaskList.callCount, 0, "_checkDraftExist passed.");
		assert.equal(oControllerStub._loadProjectData.callCount, 1, "_checkDraftExist passed.");
	});		
	
	QUnit.test("_checkDraftExist -- odata error", function (assert) {
		var data = {};
		var oControllerStub = {
			_oView:{
				setBusy:this.stub()
			},
			_sProjectPath:"40f2e9af-c5f8-1ed7-85ca-73c61a154209",
			IsActiveEntity:"false",
			_oHeaderModel: {
				setData: this.stub()
			},
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.error(data);
				}
			},	
			_oDataPath: {
				taskPath: '/ZC_PPGA_TASKHIERARCHYTP_N',
				projectPath: '/ZC_PPGA_ProjectTP_n',
				taskNavigation: 'to_Task'
			},			
			_oHeaderData:{},
			_setAxisTime: this.stub(),
			_loadTaskList: this.stub(),
			_loadProjectData: this.stub(),
			_setUIByEditStatus:this.stub(),
			_resetProjectData:this.stub()
		};

		var fnIsolateFunction = this.oController._checkDraftExist.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._loadTaskList.callCount, 0, "_checkDraftExist passed.");
		assert.equal(oControllerStub._loadProjectData.callCount, 1, "_checkDraftExist passed.");
	});			

	QUnit.test("_setUIByEditStatus -- display", function (assert) {
		var oControllerStub = {
			i18nBundle:{
				getText:function(){
					return "text";
				}
			},			
			_oObjectPage: {
				setShowFooter: this.stub()
			},
			_oEditButton: {
				setVisible: this.stub(),
				setText:this.stub()
			},
			_oBtnCopy: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnAdd: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnDelete: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnIndent: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnOutdent: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oOpenInButton:{
				setVisible: this.stub(),
				setEnabled: this.stub(),
				setText:this.stub()
			},
			_oBtnStatus: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnMoveUp:{
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnMoveDown:{
				setVisible: this.stub(),
				setEnabled: this.stub()
			},			
			_removeNonTransientMessages:this.stub(),
			_setMandatoryColumnsLabel: this.stub(),
			_oUIData: {
				editable: true
			},
			_oUIModel: {
				setData: this.stub()
			},
			_oDraftIndication:{
				clearDraftState: this.stub()
			},
			_oObjectMarker:{
				setVisible: this.stub()
			},
			_bEditMode: false,
			_bFeatureToggle:true
		};

		var fnIsolateFunction = this.oController._setUIByEditStatus.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oObjectPage.setShowFooter.calledOnce, true, "_setUIByEditStatus passed.");

	});

	QUnit.test("_setUIByEditStatus -- edit", function (assert) {
		var oControllerStub = {
			i18nBundle:{
				getText:function(){
					return "text";
				}
			},			
			_oObjectPage: {
				setShowFooter: this.stub()
			},
			_oEditButton: {
				setVisible: this.stub(),
				setText:this.stub()
			},
			_oBtnCopy: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnAdd: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnDelete: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnIndent: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnOutdent: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oOpenInButton:{
				setVisible: this.stub(),
				setEnabled: this.stub(),
				setText:this.stub()
			},
			_oBtnStatus: {
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnMoveUp:{
				setVisible: this.stub(),
				setEnabled: this.stub()
			},
			_oBtnMoveDown:{
				setVisible: this.stub(),
				setEnabled: this.stub()
			},			
			_removeNonTransientMessages:this.stub(),
			_setMandatoryColumnsLabel: this.stub(),
			_oUIData: {
				editable: false
			},
			_oUIModel: {
				setData: this.stub()
			},
			_oDraftIndication:{
				clearDraftState: this.stub()
			},	
			_oObjectMarker:{
				setVisible: this.stub()
			},			
			_bEditMode: true,
			_bFeatureToggle:true
		};

		var fnIsolateFunction = this.oController._setUIByEditStatus.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oObjectPage.setShowFooter.calledOnce, true, "_setUIByEditStatus passed.");

	});

	QUnit.test("_showInvalidAppState success", function (assert) {
		var oToolbar = {
			setEnabled:	this.stub()
		};
		
		var oControllerStub = {
			_oActionButton: {
				setEnabled: this.stub()
			},
			_oOpenInButton: {
				setEnabled: this.stub()
			},			
			_oGanttContainer:{
				getToolbar:function(){
					return oToolbar;
				}
			}
		};

		var fnIsolateFunction = this.oController._showInvalidAppState.bind(oControllerStub);
		fnIsolateFunction("msg");
		assert.equal(oToolbar.setEnabled.calledOnce, true, "_showInvalidAppState passed.");
	});

	QUnit.test("_initAppState success", function (assert) {
		var oControllerStub = {
			_oNavigationHandler: {
				parseNavigation: function () {
					var oDeferred = new jQuery.Deferred();
					oDeferred.resolve();
					return oDeferred.promise();
				}
			},
			_oCrossAppNav:{
				isNavigationSupported:function(){
					var oDeferred = new jQuery.Deferred();
					oDeferred.resolve([]);
					return oDeferred.promise();					
				}
			},
			_oOpenInButton:{
				setEnabled:this.stub()
			},				
			_parseNaviationParameter: this.stub(),
			_removeDemandColumn: this.stub()
		};

		var fnIsolateFunction = this.oController._initAppState.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._parseNaviationParameter.calledOnce, true, "_initAppState passed.");
	});

	QUnit.test("_initAppState fail", function (assert) {
		var oControllerStub = {
			_oNavigationHandler: {
				parseNavigation: function () {
					var oDeferred = new jQuery.Deferred();
					oDeferred.reject();
					return oDeferred.promise();
				}
			},
			_oCrossAppNav:{
				isNavigationSupported:function(){
					var oDeferred = new jQuery.Deferred();
					oDeferred.resolve([]);
					return oDeferred.promise();					
				}
			},	
			_oOpenInButton:{
				setEnabled:this.stub()
			},				
			i18nBundle: {
				getText: function () {
					return "project list is null";
				}
			},
			_removeDemandColumn: this.stub(),
			_showInvalidAppState:this.stub(),
			_parseNaviationParameter: this.stub()
		};

		var fnIsolateFunction = this.oController._initAppState.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._showInvalidAppState.calledOnce, true, "_initAppState passed.");
	});

	QUnit.test("_parseMetadata", function (assert) {
		var aFields =
			[
				{
					name: "control123_fc"
				},
				{
					name: "control123",
					"com.sap.vocabularies.Common.v1.FieldControl":
					{
						Path: "control123_fc"
					}
				}
			];
		var oControllerStub = {
			_oMetadataAnalyser: {
				getFieldsByEntitySetName: function () {
					return aFields;
				}
				
			},
			_createTablePersoController: this.stub(),
			_createExtensionField: this.stub()
		};

		var fnIsolateFunction = this.oController._parseMetadata.bind(oControllerStub);
		var obj = fnIsolateFunction();
		assert.equal(obj.indexOf("control123_fc") >= 0, true, "_parseMetadata passed.");
		assert.equal(obj.indexOf("control123") < 0, true, "_parseMetadata passed.");

	});

	QUnit.test("_createExtensionField", function (assert) {
		var oTable = {
			addColumn: this.stub()
		};
		var oControllerStub = {
			_oGanttChart: {
				getTable: function () {
					return oTable;
				}
			},
			_oFieldMapping:{}
		};

		var aODataFieldMetadata = 
		[
			{ name: "Field1", fieldLabel:"Field1", visible: true }, 
			{ name: "Field2", fieldLabel:"Field2", visible: true }, 
			{ name: "Field3", fieldLabel:"Field3", visible: true },
			{ name: "Field4", fieldLabel:"Field4", visible: true }, 
			{ name: "Field5", fieldLabel:"Field5", visible: true }
		];
		var aIgnoredFields = ["Field1", "Field2", "Field3"];

		var fnIsolateFunction = this.oController._createExtensionField.bind(oControllerStub);
		fnIsolateFunction(aODataFieldMetadata, aIgnoredFields);
		assert.equal(oTable.addColumn.callCount, 2, "_createExtensionField passed.");

	});
	
	QUnit.test("_updateCopilotContexts", function (assert) {
		var component = {
			setCopilotContexts:this.stub()
		};		
		var oContext = {
			getPath:function(){
				return "1234";
			}
		};
		var oControllerStub = {
			_bCoPilotContextsReady:false,
			_oCoPilotContexts : 
				[{
					listGroupName:null,
					aContexts:[]
				}],	
			getOwnerComponent:function(){
				return component;
			},
			_oHeaderData:{
				"__metadata": {
					"id": "/sap/opu/odata/sap/PPM_PRO_PROJECT_PLAN_SRV/C_EnterpriseProjectPlanTP(ProjectUUID=guid'42f2e9af-c4ef-1ed9-85fd-8b04db7ca3e9',IsActiveEntity=true)"
				}
			},
			_sProjectPath:"01234",
			_oTreeTable: {
				getContextByIndex: function () {
					return oContext;
				}
			}
		};

		var fnIsolateFunction = this.oController._updateCopilotContexts.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._bCoPilotContextsReady, true, "_updateCopilotContexts passed.");
		assert.equal(component.setCopilotContexts.callCount, 1, "_updateCopilotContexts passed.");

	});	

	QUnit.test("_loadProjectData -- own draft", function (assert) {
		var oBinding = {
			attachDataReceived: this.stub()
		};
		var oElement = {
			bindElement: this.stub(),
			setEnabled: this.stub(),
			setText:this.stub()
		};
		var data = {
			Update_mc:true,
			DraftAdministrativeData:{
				DraftIsCreatedByMe:true,
				InProcessByUser:""
				
			},
			ProjectProfileCode: "YP05"
		};
		var bVisible =false, sType=null;
		var oControllerStub = {
			_oHeaderModel: {
				setData: this.stub()
			},
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.success(data);
				}
			},
			_operations: {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},				
			_oTreeTable: {
				bindAggregation: this.stub(),
				getBinding: function () {
					return oBinding;
				}
			},
			onDataReceived: this.stub(),
			_setAxisTime: this.stub(),
			_oHeaderData: null,
			_oDataPath: {
				taskPath: '/ZC_PPGA_TASKHIERARCHYTP_N',
				projectPath: '/ZC_PPGA_ProjectTP_n',
				taskNavigation: 'to_Task'
			},
			_oView: {
				byId: function () {
					return oElement;
				},
				setBusy: function () {
				}
			},
			_oEditButton: {
				setVisible: this.stub(),
				setText:this.stub()
			},			
			_oOpenInButton:{
				setVisible: this.stub(),
				setEnabled: this.stub(),
				setText:this.stub()
			},
			_bEditMode:false,
			_oObjectMarker:{
				setVisible:function(visible){
					bVisible = visible;
				},
				setType:function(type){
					sType = type;
				}
			},
			_updateCopilotContexts: this.stub(),
			_removeTransientMessages: this.stub(),
			_removeBEColumn: this.stub()
		};

		var fnIsolateFunction = this.oController._loadProjectData.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(bVisible, true, "object marker is visible.");
		assert.equal(sType, sap.m.ObjectMarkerType.Draft, "own draft.");

	});
	
	QUnit.test("_loadProjectData -- locked object", function (assert) {
		var oBinding = {
			attachDataReceived: this.stub()
		};
		var oElement = {
			bindElement: this.stub(),
			setEnabled: this.stub(),
			setText:this.stub()
		};
		var data = {
			Update_mc:true,
			DraftAdministrativeData:{
				DraftIsCreatedByMe:false,
				InProcessByUser:"Tom"
				
			},
			ProjectProfileCode: "YP02"
		};
		var bVisible =false, sType=null;
		var oControllerStub = {
			_oHeaderModel: {
				setData: this.stub()
			},
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.success(data);
				}
			},
			_operations :{
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oTreeTable: {
				bindAggregation: this.stub(),
				getBinding: function () {
					return oBinding;
				}
			},
			onDataReceived: this.stub(),
			_setAxisTime: this.stub(),
			_oHeaderData: null,
			_oDataPath: {
				taskPath: '/ZC_PPGA_TASKHIERARCHYTP_N',
				projectPath: '/ZC_PPGA_ProjectTP_n',
				taskNavigation: 'to_Task'
			},
			_oView: {
				byId: function () {
					return oElement;
				},
				setBusy: function () {
				}
			},
			_oEditButton: {
				setVisible: this.stub(),
				setText:this.stub()
			},			
			_oOpenInButton:{
				setVisible: this.stub(),
				setEnabled: this.stub(),
				setText:this.stub()
			},
			_bEditMode:false,
			_oObjectMarker:{
				setVisible:function(visible){
					bVisible = visible;
				},
				setType:function(type){
					sType = type;
				}
			},
			_updateCopilotContexts: this.stub(),
			_removeTransientMessages: this.stub(),
			_removeBEColumn: this.stub()
		};

		var fnIsolateFunction = this.oController._loadProjectData.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(bVisible, true, "object marker is visible.");
		assert.equal(sType, sap.m.ObjectMarkerType.Locked, "locked draft.");

	});	

	QUnit.test("_loadProjectData odata error", function (assert) {
		var oBinding = {
			attachDataReceived: this.stub()
		};
		var oElement = {
			bindElement: this.stub(),
			setEnabled: this.stub(),
			setText:this.stub()			
		};
		var data = {};
		var oControllerStub = {
			_oHeaderModel: {
				setData: this.stub()
			},
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.error(data);
				}
			},
			_operations: {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oTreeTable: {
				bindAggregation: this.stub(),
				getBinding: function () {
					return oBinding;
				}
			},
			onDataReceived: this.stub(),
			_setAxisTime: this.stub(),
			_oHeaderData: null,
			_oDataPath: {
				taskPath: '/ZC_PPGA_TASKHIERARCHYTP_N',
				projectPath: '/ZC_PPGA_ProjectTP_n',
				taskNavigation: 'to_Task'
			},
			_oView: {
				byId: function () {
					return oElement;
				},
				setBusy: function () {
				}
			},
			_oEditButton: {
				setVisible: this.stub(),
				setText:this.stub()
			},	
			_oOpenInButton:{
				setVisible: this.stub(),
				setEnabled: this.stub(),
				setText:this.stub()
			},				
			_parseErrorMessage: this.stub(),
			_handleErrorMessage: this.stub(),
			_removeTransientMessages: this.stub(),
			_updateCopilotContexts: this.stub(),
			_removeBEColumn: this.stub()
		};

		var fnIsolateFunction = this.oController._loadProjectData.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._handleErrorMessage.callCount, 1, "_loadProjectData passed.");
	});


	QUnit.test("onDataReceived", function (assert) {
		var oBinding = {
			detachDataReceived: this.stub()
		};
		var oControllerStub = {
			_oView: {
				setBusy: function () {

				}
			},
			_updateCopilotContexts: this.stub(),
			_bInitialFlag: true,
			_oTreeTable: {
				getBinding: function () {
					return oBinding;
				}
			},
			_ajustLayout: this.stub()
		};

		var fnIsolateFunction = this.oController.onDataReceived.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._ajustLayout.callCount, 1, "onDataReceived passed.");
	});

	QUnit.test("onDataReceived", function (assert) {
		var oBinding = {
			detachDataReceived: this.stub()
		};
		var oControllerStub = {
			_oView: {
				setBusy: function () {

				}
			},
			_bInitialFlag: false,
			_updateCopilotContexts: this.stub(),
			_oTreeTable: {
				getBinding: function () {
					return oBinding;
				}
			},
			_ajustLayout: this.stub()
		};

		var fnIsolateFunction = this.oController.onDataReceived.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._ajustLayout.callCount, 0, "onDataReceived passed.");
	});

	QUnit.test("_setAxisTime", function (assert) {
		var oControllerStub = {
			_oGanttChart: {
				setAxisTimeStrategy: this.stub()
			},
			_createAxisTimeStrategy: 
				function(){
					return {
						setTotalHorizon: function() {},
						setVisibleHorizon: function() {}
					};
				}
		};

		var startTime = new Date();
		var endTime = new Date();
		var fnIsolateFunction = this.oController._setAxisTime.bind(oControllerStub);
		fnIsolateFunction(startTime, endTime);
		assert.equal(oControllerStub._oGanttChart.setAxisTimeStrategy.callCount, 1, "passed.");

	});

	QUnit.test("_getExpectedMessages", function (assert) {

		var data = 
		[
			{
				type : "Error",
				getPersistent:function(){
					return true;
				}
			},
			{
				type : "Error",
				getPersistent:function(){
					return true;
				}
			},
			{
				type : "Warning",
				getPersistent:function(){
					return true;
				}
			},
			{
				type : "Warning",
				getPersistent:function(){
					return false;
				}
			}		
		];

		var oModel = {
			getData:function(){
				return data;
			}
		};

		var oControllerStub = {
			_oMessageManager: {
				getMessageModel : function(){
					return oModel;
				}
			}
		};
		
		var fnIsolateFunction = this.oController._getExpectedMessages.bind(oControllerStub);
		var aTransientMessages = fnIsolateFunction(true);		
		var aNonTransientMessages = fnIsolateFunction(false);		
		assert.strictEqual(aTransientMessages.length, 3, "_getExpectedMessages passed");
		assert.strictEqual(aNonTransientMessages.length, 1, "_getExpectedMessages passed");
	});

	QUnit.test("_removeNonTransientMessages", function (assert) {

		var data = 
		[
			{
				type : "Error",
				getPersistent:function(){
					return false;
				}
			}
		];
		var oControllerStub = {
			_getExpectedMessages:function(){
				return data;	
			},
			_oMessageManager: {
				removeMessages :this.stub()
			}
		};
		
		var fnIsolateFunction = this.oController._removeNonTransientMessages.bind(oControllerStub);
		fnIsolateFunction();		
		assert.strictEqual(oControllerStub._oMessageManager.removeMessages.calledOnce, true, "_removeNonTransientMessages passed");
	});

	QUnit.test("_removeTransientMessages", function (assert) {

		var data = 
		[
			{
				type : "Error",
				getPersistent:function(){
					return true;
				}
			}
		];
		var oControllerStub = {
			_getExpectedMessages:function(){
				return data;	
			},
			_oMessageManager: {
				removeMessages :this.stub()
			}
		};
		
		var fnIsolateFunction = this.oController._removeTransientMessages.bind(oControllerStub);
		fnIsolateFunction();		
		assert.strictEqual(oControllerStub._oMessageManager.removeMessages.calledOnce, true, "_removeTransientMessages passed");
	});

	QUnit.test("_handleErrorMessage", function (assert) {

		var oEvent = {
			"error": {
				"code": "PSS4_MSG/004",
				"message": {
					"lang": "en",
					"value": "Enter a value for Responsible Cost Center"
				},
				"innererror": {
					"application": {
						"component_id": "PPM-PRO",
						"service_namespace": "/SAP/",
						"service_id": "PPM_PRO_PROJECT_PLAN_SRV",
						"service_version": "0001"
					},
					"transactionid": "7E181A6A992504B0E005CB6589D790F5",
					"timestamp": "20190516021537.5175390",
					"Error_Resolution": {
						"SAP_Transaction": "For backend administrators: run transaction /IWFND/ERROR_LOG on SAP Gateway hub system and search for entries with the timestamp above for more details",
						"SAP_Note": "See SAP Note 1797736 for error analysis ",
						"Batch_SAP_Note": "See SAP Note 1869434 for details about working with $batch "
					},
					"errordetails": [
						{
							"code": "PSS4_MSG/004",
							"message": "Enter a value for Responsible Cost Center",
							"propertyref": "",
							"severity": "error",
							"target": "/#TRANSIENT#"
						},
						{
							"code": "PSS4_MSG/005",
							"message": "Enter a value for Profit Center",
							"propertyref": "",
							"severity": "error",
							"target": "/#TRANSIENT#"
						},
						{
							"code": "PSS4_MSG/005",
							"message": "Enter a value for Profit Center",
							"propertyref": "",
							"severity": "error",
							"target": "/C_EnterpriseProjectPlanTP(ProjectUUID=guid'42f2e9af-be7f-1ee9-9df0-0cc173533bb1',IsActiveEntity=false)"
						}
					]
				}
			}
		};

		var data = 
		[
			{
				type : "Warning",
				getPersistent:function(){
					return true;
				}
			},	
			{
				type : "Information",
				getPersistent:function(){
					return true;
				}
			},	
			{
				type : "Error",
				getPersistent:function(){
					return true;
				}
			}
		];
		
		var oBinding = {
			filter:	this.stub(),
			getLength:function(){
				return 1;
			}
		};
		
		var oContent = {
			getBinding:function(){
				return oBinding;
			}
		};
		
		var oControllerStub = {
			_getExpectedMessages:function(){
				return data;	
			},
			_oDataPath: {
				preparation:"/C_EnterpriseProjectPlanTPPreparation"
			},
			i18nBundle: {
				getText: function () {
					return "project";
				}
			},			
			_oMessageDialog: {
				state : "Success",
				getContent :function(){
					return [oContent];
				},
				open:this.stub(),
				setState:function(sState)
				{
					this.state = sState;
				},
				setTitle:this.stub()
			}
		};
		
		var fnIsolateFunction = this.oController._handleErrorMessage.bind(oControllerStub);
		fnIsolateFunction(oEvent);		
		assert.strictEqual(oControllerStub._oMessageDialog.state, "Error", "_handleErrorMessage passed");
	});


	QUnit.test("_parseErrorMessage", function (assert) {

		var oEvent = {
			"message": "HTTP request failed",
			"responseText": '{"error":{"code":"SY/530","message":{"lang":"en","value":"RFC-Error: Table is unknown or does not exist."}}}',
			statusCode: "400",
			statusText: "Bad Request"
		};
		var strMsg = this.oController._parseErrorMessage(oEvent);
		var strError = "RFC-Error: Table is unknown or does not exist.\r\n\r\n";
		assert.strictEqual(strMsg, strError, " passed");

	});

	QUnit.test("onAfterRendering", function (assert) {
		var oControllerStub = {
			_ajustLayout: this.stub()
		};
		var fnIsolateFunction = this.oController.onAfterRendering.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._ajustLayout.calledOnce, true, "onAfterRendering passed.");
	});

	QUnit.test("onHeaderStateChange", function (assert) {

		var oEvent = {
			getParameters: function () {
				return {
					expanded: true
				};
			}
		};

		var oControllerStub = {
			_ajustLayout: this.stub()
		};
		var fnIsolateFunction = this.oController.onHeaderStateChange.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oControllerStub._ajustLayout.calledOnce, true, "onHeaderStateChange passed.");
	});

	QUnit.test("onP13nDialog", function (assert) {
		var oDialog = {
			openDialog: this.stub()
		};
		var oControllerStub = {
			_oTPC: oDialog,
			i18nBundle: {
				getText: function () {
					return "Mobile";
				}
			}
		};
		var fnIsolateFunction = this.oController.onP13nDialog.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oDialog.openDialog.calledOnce, true, "onP13nDialog passed.");
	});

	QUnit.test("_createTablePersoController", function (assert) {
		var oLable = {
			getText : function(){
				return "Label";
			}
		};
		
		var oColumn1 = {
			getProperty: function () {
				return "oColumn1";
			},
			getId: function () {
				return "id1";
			},
			getVisible: function () {
				return true;
			},
			getLabel:function(){
				return oLable;
			}            
		};

		var oControllerStub = {
			_oTreeTable: {
				getColumns: function () {
					return [oColumn1];
				}
			},
			onVariantChange: this.stub()
		};

		var fnIsolateFunction = this.oController._createTablePersoController.bind(oControllerStub);
		fnIsolateFunction();
		assert.notEqual(oControllerStub._oTPC, null, "_createTablePersoController passed.");

	});
	
	QUnit.test("_initSmartVariant", function (assert) {
		var oControllerStub = {
			_oCurrentVariant:null,
			_oTreeTable:{},
			onVariantInitialised:this.stub(),
			_setSelectedVariantToTable:this.stub(),
			_oSmartVariant:{
				addPersonalizableControl:this.stub(),
				initialise:this.stub()
			}
		};

		var fnIsolateFunction = this.oController._initSmartVariant.bind(oControllerStub);
		fnIsolateFunction();
		oControllerStub._oTreeTable.applyVariant("test", null);
		var oVariant = oControllerStub._oTreeTable.fetchVariant();		
		assert.equal(oControllerStub._oSmartVariant.initialise.calledOnce, true, "_initSmartVariant passed.");
		assert.equal(oVariant, "test", "_initSmartVariant passed.");
		assert.equal(oControllerStub._oCurrentVariant, "test", "_initSmartVariant passed.");
	});	

	QUnit.test("onVariantInitialised", function (assert) {
		var oControllerStub = {
			_oCurrentVariant:null
		};

		var fnIsolateFunction = this.oController.onVariantInitialised.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oCurrentVariant, "STANDARD", "onVariantInitialised passed.");
	});

	QUnit.test("onVariantChange", function (assert) {

		var oLable1 = {
			getText : function(){
				return "ColTaskName";
			}
		};
		
		var oLable2 = {
			getText : function(){
				return "ColTaskID";
			}
		};		

		var oColumn1 = {
			getProperty: function () {
				return "ColTaskName";
			},
			getId: function () {
				return "ColTaskName";
			},
			getVisible:function(){
				return true;	
			},
			getLabel:function(){
				return oLable1;
			}  			
		};

		var oColumn2 = {
			getProperty: function () {
				return "ColTaskID";
			},
			getId: function () {
				return "ColTaskID";
			},
			getVisible:function(){
				return false;	
			},
			getLabel:function(){
				return oLable2;
			}  			
		};

		var oEvent = {
			getParameter :function(){
				return true;
			}
		};

		var oControllerStub = {
			_oTreeTable: {
				getColumns: function () {
					return [oColumn1, oColumn2];
				}
			},
			_oCurrentVariant:{},
			_oSmartVariant:{
				currentVariantSetModified:this.stub()
			}
	
		};

		var fnIsolateFunction = this.oController.onVariantChange.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oControllerStub._oCurrentVariant.ColumnsVal.length, 2, "onVariantChange passed.");
		assert.equal(oControllerStub._oCurrentVariant.ColumnsVal[0].Visible, true, "onVariantChange passed.");
		assert.equal(oControllerStub._oCurrentVariant.ColumnsVal[1].Visible, false, "onVariantChange passed.");
	});

	QUnit.test("_setSelectedVariantToTable", function (assert) {

		var oLable1 = {
			getText : function(){
				return "ColTaskName";
			}
		};
		
		var oLable2 = {
			getText : function(){
				return "ColTaskID";
			}
		};

		var bVisible1 = null, bVisible2 = null;
		var oColumn1 = {
			getProperty: function () {
				return "ColTaskName";
			},
			setVisible: function (visible) {
				bVisible1 = visible;
			},
			getLabel:function(){
				return oLable1;
			}  				
		};

		var oColumn2 = {
			getProperty: function () {
				return "ColTaskID";
			},
			setVisible: function (visible) {
				bVisible2 = visible;
			},
			getLabel:function(){
				return oLable2;
			}  				
		};

		var oControllerStub = {
			_oTreeTable: {
				getColumns: function () {
					return [oColumn1, oColumn2];
				},
				removeColumn: this.stub(),
				insertColumn: this.stub()
			},
			_oTPC:{
				setCurrentColumns:this.stub()
			},
			_oCurrentVariant:{
				"ColumnsVal" : 
				[
					{
						index: 0,
						fieldName:"ColTaskName",
						Visible:false
					},
					{
						index: 1,
						fieldName:"ColTaskID",
						Visible:true						
					}
				]				
			},
			_aInitialColumnsData:{
				"ColumnsVal" : 
				[
					{
						index: 0,
						fieldName:"ColTaskName",
						Visible:true
					},
					{
						index: 1,
						fieldName:"ColTaskID",
						Visible:false						
					}
				]				
			}
		};

		var fnIsolateFunction = this.oController._setSelectedVariantToTable.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(bVisible1, false, "_setSelectedVariantToTable passed.");
		assert.equal(bVisible2, true, "_setSelectedVariantToTable passed.");
	});

	QUnit.test("_setSelectedVariantToTable", function (assert) {
		var oLable1 = {
			getText : function(){
				return "ColTaskName";
			}
		};
		
		var oLable2 = {
			getText : function(){
				return "ColTaskID";
			},
		};
		var bVisible1 = null, bVisible2 = null;
		var oColumn1 = {
			getProperty: function () {
				return "ColTaskName";
			},
			setVisible: function (visible) {
				bVisible1 = visible;
			},
			getLabel:function(){
				return oLable1;
			}  				
			
		};

		var oColumn2 = {
			getProperty: function () {
				return "ColTaskID";
			},
			setVisible: function (visible) {
				bVisible2 = visible;
			},
			getLabel:function(){
				return oLable2;
			}  				
		};

		var oControllerStub = {
			_oTreeTable: {
				getColumns: function () {
					return [oColumn1, oColumn2];
				},
				removeColumn: this.stub(),
				insertColumn: this.stub()
			},
			_oTPC:{
				setCurrentColumns:this.stub()
			},
			_oCurrentVariant:{},
			_aInitialColumnsData:
			[
				{
					index: 0,
					fieldName:"ColTaskName",
					Visible:true
				},
				{
					index: 1,
					fieldName:"ColTaskID",
					Visible:false						
				}
			]	
		};

		var fnIsolateFunction = this.oController._setSelectedVariantToTable.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(bVisible1, true, "_setSelectedVariantToTable passed.");
		assert.equal(bVisible2, false, "_setSelectedVariantToTable passed.");
	});

	QUnit.test("_checkAxisTime start datetime", function (assert) {

		var oToday = new Date();

		var oDayFinish = new Date(oToday.getTime() + 30 * 24 * 60 * 60 * 1000);
		var oDayStart = new Date(oToday.getTime() - 30 * 24 * 60 * 60 * 1000);

		var oStart = new Date(oToday.getTime() - 40 * 24 * 60 * 60 * 1000);

		var oControllerStub = {
			_oEarliestStartDate: null,
			_oLatestFinishDate: null,
			_oHeaderData: {
				EarliestStartDate: oDayStart,
				LatestFinishDate: oDayFinish
			},
			_setAxisTime: this.stub()
		};

		var fnIsolateFunction = this.oController._checkAxisTime.bind(oControllerStub);
		var bResult = fnIsolateFunction("PlannedStartDate", oStart);
		assert.equal(bResult, false, "_checkAxisTime passed.");

	});

	QUnit.test("_checkAxisTime start datetime -- 40 days", function (assert) {

		var oToday = new Date();

		var oDayFinish = new Date(oToday.getTime() + 30 * 24 * 60 * 60 * 1000);
		var oDayStart = new Date(oToday.getTime() - 30 * 24 * 60 * 60 * 1000);

		var oStart = new Date(oToday.getTime() - 70 * 24 * 60 * 60 * 1000);

		var oControllerStub = {
			_oEarliestStartDate: null,
			_oLatestFinishDate: null,
			_oHeaderData: {
				EarliestStartDate: oDayStart,
				LatestFinishDate: oDayFinish
			},
			_setAxisTime: this.stub()
		};

		var fnIsolateFunction = this.oController._checkAxisTime.bind(oControllerStub);
		var bResult = fnIsolateFunction("PlannedStartDate", oStart);
		assert.equal(bResult, true, "_checkAxisTime passed.");

	});

	QUnit.test("_checkAxisTime finish datetime", function (assert) {

		var oToday = new Date();

		var oDayFinish = new Date(oToday.getTime() + 30 * 24 * 60 * 60 * 1000);
		var oDayStart = new Date(oToday.getTime() - 30 * 24 * 60 * 60 * 1000);

		var oFinish = new Date(oToday.getTime() + 40 * 24 * 60 * 60 * 1000);

		var oControllerStub = {
			_oEarliestStartDate: null,
			_oLatestFinishDate: null,
			_oHeaderData: {
				EarliestStartDate: oDayStart,
				LatestFinishDate: oDayFinish
			},
			_setAxisTime: this.stub()
		};

		var fnIsolateFunction = this.oController._checkAxisTime.bind(oControllerStub);
		var bResult =fnIsolateFunction("PlannedEndDate", oFinish);
		assert.equal(bResult, false, "_checkAxisTime passed.");

	});
	
	QUnit.test("_checkAxisTime finish datetime -- 40 days", function (assert) {

		var oToday = new Date();

		var oDayFinish = new Date(oToday.getTime() + 30 * 24 * 60 * 60 * 1000);
		var oDayStart = new Date(oToday.getTime() - 30 * 24 * 60 * 60 * 1000);

		var oFinish = new Date(oToday.getTime() + 70 * 24 * 60 * 60 * 1000);

		var oControllerStub = {
			_oEarliestStartDate: null,
			_oLatestFinishDate: null,
			_oHeaderData: {
				EarliestStartDate: oDayStart,
				LatestFinishDate: oDayFinish
			},
			_setAxisTime: this.stub()
		};

		var fnIsolateFunction = this.oController._checkAxisTime.bind(oControllerStub);
		var bResult =fnIsolateFunction("PlannedEndDate", oFinish);
		assert.equal(bResult, true, "_checkAxisTime passed.");

	});	

	QUnit.test("onPropertyChange success", function (assert) {

		var oEvent = {
			getParameter: function (para) {
				if(para == "path"){
					return "PlannedStartDate";
				}else if(para == "value"){
					return "NewValue";
				}else if(para == "context"){
					return {
						getPath:function(){
							return "path";
						}
					};
				}
			}
		};
		
		var data = {
			Task:"ID 1",
			TaskName:"WBS 1",
			EarliestStartDate:"/Date(1558483200000)/",
			LatestFinishDate:"/Date(1577750400000)/"
		};
		
		var oRowData = {
			HierarchyNodeLevel : 0
		};

		var oControllerStub = {
			_oTreeTable: {
				getSelectedIndices: function () {
					return [1];
				},
				setSelectedIndex:this.stub()
			},			
			_oDataModel: {
				update: function (path, value, parameter) {
					if(parameter.success)
					{
						return parameter.success(data, data);	
					}
				},
				read: function (path, parameter) {
					if(parameter.success)
					{
						return parameter.success(data, data);	
					}
				},
				getProperty:function(){
					return oRowData;
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				saveFunction: "/C_EnterpriseProjectPlanTPEdit",
				preparation: "/C_EnterpriseProjectPlanTPEdit"
			},
			_removeTransientMessages : this.stub(),
			_removeActionInfoMessages: this.stub(),
			_setAxisTime:this.stub(),
			_checkAxisTime:function(){
				return true;
			},
			_handleErrorMessage: this.stub(),
			_oDraftIndication:{
				clearDraftState: this.stub(),
				showDraftSaving: this.stub(),
				showDraftSaved: this.stub()
			},				
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}
		};

		var fnIsolateFunction = this.oController.onPropertyChange.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oControllerStub._setAxisTime.callCount, 1, "onPropertyChange passed.");

	});

	QUnit.test("openProcessingStatus", function (assert) {
		var oData = {
			results:
				[
					{ StatusT: "created" }
				]
		};

		var data = {
			getProperty: function () {
				return "abc";
			}
		};

		var oLable = new sap.m.Label();

		sap.m.Label.prototype.getBindingContext = function () {
			return data;
		};

		var oControllerStub = {
			_sProjectPath: "project",
			_oDataPath: {
				statusFunction: 'to_Manager'
			},
			_oDataModel: {
				callFunction: function (path, parameter) {
					return parameter.success(oData, oData);
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			i18nBundle: {
				getText: function () {
					return "Mobile";
				}
			},
			_oHeaderData:
			{
				ProcessingStatusText: "create"
			},
			_oLinkProcessingStatus: oLable
		};

		var fnIsolateFunction = this.oController.openProcessingStatus.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(true, true, "openProcessingStatus passed.");

	});

	QUnit.test("openProjectManager", function (assert) {
		var oData = {
			project: {
				to_Manager: {
					PersonFullName: "person",
					DefaultEmailAddress: "123@123.com",
					PhoneNumber: "123",
					MobilePhoneNumber: "123"
				}
			}
		};

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData);

		var oLable = new sap.m.Label();

		var oControllerStub = {
			_sProjectPath: "project",
			_oDataPath: {
				pmNavigation: 'to_Manager'
			},
			_oDataModel: oModel,
			i18nBundle: {
				getText: function () {
					return "Mobile";
				}
			},
			_oLinkProjectManager: oLable
		};

		var fnIsolateFunction = this.oController.openProjectManager.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(true, true, "openProjectManager passed.");

	});

	QUnit.test("onExpandPressed", function (assert) {

		var oBinding = {
			attachDataReceived: this.stub()
		};
		var oControllerStub = {
			_oTreeTable: {
				expandToLevel: this.stub(),
				fireToggleOpenState: this.stub(),
				getBinding: function () {
					return oBinding;
				}
			},
			_oView: {
				setBusy: function () {

				}
			}
		};

		var fnIsolateFunction = this.oController.onExpandPressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oTreeTable.expandToLevel.calledOnce, true, "onExpandPressed passed.");

	});

	QUnit.test("onCollapsePressed", function (assert) {

		var oBinding = {
			getNodes: function () {
				return [1, 2, 3, 4];
			},
			attachDataReceived: this.stub()
		};
		var oControllerStub = {
			_oTreeTable: {
				collapse: this.stub(),
				expandToLevel: this.stub(),
				fireToggleOpenState: this.stub(),
				isExpanded: function () {
					return true;
				},
				getBinding: function () {
					return oBinding;
				}
			},
			_oView: {
				setBusy: function () {

				}
			}
		};

		var fnIsolateFunction = this.oController.onCollapsePressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oTreeTable.expandToLevel.callCount, 1, "onCollapsePressed passed.");

	});

	/*
	QUnit.test("onExpandToLevelSubmit", function(assert) {

		var oBinding = {
			attachDataReceived:this.stub()
		};

		var oControllerStub = {
			_oTreeTable:{
				expandToLevel:this.stub(),
				getBinding:function(){
					return oBinding;
				}
			},
			_oView:{
				setBusy:function(){

				}
			}
		};

		var oEvent = {
			getParameters :function(){
				return {
					value:2
				};
			}
		};

		var fnIsolateFunction = this.oController.onExpandToLevelSubmit.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oControllerStub._oTreeTable.expandToLevel.calledOnce, true, "onExpandToLevelSubmit passed.");

	});
	*/

	QUnit.test("_editEntity success", function (assert) {

		var data = {
			ProjectUUID: "abc"
		};

		var oControllerStub = {
			_oDataModel: {
				callFunction: function (path, parameter) {
					return parameter.success(data, data);
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				editFunction: "/C_EnterpriseProjectPlanTPEdit"
			},
			_setUIByEditStatus: this.stub(),
			_loadProjectData: this.stub(),
			_removeTransientMessages: this.stub(),
			_handleErrorMessage: this.stub(),
			_resetProjectData: this.stub()
		};

		var fnIsolateFunction = this.oController._editEntity.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._loadProjectData.callCount, 1, "_editEntity passed.");

	});

	QUnit.test("_editEntity fail", function (assert) {

		var data = {
			statusCode: "411"
		};

		var oControllerStub = {
			_oDataModel: {
				callFunction: function (path, parameter) {
					return parameter.error(data, data);
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				editFunction: "/C_EnterpriseProjectPlanTPEdit"
			},
			_checkUserLock: this.stub(),
			_removeTransientMessages: this.stub(),
			_handleErrorMessage: this.stub(),
			_resetProjectData: this.stub()
		};

		var fnIsolateFunction = this.oController._editEntity.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._handleErrorMessage.callCount, 1, "_editEntity passed.");

	});
	
	QUnit.test("_createUnsaveChangesDialog", function (assert) {

		var oModel = new sap.ui.model.json.JSONModel();

		var oControllerStub = {
			i18nBundle: {
				getText: function () {
					return "TEXT";
				}
			},
			_editEntity:this.stub()
		};

		var fnIsolateFunction = this.oController._createUnsaveChangesDialog.bind(oControllerStub);
		fnIsolateFunction();
		assert.notEqual(oControllerStub._oUnsaveChangesDialog, null, "_createUnsaveChangesDialog passed.");
	});
	
	QUnit.test("_checkUserLock -- no DraftAdministrativeData", function (assert) {

		var data = {
			ProjectUUID: "abc"
		};

		var oControllerStub = {
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.success(data, data);
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oView: {
				setBusy: this.stub()
			},
			_sProjectPath:"/C_EnterpriseProjectPlanTPEdit",
			_removeTransientMessages: this.stub(),
			_parseErrorMessage: this.stub()
		};

		var fnIsolateFunction = this.oController._checkUserLock.bind(oControllerStub);
		fnIsolateFunction(data);
		assert.equal(oControllerStub._parseErrorMessage.callCount, 1, "_checkUserLock passed.");

	});	

	QUnit.test("_checkUserLock -- locked", function (assert) {

		var data = {
			statusCode: "411",
			DraftAdministrativeData:{
				InProcessByUser : true
			}
		};

		var oControllerStub = {
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.success(data, data);
				}
			},
			_oView: {
				setBusy: this.stub()
			},
			_sProjectPath:"/C_EnterpriseProjectPlanTPEdit",
			_removeTransientMessages: this.stub(),
			_parseErrorMessage: this.stub()
		};

		var fnIsolateFunction = this.oController._checkUserLock.bind(oControllerStub);
		fnIsolateFunction(data);
		assert.equal(oControllerStub._parseErrorMessage.callCount, 1, "_checkUserLock passed.");
	});	
	
	QUnit.test("_checkUserLock -- unsaved change", function (assert) {

		var data = {
			statusCode: "411",
			DraftAdministrativeData:{
				CreatedByUserDescription : "Snow"
			}
		};
		
		var oDialog = {
			open: this.stub()
		};

		var oControllerStub = {
			_oDataModel: {
				read: function (path, parameter) {
					return parameter.success(data, data);
				}
			},
			_oView: {
				setBusy: this.stub()
			},
			_sProjectPath:"/C_EnterpriseProjectPlanTPEdit",
			_parseErrorMessage: this.stub(),
			_oUnsaveChangesDialog:null,
			_createUnsaveChangesDialog:function(){
				this._oUnsaveChangesDialog =  oDialog;
			},
			_removeTransientMessages: this.stub(),
			_oDialogModel:{
				setProperty: this.stub()
			},
			i18nBundle:{
				getText:function(){
					return "abc";
				}
			}
		};

		var fnIsolateFunction = this.oController._checkUserLock.bind(oControllerStub);
		fnIsolateFunction(data);
		assert.equal(oDialog.open.callCount, 1, "_checkUserLock passed.");
	});		

	QUnit.test("onEditPress success", function (assert) {

		var data = {
			ProjectUUID: "abc"
		};

		var oControllerStub = {
			_oDataModel: {
				callFunction: function (path, parameter) {
					return parameter.success(data, data);
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},				
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				editFunction: "/C_EnterpriseProjectPlanTPEdit"
			},
			_setUIByEditStatus: this.stub(),
			_removeTransientMessages: this.stub(),
			_handleErrorMessage: this.stub(),
			_loadProjectData: this.stub(),
			_resetProjectData: this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}			
		};

		var fnIsolateFunction = this.oController.onEditPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._loadProjectData.callCount, 1, "onEditPress passed.");

	});

	QUnit.test("onEditPress fail -- don't need recheck", function (assert) {

		var data = {
			statusCode: "411"
		};

		var oControllerStub = {
			_oDataModel: {
				callFunction: function (path, parameter) {
					return parameter.error(data, data);
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				editFunction: "/C_EnterpriseProjectPlanTPEdit"
			},
			_checkUserLock: this.stub(),
			_handleErrorMessage: this.stub(),
			_removeTransientMessages: this.stub(),
			_resetProjectData: this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}			
		};

		var fnIsolateFunction = this.oController.onEditPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._handleErrorMessage.callCount, 1, "onEditPress passed.");
		assert.equal(oControllerStub._checkUserLock.callCount, 0, "onEditPress passed.");

	});
	
	QUnit.test("onEditPress fail -- need recheck", function (assert) {

		var data = {
			statusCode: "409"
		};

		var oControllerStub = {
			_oDataModel: {
				callFunction: function (path, parameter) {
					return parameter.error(data, data);
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				editFunction: "/C_EnterpriseProjectPlanTPEdit"
			},
			_checkUserLock: this.stub(),
			_removeTransientMessages: this.stub(),
			_parseErrorMessage: this.stub(),
			_resetProjectData: this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}			
		};

		var fnIsolateFunction = this.oController.onEditPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._checkUserLock.callCount, 1, "onEditPress passed.");
		assert.equal(oControllerStub._parseErrorMessage.callCount, 0, "onEditPress passed.");

	});	

	QUnit.test("onSavePress success", function (assert) {

		var data = {
			ProjectUUID: "abc"
		};

		var oControllerStub = {
			_oDataModel: {
				callFunction: function (path, parameter) {
					if(parameter.success)
					{
						return parameter.success(data, data);	
					}
				},
				submitChanges:this.stub()
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},				
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				saveFunction: "/C_EnterpriseProjectPlanTPEdit",
				preparation: "/C_EnterpriseProjectPlanTPEdit"
			},
			_setUIByEditStatus: this.stub(),
			_loadProjectData: this.stub(),
			_resetProjectData: this.stub(),
			_checkBeforeSave:function(){
				return true;
			},
			_removeTransientMessages : this.stub(),
			_handleErrorMessage: this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}
		};

		var fnIsolateFunction = this.oController.onSavePress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._loadProjectData.callCount, 1, "onSavePress passed.");

	});

	QUnit.test("onSavePress -- validation failed", function (assert) {

		var data = {
			ProjectUUID: "abc"
		};

		var oControllerStub = {
			_oDataModel: {
				callFunction: function (path, parameter) {
					if(parameter.success)
					{
						return parameter.success(data, data);	
					}
				},
				submitChanges:this.stub()
			},
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				saveFunction: "/C_EnterpriseProjectPlanTPEdit",
				preparation: "/C_EnterpriseProjectPlanTPEdit"
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_setUIByEditStatus: this.stub(),
			_loadProjectData: this.stub(),
			_resetProjectData: this.stub(),
			_checkBeforeSave:function(){
				return false;
			},
			i18nBundle: {
				getText: function () {
					return "Error";
				}
			},			
			_oMessageDialog:{
				setTitle:this.stub(),	
				setState:this.stub(),
				open:this.stub()
			},
			_removeTransientMessages : this.stub(),
			_handleErrorMessage: this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}
		};

		var fnIsolateFunction = this.oController.onSavePress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oMessageDialog.open.callCount, 1, "onSavePress passed.");

	});


	QUnit.test("onSavePress fail", function (assert) {

		var data = {
			ProjectUUID: "abc"
		};

		var oControllerStub = {
			_oDataModel: {
				callFunction: function (path, parameter) {
					if(parameter.error)
					{
						return parameter.error(data, data);	
					}
					
				},
				submitChanges:this.stub()
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oView: {
				setBusy: this.stub()
			},
			_oDataPath: {
				saveFunction: "/C_EnterpriseProjectPlanTPEdit",
				preparation: "/C_EnterpriseProjectPlanTPEdit"
			},
			_checkBeforeSave:function(){
				return true;
			},
			_removeTransientMessages : this.stub(),
			_parseErrorMessage: this.stub(),
			_handleErrorMessage: this.stub(),
			_resetProjectData: this.stub(),
			onMessagesButtonPress: this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}			
		};

		var fnIsolateFunction = this.oController.onSavePress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._handleErrorMessage.callCount, 1, "onSavePress passed.");

	});

	QUnit.test("_deleteDraft success", function (assert) {

		var data = {
			getProperty: function () {
				return "abc";
			}
		};

		var oControllerStub = {
			_oDataModel: {
				remove: function (path, parameter) {
					return parameter.success();
				}
			},
			_oView: {
				setBusy: this.stub()
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},				
			_sProjectPath: "123",
			_oLinkProcessingStatus: {
				getBindingContext: function () {
					return data;
				}
			},
			_oHeaderData:
			{
				ActiveUUID: "123456"
			},
			_setUIByEditStatus: this.stub(),
			_loadProjectData: this.stub(),
			_resetProjectData: this.stub(),
			_removeTransientMessages: this.stub(),
			_handleErrorMessage: this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}			
		};

		var fnIsolateFunction = this.oController._deleteDraft.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._loadProjectData.callCount, 1, "_deleteDraft passed.");

	});

	QUnit.test("_deleteDraft fail", function (assert) {

		var data = {
			getProperty: function () {
				return "abc";
			}
		};

		var oControllerStub = {
			_oDataModel: {
				remove: function (path, parameter) {
					return parameter.error(data);
				}
			},
			_operations : {
				callAction: "callAction",
				addEntry: "addEntry",
				saveEntity: "saveEntity",
				deleteEntity: "deleteEntity",
				editEntity: "editEntity",
				modifyEntity: "modifyEntity",
				activateDraftEntity: "activateDraftEntity",
				saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
				getCollection: "getCollection"
			},			
			_oView: {
				setBusy: this.stub()
			},
			_sProjectPath: "123",
			_oLinkProcessingStatus: {
				getBindingContext: function () {
					return data;
				}
			},
			_oHeaderData:
			{
				ActiveUUID: "123456"
			},
			_handleErrorMessage: this.stub(),
			_resetProjectData: this.stub(),
			_removeTransientMessages: this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}			
		};

		var fnIsolateFunction = this.oController._deleteDraft.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._handleErrorMessage.callCount, 1, "_deleteDraft passed.");

	});
	
	QUnit.test("onCancelPress draft changed", function (assert) {
		
		var oPopover = {
			openBy: this.stub()
		};
		
		var oControllerStub = {
			_bIsDraftModified:true,
			_oDiscardDraftPopover:oPopover,
			_removeTransientMessages: this.stub(),
			_deleteDraft:this.stub(),
			_oBtnCancel:null
		};

		var fnIsolateFunction = this.oController.onCancelPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oPopover.openBy.callCount, 1, "onCancelPress passed.");
		assert.equal(oControllerStub._deleteDraft.callCount, 0, "onCancelPress passed.");

	});	
	
	QUnit.test("onCancelPress no change", function (assert) {
		
		var oPopover = {
			openBy: this.stub()
		};
		
		var oControllerStub = {
			_bIsDraftModified:false,
			_oDiscardDraftPopover:oPopover,
			_createDiscardDraftPopover: this.stub(),
			_deleteDraft:this.stub(),
			_oBtnCancel:null
		};

		var fnIsolateFunction = this.oController.onCancelPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oPopover.openBy.callCount, 0, "onCancelPress passed.");
		assert.equal(oControllerStub._deleteDraft.callCount, 1, "onCancelPress passed.");

	});		

	QUnit.test("_createDiscardDraftPopover", function (assert) {

		
		var oControllerStub = {
			i18nBundle: {
				getText: function () {
					return "TEXT";
				}
			},
			_deleteDraft:this.stub()
		};

		var fnIsolateFunction = this.oController._createDiscardDraftPopover.bind(oControllerStub);
		fnIsolateFunction();
		assert.notEqual(oControllerStub._oDiscardDraftPopover, null, "_createDiscardDraftPopover passed.");
	});

	QUnit.test("_resetProjectData", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				storeInnerAppStateWithImmediateReturn: function(){
					return {appStateKey:null};
				},
				replaceHash: this.stub()
			},
			_oEarliestStartDate: null,
			_oLatestFinishDate: null,
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true",
			_oActionSheet:{
				destroy: this.stub()
			},
			_oObjectMarkerPopover:{
				destroy: this.stub()
			}			
		};

		var fnIsolateFunction = this.oController._resetProjectData.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oEarliestStartDate, null, "_resetProjectData passed.");

	});

	QUnit.test("onDetailPressed click on header", function (assert) {

		var oRow = {
			getIndex: function () {
				return 0;
			}
		};

		var oContext = {

			getPath: function () {
				return "spath";
			}
		};

		var oEvent = {
			getParameter: function () {
				return oRow;
			}
		};

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},

			_oTreeTable: {
				getContextByIndex: function () {
					return oContext;
				}
			},

			_oDataModel: {
				getProperty: function () {
					return {
						ProjectUUID: "123456",
						TaskUUID: "123456",
						Task: "Package",
						IsActiveEntity: "true"
					};
				}
			},

			_oEarliestStartDate: null,
			_oLatestFinishDate: null,
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onDetailPressed.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onDetailPressed passed.");

	});

	QUnit.test("onDetailPressed click on work package", function (assert) {

		var oRow = {
			getIndex: function () {
				return 2;
			}
		};

		var oContext = {

			getPath: function () {
				return "spath";
			}
		};

		var oEvent = {
			getParameter: function () {
				return oRow;
			}
		};

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},

			_oTreeTable: {
				getContextByIndex: function () {
					return oContext;
				}
			},

			_oDataModel: {
				getProperty: function () {
					return {
						ProjectUUID: "123456",
						TaskUUID: "123456",
						Task: "Package",
						IsActiveEntity: "true"
					};
				}
			},

			_oEarliestStartDate: null,
			_oLatestFinishDate: null,
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onDetailPressed.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onDetailPressed passed.");
	});

	QUnit.test("onToggleOpenState", function (assert) {
		var oControllerStub = {
			_oTreeTable: {
				fireRowSelectionChange: this.stub()
			}
		};

		var fnIsolateFunction = this.oController.onToggleOpenState.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oTreeTable.fireRowSelectionChange.calledOnce, true, "onToggleOpenState passed.");
	});

	QUnit.test("_getRowDataByIndex", function (assert) {
		var oContext = {
			getPath: this.stub()
		};

		var oRowData = {
			"TaskUUID": "0001",
			"ProcessingStatus": "Release",
			"WBSElementInternalID": "00000001"
		};

		var oControllerStub = {
			_oTreeTable: {
				getContextByIndex: function () {
					return oContext;
				}
			},
			_oDataModel: {
				getProperty: function () {
					return oRowData;
				}
			}
		};

		var fnIsolateFunction = this.oController._getRowDataByIndex.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oContext.getPath.calledOnce, true, "_getRowDataByIndex passed.");
	});

	QUnit.test("_disableActionButton", function (assert) {
		var nCount = 0;

		var oControllerStub = {
			_oBtnCopy: {
				setEnabled: function (bEnable) {
					if (!bEnable) {
						nCount++;
					}
				}
			},
			_oBtnAdd: {
				setEnabled: function (bEnable) {
					if (!bEnable) {
						nCount++;
					}
				}
			},
			_oBtnIndent: {
				setEnabled: function (bEnable) {
					if (!bEnable) {
						nCount++;
					}
				}
			},
			_oBtnOutdent: {
				setEnabled: function (bEnable) {
					if (!bEnable) {
						nCount++;
					}
				}
			},
			_oBtnMoveUp: {
				setEnabled: function (bEnable) {
					if (!bEnable) {
						nCount++;
					}
				}
			},
			_oBtnMoveDown: {
				setEnabled: function (bEnable) {
					if (!bEnable) {
						nCount++;
					}
				}
			},			
			_oBtnDelete: {
				setEnabled: function (bEnable) {
					if (!bEnable) {
						nCount++;
					}
				}
			}
		};

		var fnIsolateFunction = this.oController._disableActionButton.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(nCount, 7, "_disableActionButton passed.");
	});

	QUnit.test("onRowSelectionChange select one row", function (assert) {
		var nCount = 0;

		var oControllerStub = {
			_oTreeTable: {
				getSelectedIndices: function () {
					return [1];
				}
			},
			_oBtnCopy: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnAdd: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnStatus: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnIndent: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnOutdent: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnMoveUp: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnMoveDown: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},			
			_oBtnDelete: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oStatusData: {
				status: null,
				taskUUID: null
			},
			_getRowDataByIndex: function () {
				return {
					"TaskUUID": "0001",
					"ProcessingStatus": "Release",
					"WBSElementInternalID": "00000001"
				};
			},
			_disableActionButton:this.stub(),
			_bFeatureToggle:true,
			_bEditMode:true
		};

		var fnIsolateFunction = this.oController.onRowSelectionChange.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(nCount, 7, "onRowSelectionChange passed.");
	});

	QUnit.test("onRowSelectionChange select two rows", function (assert) {

		var nCount = 0;

		var oControllerStub = {
			_oTreeTable: {
				getSelectedIndices: function () {
					return [1, 2];
				}
			},

			_oBtnAdd: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnStatus: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnIndent: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnOutdent: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnMoveUp: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnMoveDown: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},				
			_oBtnDelete: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_disableActionButton:this.stub(),
			_bFeatureToggle:true,
			_bEditMode:true
		};

		var fnIsolateFunction = this.oController.onRowSelectionChange.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(nCount, 0, "onRowSelectionChange passed.");
	});

	QUnit.test("onRowSelectionChange no row selected", function (assert) {

		var nCount = 0;

		var oControllerStub = {
			_oTreeTable: {
				getSelectedIndices: function () {
					return [];
				}
			},

			_oBtnAdd: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnStatus: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnIndent: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnOutdent: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_oBtnDelete: {
				setEnabled: function (bEnable) {
					if (bEnable) {
						nCount++;
					}
				}
			},
			_disableActionButton:this.stub()			
		};

		var fnIsolateFunction = this.oController.onRowSelectionChange.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(nCount, 0, "onRowSelectionChange passed.");
	});

	QUnit.test("onAddPressed", function (assert) {
		var that = this;
		var oBinding = {
			getNodeByIndex:function(nPos){
				return {
					magnitude : 10
				};
			},
			_restoreTreeState: function () {
				return {
					then: that.stub()
				};
			},
			_fireChange: that.stub()
		};

		var oContext = {
			getPath:function(){
				return "1234";
			}
		};
		
		var oControl = {
			focus:this.stub()
		};
		
		var nFirstVisibleRow = 0, nSelectIndex = 0;

		var oControllerStub = {
			_removeTransientMessages:this.stub(),
			_oDataPath: {
				addFunction: "/C_EnterpriseProjectPlanTPEdit"
			},			
			_oView: {
				setBusy: function () {

				}
			},			
			_oTreeTable:{
				getBinding: function () {
					return oBinding;
				},
				getSelectedIndices:function(){
					return [15];
				},
				getContextByIndex:function(){
					return oContext;
				},
				isExpanded:function(){
					return true;
				},
				getVisibleRowCount:function(){
					return 20;
				},
				getFirstVisibleRow:function(){
					return 0;
				},
				setFirstVisibleRow:function(nRow){
					nFirstVisibleRow = nRow;
				},
				setSelectedIndex:function(nIndex){
					nSelectIndex = nIndex;
				},
				getCellControl:function(){
					return oControl;
				}
			},
			
			_oDataModel: {
				getProperty: function () {
					return {
						ActiveTaskUUID: "123456",
						ParentObjectUUID: "123456",
						TaskUUID: "123456",
						IsActiveEntity: "true"
					};
				},
				callFunction: function (path, parameter) {
					return parameter.success();
				}				
			},
			_removeActionInfoMessages: this.stub(),
			_disableActionButton:this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}
		};

		var fnIsolateFunction = this.oController.onAddPressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(nFirstVisibleRow, 0, "onAddPressed passed.");
	});
	
	QUnit.test("onDeletePressed", function (assert) {
		var that = this;
		var oBinding = {
			getNodeByIndex:function(nPos){
				return {
					magnitude : 10
				};
			},
			_restoreTreeState: function () {
				return {
					then: that.stub()
				};
			},
			_fireChange: that.stub()
		};

		var oContext = {
			getPath:function(){
				return "1234";
			}
		};

		var oControllerStub = {
			_removeTransientMessages:this.stub(),
			_oDataPath: {
				deleteFunction: "/C_EnterpriseProjectPlanTPEdit"
			},			
			_oView: {
				setBusy: this.stub()
			},			
			_oTreeTable:{
				getBinding: function () {
					return oBinding;
				},
				getSelectedIndices:function(){
					return [15];
				},
				getContextByIndex:function(){
					return oContext;
				},
				setSelectedIndex:function(){
					
				}
			},
			
			_oMessageManager:{
				removeAllMessages: this.stub()
			},
			
			_oDataModel: {
				getProperty: function () {
					return {
						ActiveTaskUUID: "123456",
						ParentObjectUUID: "123456",
						TaskUUID: "123456",
						IsActiveEntity: "true"
					};
				},
				callFunction: function (path, parameter) {
					return parameter.success();
				}				
			},
			_disableActionButton:this.stub(),
			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			}
		};

		var fnIsolateFunction = this.oController.onDeletePressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oView.setBusy.callCount, 1, "onDeletePressed passed.");
	});	

	QUnit.test("onStatusChanged", function (assert) {
		var that = this;

		var oControllerStub = {
			_oView: {
				setBusy: that.stub()
			},
			_oDataModel: {
				callFunction: that.stub(),
				read: that.stub()
			},
			_oStatusData: {
				taskUUID: "0001"
			},
			_oTreeTable: {
				getBinding: function () {
					return {
						_restoreTreeState: function () {
							return {
								then: that.stub()
							};
						}
					};
				},
				getSelectedIndex: function () {
					return 0;
				},
				setSelectedIndex: function () {

				}
			},
			_removeTransientMessages: this.stub(),
			i18nBundle: {
				getText: function () {
					return "processing status";
				}
			},
			_parseErrorMessage: that.stub()
		};

		var fnIsolateFunction = this.oController.onStatusChanged.bind(oControllerStub);
		fnIsolateFunction("oEvent", "sFunctionName");
		assert.equal(oControllerStub._oDataModel.callFunction.calledOnce, true, "onStatusChanged passed.");
	});
	
	QUnit.test("onMoveDownPressed", function (assert) {
		var that = this;
		var oBinding = {
			getNodeByIndex:function(nPos){
				return {
					magnitude : 10
				};
			},
			_restoreTreeState: function () {
				return {
					then: that.stub()
				};
			},
			_fireChange: that.stub(),
			expand: that.stub(),
			isExpanded: that.stub(),
			getLength:function(){
				return 20;
			}			
		};

		var oContext = {
			getPath:function(){
				return "1234";
			}
		};

		var oControllerStub = {
			_removeTransientMessages:this.stub(),
			_oDataPath: {
				movedownFunction: "/C_EnterpriseProjectPlanTPEdit"
			},			
			_oView: {
				setBusy: this.stub()
			},			
			_oTreeTable:{
				getBinding: function () {
					return oBinding;
				},
				getSelectedIndices:function(){
					return [15];
				},
				getContextByIndex:function(){
					return oContext;
				},
				isExpanded:function(){
					return true;
				}
			},
			
			_getRowInfoByIndex:function(){
				return {
					data:
					{
						HierarchyNodeLevel:2,
						TaskUUID:"000-222"
					}
				};	
			},
			
			_oDataModel: {
				getProperty: function () {
					return {
						ActiveTaskUUID: "123456",
						ParentObjectUUID: "123456",
						TaskUUID: "123456",
						IsActiveEntity: "true"
					};
				},
				callFunction: function (path, parameter) {
					return parameter.success();
				}				
			},

			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			},
			i18nBundle:{
				getText:function(value){
					return "";
				}
			},
			_removeActionInfoMessages: this.stub(),
			_disableActionButton:this.stub()
		};

		var fnIsolateFunction = this.oController.onMoveDownPressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oView.setBusy.callCount, 1, "onMoveDownPressed passed.");
	});			
	
	QUnit.test("onMoveUpPressed", function (assert) {
		var that = this;
		var oBinding = {
			getNodeByIndex:function(nPos){
				return {
					magnitude : 10
				};
			},
			_restoreTreeState: function () {
				return {
					then: that.stub()
				};
			},
			_fireChange: that.stub(),
			expand: that.stub(),
			isExpanded: that.stub()
		};

		var oContext = {
			getPath:function(){
				return "1234";
			}
		};

		var oControllerStub = {
			_removeTransientMessages:this.stub(),
			_oDataPath: {
				moveupFunction: "/C_EnterpriseProjectPlanTPEdit"
			},			
			_oView: {
				setBusy: this.stub()
			},			
			_oTreeTable:{
				getBinding: function () {
					return oBinding;
				},
				getSelectedIndices:function(){
					return [15];
				},
				getContextByIndex:function(){
					return oContext;
				}
			},
			
			_getRowInfoByIndex:function(){
				return {
					data:
					{
						HierarchyNodeLevel:2,
						TaskUUID:"000-222"
					}
				};	
			},
			
			_oDataModel: {
				getProperty: function () {
					return {
						ActiveTaskUUID: "123456",
						ParentObjectUUID: "123456",
						TaskUUID: "123456",
						IsActiveEntity: "true"
					};
				},
				callFunction: function (path, parameter) {
					return parameter.success();
				}				
			},

			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			},
			i18nBundle:{
				getText:function(value){
					return "";
				}
			},
			_removeActionInfoMessages: this.stub(),
			_disableActionButton:this.stub()
		};

		var fnIsolateFunction = this.oController.onMoveUpPressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oView.setBusy.callCount, 1, "onMoveUpPressed passed.");
	});		
	
	QUnit.test("onOutdentPressed", function (assert) {
		var that = this;
		var oBinding = {
			getNodeByIndex:function(nPos){
				return {
					magnitude : 10
				};
			},
			_restoreTreeState: function () {
				return {
					then: that.stub()
				};
			},
			_fireChange: that.stub(),
			expand: that.stub(),
			getLength:function(){
				return 20;
			}
		};

		var oContext = {
			getPath:function(){
				return "1234";
			}
		};

		var oControllerStub = {
			_removeTransientMessages:this.stub(),
			_oDataPath: {
				outdentFunction: "/C_EnterpriseProjectPlanTPEdit"
			},			
			_oView: {
				setBusy: this.stub()
			},			
			_oTreeTable:{
				getBinding: function () {
					return oBinding;
				},
				getSelectedIndices:function(){
					return [15];
				},
				getContextByIndex:function(){
					return oContext;
				}
			},
			
			_getRowInfoByIndex:function(){
				return {
					data:
					{
						HierarchyNodeLevel:2,
						TaskUUID:"000-222"
					}
				};	
			},
			
			_oDataModel: {
				getProperty: function () {
					return {
						ActiveTaskUUID: "123456",
						ParentObjectUUID: "123456",
						TaskUUID: "123456",
						IsActiveEntity: "true"
					};
				},
				callFunction: function (path, parameter) {
					return parameter.success();
				}				
			},

			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			},
			i18nBundle:{
				getText:function(value){
					return "";
				}
			},
			_removeActionInfoMessages: this.stub(),
			_disableActionButton:this.stub()
		};

		var fnIsolateFunction = this.oController.onOutdentPressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._disableActionButton.callCount, 1, "onOutdentPressed passed.");
	});		

	QUnit.test("onIndentPressed", function (assert) {
		var that = this;
		var oBinding = {
			getNodeByIndex:function(nPos){
				return {
					magnitude : 10
				};
			},
			_restoreTreeState: function () {
				return {
					then: that.stub()
				};
			},
			_fireChange: that.stub(),
			expand: that.stub(),
			isExpanded: that.stub()
		};

		var oContext = {
			getPath:function(){
				return "1234";
			}
		};

		var oControllerStub = {
			_removeTransientMessages:this.stub(),
			_oDataPath: {
				indentFunction: "/C_EnterpriseProjectPlanTPEdit"
			},			
			_oView: {
				setBusy: this.stub()
			},			
			_oTreeTable:{
				getBinding: function () {
					return oBinding;
				},
				getSelectedIndices:function(){
					return [15];
				},
				getContextByIndex:function(){
					return oContext;
				}
			},
			
			_getRowInfoByIndex:function(){
				return {
					data:
					{
						HierarchyNodeLevel:2,
						TaskUUID:"000-222"
					}
				};	
			},
			
			_oDataModel: {
				getProperty: function () {
					return {
						ActiveTaskUUID: "123456",
						ParentObjectUUID: "123456",
						TaskUUID: "123456",
						IsActiveEntity: "true"
					};
				},
				callFunction: function (path, parameter) {
					return parameter.success();
				}				
			},

			_getDeferredObject: function () {
				var oPrevious = $.Deferred();
				var oFollowing = $.Deferred();
				oPrevious.resolve();
				return [oPrevious, oFollowing];
			},
			i18nBundle:{
				getText:function(value){
					return "";
				}
			},
			_removeActionInfoMessages:this.stub(),
			_disableActionButton:this.stub(),
			_addInformationMessage:this.stub(),
			onMessagesButtonPress:this.stub()
		};

		var fnIsolateFunction = this.oController.onIndentPressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oView.setBusy.callCount, 1, "onIndentPressed passed.");
	});	

	QUnit.test("_createMessagePopover", function (assert) {

		var oModel = new sap.ui.model.json.JSONModel();

		var oControllerStub = {
			_oDataPath:{
				taskPath:"/C_EnterpriseProjElementPlanTP"	
			},
			_oMessageManager: {
				getMessageModel: function () {
					return oModel;
				}
			},
			_getGroupTitle:this.stub(),
			activeTitlePressed:this.stub()
		};

		var fnIsolateFunction = this.oController._createMessagePopover.bind(oControllerStub);
		fnIsolateFunction();
		assert.notEqual(oControllerStub._oMessagePopover, null, "_createMessagePopover passed.");
	});

	QUnit.test("activeTitlePressed - visible row visible field", function (assert) {

		var oMessage = {
			target:"/C_EnterpriseProjElementPlanTP(TaskUUID=guid'ecebb889-5a65-1eea-87fa-b3d9d01e55fb',IsActiveEntity=false)/ResponsibleCostCenter"
		};

		var oObject = {
			getObject:function(){
				return oMessage;
			}
		};
	
		var oMessageItem = {
			getBindingContext:function(){
				return oObject;
			}
		};

		var oEvent = 
		{
			getParameter:function()
			{
				return oMessageItem;
			}
		};
		
		var oRowData = {
			ActiveTaskUUID:"000-000"
		};

		var oLable1 = {
			getText : function(){
				return "Responsible Cost Center";
			}
		};
		
		var oLable2 = {
			getText : function(){
				return "Name";
			}
		};

		var oColumn1 = {
			getName: function () {
				return "Responsible Cost Center";
			},
			getVisible:function(){
				return true;	
			},
			getLabel:function(){
				return oLable1;
			}  			
		};

		var oColumn2 = {
			getName: function () {
				return "Name";
			},
			getVisible:function(){
				return false;	
			},
			getLabel:function(){
				return oLable2;
			}  			
		};
		
		var aColumns = [oColumn1, oColumn2];
		
		var aContext = 
		[
			{
				sPath:"000-000-000"
			},
			{
				sPath:"000-000-000"
			},
			{
				sPath:"000-000-000"
			},
			{
				sPath:"/C_EnterpriseProjElementPlanTP(TaskUUID=guid'ecebb889-5a65-1eea-87fa-b3d9d01e55fb',IsActiveEntity=false)"
			},
			{
				sPath:"000-000-000"
			}			
		];
		
		var oBinding = {
			getLength:function(){
				return 5;
			},
			getContexts:function(){
				return aContext;
			}
		};

		var oControllerStub = {
			_oDataModel:{
				getProperty:function(){
					return oRowData;	
				},
				read: function (path, parameter) {
					return parameter.success(oRowData);
				}
			},
			_oTreeTable:{
				getColumns:function(){
					return aColumns;
				},
				getBinding:function(){
					return oBinding;
				},
				getVisibleRowCount:function(){
					return 2;
				},
				getFirstVisibleRow:function(){
					return 0;
				},
				setFirstVisibleRow:this.stub(),
				setSelectedIndex:this.stub()
			},
			_oFieldMapping:
			{
				TaskName: "Name",
				Task : "ID",
				ProcessingStatus : "Processing Status",
				PlannedStartDate : "Planned Start",
				PlannedEndDate : "Planned Finish",
				ResponsibleCostCenter : "Responsible Cost Center",
				ProfitCenter : "Profit Center",
				Plant : "Plant",
				FunctionalArea : "Function Area",
				FactoryCalendar : "Calendar"
			}		
		};

		var fnIsolateFunction = this.oController.activeTitlePressed.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oControllerStub._oTreeTable.setFirstVisibleRow.callCount, 1, "activeTitlePressed passed.");
	});

	QUnit.test("activeTitlePressed - visible row hidden field", function (assert) {

		var oMessage = {
			target:"/C_EnterpriseProjElementPlanTP(TaskUUID=guid'ecebb889-5a65-1eea-87fa-b3d9d01e55fb',IsActiveEntity=false)/ResponsibleCostCenter"
		};

		var oObject = {
			getObject:function(){
				return oMessage;
			}
		};
	
		var oMessageItem = {
			getBindingContext:function(){
				return oObject;
			}
		};

		var oEvent = 
		{
			getParameter:function()
			{
				return oMessageItem;
			}
		};
		
		var oRowData = {
			ActiveTaskUUID:"000-000"
		};

		var oLable1 = {
			getText : function(){
				return "ColCostCenter";
			}
		};
		
		var oLable2 = {
			getText : function(){
				return "ColTaskName";
			}
		};

		var oColumn1 = {
			getName: function () {
				return "ColCostCenter";
			},
			getVisible:function(){
				return false;	
			},
			getLabel:function(){
				return oLable1;
			}  			
		};

		var oColumn2 = {
			getName: function () {
				return "ColTaskName";
			},
			getVisible:function(){
				return false;	
			},
			getLabel:function(){
				return oLable2;
			} 			
		};
		
		var aColumns = [oColumn1, oColumn2];
		
		var aContext = 
		[
			{
				sPath:"000-000-000"
			},
			{
				sPath:"000-000-000"
			},
			{
				sPath:"000-000-000"
			},
			{
				sPath:"/C_EnterpriseProjElementPlanTP(TaskUUID=guid'ecebb889-5a65-1eea-87fa-b3d9d01e55fb',IsActiveEntity=false)"
			},
			{
				sPath:"000-000-000"
			}			
		];
		
		var oBinding = {
			getLength:function(){
				return 5;
			},
			getContexts:function(){
				return aContext;
			}
		};

		var oControllerStub = {
			_oDataModel:{
				getProperty:function(){
					return oRowData;	
				},
				read: function (path, parameter) {
					return parameter.success(oRowData);
				}
			},
			_oTreeTable:{
				getColumns:function(){
					return aColumns;
				},
				getBinding:function(){
					return oBinding;
				},
				getVisibleRowCount:function(){
					return 2;
				},
				getFirstVisibleRow:function(){
					return 0;
				}, 
				setFirstVisibleRow:this.stub(),
				setSelectedIndex:this.stub()
			},
			_oFieldMapping:
			{
				TaskName: "Name",
				Task : "ID",
				ProcessingStatus : "Processing Status",
				PlannedStartDate : "Planned Start",
				PlannedEndDate : "Planned Finish",
				ResponsibleCostCenter : "Responsible Cost Center",
				ProfitCenter : "Profit Center",
				Plant : "Plant",
				FunctionalArea : "Function Area",
				FactoryCalendar : "Calendar"
			},			
			_oNavigationHandler: {
				navigate: this.stub()
			}
		};

		var fnIsolateFunction = this.oController.activeTitlePressed.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oControllerStub._oTreeTable.setFirstVisibleRow.callCount, 0, "activeTitlePressed passed.");
	});

	QUnit.test("_getGroupTitle valid path", function (assert) {

		var sTarget = "/C_EnterpriseProjElementPlanTP(TaskUUID=guid'ecebb889-5a65-1eea-87fa-b3d9d01e55fb',IsActiveEntity=false)/ResponsibleCostCenter";

		var oRowData = {
			ActiveTaskUUID:"000-000",
			Task : "WBS"
		};

		var oControllerStub = {
			_oDataModel:{
				getProperty:function(){
					return oRowData;	
				}
			}
		};

		var fnIsolateFunction = this.oController._getGroupTitle.bind(oControllerStub);
		var sTitle = fnIsolateFunction(sTarget);
		assert.equal(sTitle, "WBS", "_getGroupTitle valid path passed.");
	});

	QUnit.test("_getGroupTitle invalid path", function (assert) {

		var sTarget = "/C_EnterpriseProjectPlanTP(TaskUUID=guid'ecebb889-5a65-1eea-87fa-b3d9d01e55fb',IsActiveEntity=false)";

		var oRowData = {
			ActiveTaskUUID:"000-000",
			Task : "WBS"
		};

		var oControllerStub = {
			_oDataModel:{
				getProperty:function(){
					return oRowData;	
				}
			}
		};

		var fnIsolateFunction = this.oController._getGroupTitle.bind(oControllerStub);
		var sTitle = fnIsolateFunction(sTarget);
		assert.equal(sTitle, "", "_getGroupTitle invalid path passed.");
	});


	QUnit.test("onMessagesButtonPress", function (assert) {

		var oControllerStub = {
			_oMessagePopover: {
				toggle: this.stub()
			},
			_oMsgButton: null
		};

		var fnIsolateFunction = this.oController.onMessagesButtonPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oMessagePopover.toggle.callCount, 1, "onMessagesButtonPress passed.");
	});

	QUnit.test("_getDeferredObject", function (assert) {

		var oControllerStub = {
			_oEditDeferred: $.Deferred()
		};

		var fnIsolateFunction = this.oController._getDeferredObject.bind(oControllerStub);
		var obj = fnIsolateFunction();
		assert.equal(obj.length, 2, "_getDeferredObject passed.");
	});
	

	QUnit.test("_setTableSelection", function (assert) {

		var aRowIndices = [1,2,3];

		var oControllerStub = {
			_oTreeTable: {
				addSelectionInterval:this.stub()
			}
		};

		var fnIsolateFunction = this.oController._setTableSelection.bind(oControllerStub);
		fnIsolateFunction(aRowIndices);
		assert.equal(oControllerStub._oTreeTable.addSelectionInterval.callCount, 3, "_setTableSelection passed.");
	});	
	
	QUnit.test("_refreshTree", function (assert) {

		var bBusy = null;

		var oBinding = {
			_restoreTreeState:function(){
				var oDeferred = $.Deferred();
				oDeferred.resolve();
				return oDeferred;
			},
			_fireChange:this.stub()
		};
		var oControllerStub = {
			_oHeaderModel: {
				setData: this.stub()
			},
			_oHeaderData:{
				EarliestStartDate:null,
				LatestFinishDate:null
			},
			_oGanttChart: {
				invalidate:this.stub() 
			},
			_oView:{
				setBusy: function(busy){
					bBusy = busy;
				}
			},
			_oTreeTable: {
				getBinding: function () {
					return oBinding;
				},
				getSelectedIndices:function(){
					return [1];
				},
				getFirstVisibleRow:this.stub(),
				setFirstVisibleRow:this.stub()
			},
			_setTableSelection:this.stub(),
			_setAxisTime:this.stub()
		};

		var fnIsolateFunction = this.oController._refreshTree.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(bBusy, false, "_refreshTree passed.");
	});	
	
	QUnit.test("onComponentRestore -- edit & draft valid", function (assert) {
		var data = {
			DraftAdministrativeData:{
				CreatedByUserDescription : "Snow"
			}			
		};
		
		var oDataModel= {
			read: function (path, parameter) {
				return parameter.success(data);
			}
		};
		var component = {
			getModel:function(){
				return oDataModel;
			}			
		};
		
		var oControllerStub = {
			_oView:{
				setBusy:this.stub()
			},
			_sProjectPath:"path",
			_bEditMode:true,
			_oHeaderModel: {
				setData: this.stub()
			},
			getOwnerComponent:function(){
				return component;
			},
			_oDataModel:{
				read: function (path, parameter) {
					return parameter.success(data);
				}
			},
			_oHeaderData:{},
			_setAxisTime: this.stub(),
			_refreshTree: this.stub(),
			_bAppValid:true
		};

		var fnIsolateFunction = this.oController.onComponentRestore.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._refreshTree.callCount, 1, "onComponentRestore passed.");
	});	
		
	QUnit.test("onComponentRestore -- edit & draft deleted", function (assert) {
		var data = {
		};
		var oDataModel= {
			read: function (path, parameter) {
				return parameter.success(data);
			}
		};
		var component = {
			getModel:function(){
				return oDataModel;
			}			
		};		
		var oControllerStub = {
			_oView:{
				setBusy:this.stub()
			},
			_sProjectPath:"path",
			_bEditMode:true,
			_oHeaderModel: {
				setData: this.stub()
			},
			getOwnerComponent:function(){
				return component;
			},	
			_oDataModel:{
				read: function (path, parameter) {
					return parameter.success(data);
				}
			},			
			_oHeaderData:{ActiveUUID:"123"},
			_bIsActiveEntity:null,
			_bAppValid:true,
			_setUIByEditStatus: this.stub(),
			_resetProjectData: this.stub(),
			_loadProjectData: this.stub()
		};

		var fnIsolateFunction = this.oController.onComponentRestore.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._bEditMode, false, "onComponentRestore passed.");
	});	
	
	QUnit.test("onComponentRestore -- display", function (assert) {
		var data = {
			Update_mc:true,
			IsActiveEntity:true,
			HasDraftEntity:true,
			DraftAdministrativeData:{
				DraftIsCreatedByMe:true
			}
		};
		var oDataModel= {
			read: function (path, parameter) {
				return parameter.success(data);
			}
		};
		var component = {
			getModel:function(){
				return oDataModel;
			}			
		};				
		var bVisible = null;
		var sText = null;
		var oControllerStub = {
			_oView:{
				setBusy:this.stub()
			},
			_sProjectPath:"path",
			_bEditMode:false,
			_oHeaderModel: {
				setData: this.stub()
			},
			getOwnerComponent:function(){
				return component;
			},				
			_oEditButton:{
				setText: this.stub(),
				setVisible: function(value){
					bVisible = value;
				}
			},
			_oDataModel:{
				read: function (path, parameter) {
					return parameter.success(data);
				}
			},			
			i18nBundle:{
				getText:function(value){
					sText = value;
				}
			},
			_oHeaderData:{},
			_bAppValid:true,
			_refreshTree: this.stub(),
			_setAxisTime: this.stub()
		};

		var fnIsolateFunction = this.oController.onComponentRestore.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(bVisible, true, "onComponentRestore passed.");
	});		
	
	QUnit.test("onComponentRestore -- OData Error", function (assert) {
		
		var oDataModel= {
			read: function (path, parameter) {
				return parameter.error();
			}
		};
		var component = {
			getModel:function(){
				return oDataModel;
			}			
		};			
		
		var oControllerStub = {
			_oView:{
				setBusy:this.stub()
			},
			_bEditMode:true,
			_bAppValid:true,
			_oHeaderModel: {
				setData: this.stub()
			},
			getOwnerComponent:function(){
				return component;
			},			
			_oDataModel:{
				read: function (path, parameter) {
					return parameter.error();
				}
			},	
			_oGanttChart: {
				invalidate:this.stub() 
			},			
			_oHeaderData:{ActiveUUID:"123"},
			_setUIByEditStatus: this.stub(),
			_resetProjectData: this.stub(),
			_loadProjectData: this.stub()
		};

		var fnIsolateFunction = this.oController.onComponentRestore.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._bEditMode, false, "onComponentRestore passed.");
	});			
	
	QUnit.test("legendFactory", function (assert) {
		var oControllerStub = {
			formatter: {
				colorDef: {
					shape: {
						TaskDone: "#abdbf2",
						TaskOpen: "#5cbae5",
						PhaseOpen: "#bac1c4",
						PhaseDone: "#d5dadc"
					}
				}
			},
			i18nBundle: {
				getText: function () {
					return "TEXT";
				}
			}
		};
		var oContext = {
			getProperty: function() {
				return {
					LegendRowConfigs: [
						{text: "Project", shapeName: "project", shapeClass: "sap.gantt.simple.BaseRectangle"},
						{text: "Task", shapeName: "task", shapeClass: "sap.gantt.simple.BaseRectangle"}
					]
				};
			}
		};
		var fnIsolateFunction = this.oController.legendFactory.bind(oControllerStub);
		var obj = fnIsolateFunction(null, oContext);
		assert.equal(obj.getAggregation("columnConfigs").length, 2, "columnConfigs passed.");
		assert.equal(obj.getAggregation("rowConfigs").length, 2, "rowConfigs passed.");
	});
	
	QUnit.test("onActionPress", function (assert) {

		var oActionSheet = {
			openBy:this.stub()
		};

		var oControllerStub = {
			_createActionSheet:function() {
				this._oActionSheet = oActionSheet;
			},
			_oActionSheet: null,
			_oActionButton:null
		};

		var fnIsolateFunction = this.oController.onActionPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oActionSheet.openBy.callCount, 1, "onActionPress passed.");
	});	
	/*
	QUnit.test("shareEmailPressed", function (assert) {

		var oControllerStub = {
			_oHeaderData: {
				Project: "project"
			},
			i18nBundle:{
				getText:function(){
					return "text";
				}
			}
		};

		var fnIsolateFunction = this.oController.shareEmailPressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(true, true, "shareEmailPressed passed.");
	});
	*/
	
	QUnit.test("shareJamPressed", function (assert) {

		var oControllerStub = {
			_oHeaderData: {
				Project: "project"
			},
			i18nBundle:{
				getText:function(){
					return "text";
				}
			}
		};

		var fnIsolateFunction = this.oController.shareJamPressed.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(true, true, "shareJamPressed passed.");
	});		

	QUnit.test("onOpenInPress", function (assert) {

		var oActionSheet = {
			openBy:this.stub()
		};

		var oControllerStub = {
			_createOpenInActionSheet :function() {
				this._oOpenInActionSheet = oActionSheet;
			},
			_oOpenInActionSheet: null,
			_oOpenInButton:null
		};

		var fnIsolateFunction = this.oController.onOpenInPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oActionSheet.openBy.callCount, 1, "onOpenInPress passed.");
	});	
		
	QUnit.test("onProjectBuilderPress", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},
			_oHeaderData: {
				Project: "project"
			},
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onProjectBuilderPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onProjectBuilderPress passed.");
	});

	QUnit.test("onProjectControlPress", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},
			_oHeaderData: {
				Project: "project"
			},
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onProjectControlPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onProjectControlPress passed.");
	});
	
	QUnit.test("onMonitorProjectPress", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},
			_oHeaderData: {
				Project: "project"
			},
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onMonitorProjectPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onMonitorProjectPress passed.");
	});	
	
	QUnit.test("onProjectCostPress", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},
			_oHeaderData: {
				Project: "project"
			},
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onProjectCostPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onProjectCostPress passed.");
	});		

	QUnit.test("onProjectBudgetPress", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},
			_oHeaderData: {
				Project: "project"
			},
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onProjectBudgetPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onProjectBudgetPress passed.");
	});	
	
	QUnit.test("onProjectProcurementPress", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},
			_oHeaderData: {
				Project: "project"
			},
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onProjectProcurementPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onProjectProcurementPress passed.");
	});		

	QUnit.test("onProjectBriefPress", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},
			_oHeaderData: {
				Project: "project"
			},
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onProjectBriefPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onProjectBriefPress passed.");
	});

	QUnit.test("_createObjectMarkerPopover -- draft", function (assert) {

		var oControllerStub = {
			i18nBundle: {
				getText: function () {
					return "project";
				}
			},
			_oHeaderData:{
				DraftAdministrativeData: {
					CreatedByUser: "NIROG",
					LastChangeDateTime: "/Date(1550135305531+0000)/",
					LastChangedByUser: "NIROG",
					InProcessByUser: "NIROG",
					DraftIsCreatedByMe: true,
					CreatedByUserDescription: "ROGER NI",
					LastChangedByUserDescription: "ROGER NI",
					InProcessByUserDescription: ""
				}
			}
		};

		var fnIsolateFunction = this.oController._createObjectMarkerPopover.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(true, true, "_createObjectMarkerPopover passed.");
	});	

	QUnit.test("_createObjectMarkerPopover -- unsaved changes", function (assert) {

		var oControllerStub = {
			i18nBundle: {
				getText: function () {
					return "project";
				}
			},
			_oHeaderData:{
				DraftAdministrativeData: {
					CreatedByUser: "NIROG",
					LastChangeDateTime: "/Date(1550135305531+0000)/",
					LastChangedByUser: "NIROG",
					InProcessByUser: "",
					DraftIsCreatedByMe: false,
					CreatedByUserDescription: "ROGER NI",
					LastChangedByUserDescription: "ROGER NI",
					InProcessByUserDescription: ""
				}		
			}
		};

		var fnIsolateFunction = this.oController._createObjectMarkerPopover.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(true, true, "_createObjectMarkerPopover passed.");
	});	

	QUnit.test("_createObjectMarkerPopover -- locked", function (assert) {

		var oControllerStub = {
			i18nBundle: {
				getText: function () {
					return "project";
				}
			},
			_oHeaderData:{
				DraftAdministrativeData: {
					CreatedByUser: "NIROG",
					LastChangeDateTime: "/Date(1550135305531+0000)/",
					LastChangedByUser: "NIROG",
					InProcessByUser: "NIROG",
					DraftIsCreatedByMe: false,
					CreatedByUserDescription: "ROGER NI",
					LastChangedByUserDescription: "ROGER NI",
					InProcessByUserDescription: ""
				}
			}
		};

		var fnIsolateFunction = this.oController._createObjectMarkerPopover.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(true, true, "_createObjectMarkerPopover passed.");
	});	

	QUnit.test("onObjectMarkerPress", function (assert) {

		var oActionSheet = {
			openBy:this.stub()
		};

		var oControllerStub = {
			_createObjectMarkerPopover :function() {
				this._oObjectMarkerPopover = oActionSheet;
			},
			_oObjectMarkerPopover: null,
			_oObjectMarker:null
		};

		var fnIsolateFunction = this.oController.onObjectMarkerPress.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oActionSheet.openBy.callCount, 1, "onObjectMarkerPress passed.");
	});	
	
	QUnit.test("onNavigationToDemand", function (assert) {

		var oControllerStub = {
			_oNavigationHandler: {
				navigate: this.stub()
			},
			_oHeaderData: {
				Project: "project"
			},
			_oDemandModel:{
				getProperty:function(){
					return "abc";
				}            	
			},
			_sProjectUUID: "123456",
			_bIsActiveEntity: "true"
		};

		var fnIsolateFunction = this.oController.onNavigationToDemand.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(oControllerStub._oNavigationHandler.navigate.callCount, 1, "onNavigationToDemand passed.");
	});	
	
	QUnit.test("_createDemandDetailPopover", function (assert) {

		var oControllerStub = {
			i18nBundle: {
				getText: function () {
					return "project";
				}
			},
			onNavigationToDemand:function(){
				
			}
		};

		var fnIsolateFunction = this.oController._createDemandDetailPopover.bind(oControllerStub);
		fnIsolateFunction();
		assert.equal(true, true, "_createDemandDetailPopover passed.");
	});		
	
	QUnit.test("onDemandLinkPress", function (assert) {

		var oContext = {
			getPath:function(){
				return "/abc";
			}
		};

		var oItem = {
			
			getBindingContext:function(){
				return oContext;
			}
			
		};

		var oEvent = {
			getSource: function () {
				return oItem;
			}
		};
		
		var oRowData = {
			serviceDemands:2,
			materialDemands: 4	
		};

		var oActionSheet = {
			openBy:this.stub()
		};

		var oControllerStub = {
			_createDemandDetailPopover :function() {
				this._oDemandDetailPopover = oActionSheet;
			},
			_oDemandDetailPopover: null,
			_oDataModel: {
				getProperty:function(){
					return oRowData;
				}
			},
			_oDemandModel:{
				setData:this.stub()
			}
		};

		var fnIsolateFunction = this.oController.onDemandLinkPress.bind(oControllerStub);
		fnIsolateFunction(oEvent);
		assert.equal(oActionSheet.openBy.callCount, 1, "onDemandLinkPress passed.");
	});		
	
});
