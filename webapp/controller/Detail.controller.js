sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Detail", {
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();

			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
		},

		_onProductMatched: function (oEvent) {
			this._user = oEvent.getParameter("arguments").product || this._user || "0";

			this._urlSl = 'https://hanab1:50000/b1s/v1/';
			
			var oUsers = new JSONModel();
			this.getView().setModel(oUsers, "userDetail");
			
			this.getView().getModel("userDetail").setProperty("/ariene", "alo alo");
			
			if (this._user !== "0") {
				this._loadUserDetails(this._user);
			}
			
		},
		
		_loadUserDetails: function(userCode) {
			
			var oView = this.getView();
			oView.setBusy(true);

			var self = this;

			$.ajax({
    			type: 'GET',
    			xhrFields: {
					withCredentials: true
				},
    			url: this._urlSl + "Users(" + userCode + ")?$select=UserName,UserCode,Locked,eMail",
    			async: false
			}).done(function(results) {
    			self.getView().getModel("userDetail").setProperty("/data", results);
    			oView.setBusy(false);
			})
			.fail(function(err) {
    			oView.setBusy(false);
    			if (err !== undefined) {
    				var oErrorResponse = $.parseJSON(err.responseText);
    				sap.m.MessageToast.show(oErrorResponse.message, {
        				duration: 6000
    				});
    			} else {
    				sap.m.MessageToast.show("Unknown error!");
    			}
			});
		},

		onEditToggleButtonPress: function() {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();

			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},
		
		onSave: function() {
			var oDataForm = this.getView().getModel("userDetail").getProperty("/data");
			this._updateUser(oDataForm);
		},
		
		_updateUser: function(oDataForm) {
			var oView = this.getView();
			oView.setBusy(true);

			//var self = this;
			$.ajax({
    			url: this._urlSl + "Users(" + this._user + ")",
				xhrFields: {
					withCredentials: true
				},
				data: JSON.stringify(oDataForm),
				type: "PATCH",
				dataType: "json",
    			async: false
			}).done(function() {
    			sap.m.MessageToast.show("Alterado!");
    			oView.setBusy(false);
			})
			.fail(function(err) {
    			oView.setBusy(false);
    			if (err !== undefined) {
    				var oErrorResponse = $.parseJSON(err.responseText);
    				sap.m.MessageToast.show(oErrorResponse.message, {
        				duration: 6000
    				});
    			} else {
    				sap.m.MessageToast.show("Unknown error!");
    			}
			});
		},
		
		onDelete: function() {
			var oView = this.getView();
			oView.setBusy(true);

			this._deleteUser(this._user);
			
			oView.setBusy(false);
		},
		
		_deleteUser: function(userCode) {
			$.ajax({
    			type: "DELETE",
    			xhrFields: {
					withCredentials: true
				},
    			url: this._urlSl + "Users(" + userCode + ")",
    			async: false
			}).done(function(results) {
    			sap.m.MessageToast.show("Deletado");
			})
			.fail(function(err) {
    			if (err !== undefined) {
    				var oErrorResponse = $.parseJSON(err.responseText);
    				sap.m.MessageToast.show(oErrorResponse.message, {
        				duration: 6000
    				});
    			} else {
    				sap.m.MessageToast.show("Unknown error!");
    			}
			});
		},

		onExit: function () {
			this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
		}
	});
}, true);