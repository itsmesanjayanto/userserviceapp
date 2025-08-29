sap.ui.define(
	[
		"sap/ui/core/mvc/ControllerExtension",
		"sap/m/Dialog",
		"sap/m/DialogType",
		"sap/m/Text",
		"sap/m/Button",
		"sap/m/ButtonType",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageItem",
		"sap/m/MessageView",
		"sap/m/Bar",
		"sap/ui/model/Sorter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/FilterType",
		"sap/m/Title",
		"sap/ui/core/IconPool"
	],
	function (ControllerExtension, Dialog, DialogType, Text, Button, ButtonType, MessageToast, MessageBox, JSONModel, MessageItem, MessageView, Bar, Sorter, Filter, FilterOperator, FilterType, Title, IconPool) {
		"use strict";

		return ControllerExtension.extend("userserviceui.controller.extendLP", {
			// this section allows to extend lifecycle hooks or override public methods of the base controller
			override: {
				onInit: function () { },
				editFlow: {
					onBeforeSave: function (mParameters) {
						return this._createDialog("Do you want to submit this really nice... object ?");
					},
					onBeforeEdit: function (mParameters) {
						return this._createDialog("Do you want to edit this really nice... object ?");
					},
					onBeforeDiscard: function (mParameters) {
						return this._createDialog("Do you want to cancel this really nice... object ?");
					},
					onBeforeCreate: function (mParameters) {
						return this._createDialog("Do you want to create ?");
					},
					onBeforeDelete: function (mParameters) {
						return this._createDialog("Do you want to delete this really nice... object ?");
					}
				}
			},

			onSearch: function (oParams) {
				const aSelectedKeys = oParams.getParameters().selectionSet[0].mProperties.selectedKeys;

				var aFilter = [];
				for (let index = 0; index < aSelectedKeys.length; index++) {
					aFilter.push(new Filter("systemName", FilterOperator.Contains, aSelectedKeys[index]));
				}

				sap.ui.getCore().byId("table").getBinding("items").filter(aFilter, FilterType.Application);
			},

			onAddRoleBtn: function (oEvt) {

				this.base.getExtensionAPI()._pDialog.then(function (oDialog) {
					oDialog.setBusy(true);

					const aData = oDialog.mAggregations.content[1].getSelectedContexts();
					var aRoles = [];
					for (let i = 0; i < aData.length; i++) {
						aRoles.push(aData[i].getObject().id);
					}
					var oModel = this.getView().getModel(),
						oOperation = oModel.bindContext("/assignRoles(...)");
					oOperation.setParameter("Id", aRoles);

					oOperation.execute().then(function (oResponse) {
						var aResponse = oOperation.getBoundContext().getObject();
						var oMessageTemplate = new MessageItem({
							type: '{type}',
							title: '{message}'
						});

						// Inserting custom warning this the messages 
						// Please logoff and login to see the assigned workzone applications
						var aWarningMess = {
							"type": "Warning",
							"message": "Please logoff and login to see the assigned workzone applications"
						};
						aResponse.value.push(aWarningMess);

						var oModel = new JSONModel();
						oModel.setData(aResponse.value);

						this.oMessageView = new MessageView({
							showDetailsPageHeader: false,
							items: {
								path: "/",
								template: oMessageTemplate
							}
						});
						this.oMessageView.setModel(oModel);

						var oBackButton = new Button({
							icon: IconPool.getIconURI("nav-back"),
							visible: false,
							press: function () {
								that.oMessageView.navigateBack();
								this.setVisible(false);
							}
						});
						oDialog.setBusy(false);
						this.oMessageDialog = new Dialog({
							resizable: true,
							content: this.oMessageView,
							beginButton: new Button({
								press: function () {
									this.getParent().close();
								},
								text: "Close"
							}),
							customHeader: new Bar({
								// contentLeft: [oBackButton],
								contentMiddle: [
									new Title({ text: "Status" })
								]
							}),
							contentHeight: "50%",
							contentWidth: "50%",
							verticalScrolling: false
						});
						this.oMessageDialog.open();

						oModel.refresh();
						this.onCloseBtn();

						// MessageToast.show(this._getText("sourceResetSuccessMessage"));
					}.bind(this), function (oError) {
						// MessageBox.error(oError.message);
					}
					);
				}.bind(this));

			},
			onCloseBtn: function () {
				this.base.getExtensionAPI()._pDialog.then(function (oDialog) {
					oDialog.close();
				}.bind(this));
			},

			onAfterclose: function () {
				let aArray = [];
				sap.ui.getCore().byId("table").removeSelections();
				sap.ui.getCore().byId("combobox").setSelectedKeys(aArray);
				this.getView().byId("userserviceui::UserGroupsList--fe::table::UserGroups::LineItem").getModel().refresh();

			},
			onBeforeOpen: function () {
				let aFilter = [];
				sap.ui.getCore().byId("table").getBinding("items").filter(aFilter, FilterType.Application);
			}
		});
	}
);
