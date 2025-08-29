sap.ui.define(["sap/m/MessageToast", "sap/ui/core/message/Message", "sap/ui/core/Fragment"], function (MessageToast, Message, Fragment) {
    "use strict";
    return {

        onAddRolePress: function (oEvent) {

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    name: "userserviceui.view.assignRolesView",                    
                    controller: this.extension.userserviceui.controller.extendLP
                    
                }).then(function (oDialog) {
                    return oDialog;
                });
            }

            this._pDialog.then(function (oDialog) {
                this._view.addDependent(oDialog);
                oDialog.open();
            }.bind(this));
        }
    };
});