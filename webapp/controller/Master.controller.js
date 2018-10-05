sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox'
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Master", {
		onInit: function () {
			this.oView = this.getView();
			this._bDescendingSort = false;
			this.oProductsTable = this.oView.byId("usersTable");
			this.oRouter = this.getOwnerComponent().getRouter();
			
			var oUsers = new JSONModel();
			this.getView().setModel(oUsers, "users");
			
			this._urlSl = 'https://hanab1:50000/b1s/v1/';
			
			this._skip = 0;
			
			this._loginSL();
			this._loadUsers(this._skip);
		},

		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("UserName", FilterOperator.Contains, sQuery)];
			}

			this.oProductsTable.getBinding("items").filter(oTableSearchState, "Application");
		},
		
		onRefresh: function() {
			this._loadUsers(this._skip);
			sap.m.MessageToast.show("refresh");
		},

		onAdd: function () {
			MessageBox.show("This functionality is not ready yet.", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Aw, Snap!",
				actions: [MessageBox.Action.OK]
			});
		},

		onSort: function () {
			this._bDescendingSort = !this._bDescendingSort;
			var oBinding = this.oProductsTable.getBinding("items"),
				oSorter = new Sorter("UserName", this._bDescendingSort);

			oBinding.sort(oSorter);
		},

		onListItemPress: function (oEvent) {
			//var productPath = oEvent.getSource().getBindingContext("users").getPath();
			//var	product = productPath.split("/").slice(-1).pop();

			var oLinha = oEvent.getSource().getBindingContext("users").getObject();
			var codUser = oLinha.InternalKey;	

			this.oRouter.navTo("detail", {layout: sap.f.LayoutType.TwoColumnsMidExpanded, product: codUser});
	
		},
		
		_loginSL: function() {

			var loginInfo = {};
			loginInfo.UserName = "manager";
			loginInfo.Password = "sps@1234";
			loginInfo.CompanyDB = "SBODEMOBR";
			
			$.ajax({
				url: this._urlSl + "Login",
				xhrFields: {
					withCredentials: true
				},
				data: JSON.stringify(loginInfo),
				type: "POST",
				dataType: "json",
				success: function(result) {
					if (result.error) {
						sap.m.MessageToast.show(result.error);
						return;
					}
				},
				error: function(request, textStatus, errorThrown) {
					sap.m.MessageToast.show("Service Layer Login failed: " + textStatus + " / " + errorThrown);
				}
			});
		},
		
		_loadUsers: function(skip) {
			var oView = this.getView();
			oView.setBusy(true);

			var self = this;

			$.ajax({
    			type: 'GET',
    			xhrFields: {
					withCredentials: true
				},
    			url: this._urlSl + "Users/?$orderby=InternalKey&$select=InternalKey,UserCode,UserName,eMail&$skip="+skip,
    			async: false
			}).done(function(results) {
    			self.getView().getModel("users").setProperty("/data", results.value);
    			oView.setBusy(false);
    			
    			/*var oModel = sap.ui.getCore().getModel();
				var aData  = oModel.getProperty("/modelData/data");
				aData.push.apply(aData, response.data);
				oModel.setProperty("/modelData/data", aData);*/
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
		}
	});
}, true);