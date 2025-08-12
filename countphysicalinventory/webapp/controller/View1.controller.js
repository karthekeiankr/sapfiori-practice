sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel",
     "sap/ui/model/Filter",
     "sap/ui/model/FilterOperator"
], (Controller,JSONModel,Filter,FilterOperator) => {
    "use strict";

    return Controller.extend("countphysicalinventory.controller.View1", {
        onInit: function () {
            //  Create a new JSON model and set the data
            // var oModel = new JSONModel();
            // oModel.loadData("/model/localData.json"); // Ensure the path is correct
            // this.getView().setModel(oModel, "localData");

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData("/model/tableData.json");
            this.getView().setModel(oModel, "data");

            var oModel2 = new sap.ui.model.json.JSONModel();
            // Load the JSON file
            oModel2.loadData("/model/valuehelpData.json");    
            // Set Model to View
            this.getView().setModel(oModel2,"data2");
        },
        onWarehouseNumberValueHelpRequest:function(oEvent) {
            console.log("warehousenumber")
            var oInput = oEvent.getSource();
            var oModel = this.getView().getModel("data2");
            console.log("Data loaded:", oModel.getData());
            if (!this._oWarehouseValueHelpDialog) {
                this._oWarehouseValueHelpDialog = new sap.m.SelectDialog({
                    title: "Select Warehouse",
                    items: {
                        path: "data2>/WarehouseNumbers",
                        template: new sap.m.StandardListItem({
                            title: "{data2>id}",
                            description: "{data>name}"
                        })
                        
                    },
                    
                    confirm: function(oEvent) {
                        var selectedItem = oEvent.getParameter("selectedItem");
                        if (selectedItem) {
                            oInput.setValue(selectedItem.getTitle());
                        }
                    }
                });
                this.getView().addDependent(this._oWarehouseValueHelpDialog);
            }
            this._oWarehouseValueHelpDialog.setModel(oModel, "data2");
            this._oWarehouseValueHelpDialog.open();
        },
        onValueHelpRequest: function (oEvent) {
            var oInput = oEvent.getSource();
            var sFieldName = oInput.getId().split("--").pop(); // Extract field ID
            var oModel = this.getView().getModel("data2");
        
            if (!oModel) {
                console.error("Model 'data2' not found.");
                return;
            }
        
            // Map Input Fields to JSON Data Paths
            var mDataMapping = {
                "warehouseNumberInput": "/WarehouseNumbers",
                "physicalInventoryDocInput": "/PhysicalInventoryDoc/PhysicalInventoryDocs",
                "warehouseOrderInput": "/WarehouseOrder/WarehouseOrders",
                "storageTypeInput": "/StorageType/StorageTypes",
                "storageBinInput": "/StorageBin/StorageBins",
                "physicalInventoryReason": "/PhysicalInventoryReason/PhysicalInventoryReasons",
                "physicalInventoryPriority": "/PhysicalInventoryPriority/PhysicalInventoryPriorities"
            };
        
            var sDataPath = mDataMapping[sFieldName];
            if (!sDataPath) {
                console.error("No mapping found for field: " + sFieldName);
                return;
            }
        
            var oData = oModel.getProperty(sDataPath);
            if (!oData || !Array.isArray(oData)) {
                console.error("Invalid data structure for " + sFieldName);
                return;
            }
        
            // Create Value Help Dialog
            var oValueHelpDialog = new sap.m.SelectDialog({
                title: "Select " + sFieldName,
                items: {
                    path: "data2>" + sDataPath,
                    template: new sap.m.StandardListItem({
                        title: "{data2>id}",
                        description: "{data2>name}"
                    })
                },
                confirm: function (oEvent) {
                    var selectedItem = oEvent.getParameter("selectedItem");
                    if (selectedItem) {
                        if (oInput instanceof sap.m.MultiInput) {
                            oInput.addToken(new sap.m.Token({ text: selectedItem.getTitle() }));
                        } else {
                            oInput.setValue(selectedItem.getTitle());
                        }
                    }
                }
            });
        
            oValueHelpDialog.setModel(oModel, "data2");
            oValueHelpDialog.open();
        },
        
        onSearch: function () {
            var oTable = this.getView().byId("physicalInventoryDocument");
            var oBinding = oTable.getBinding("items");
        
            if (!oBinding) {
                console.error("Table binding is undefined.");
                return;
            }
        
            var aFilters = [];
            var oModel = this.getView().getModel("data");
        
            if (!oModel) {
                console.error("Model 'data2' is not found.");
                return;
            }
        
            var oData = oModel.getProperty("/TableData");
            if (!oData || !Array.isArray(oData)) {
                console.error("TableData is missing or not in the correct format.");
                return;
            }
        
            // Warehouse Number Filter
            var sWarehouseNumber = this.getView().byId("warehouseNumberInput").getValue().trim();
            var scount = this.getView().byId("countStatusSelect").getValue().trim();
            var sprint = this.getView().byId("printStatusSelect").getValue().trim();
            var sactive = this.getView().byId("activationStatusSelect").getValue().trim();
            console.log(sactive)
            if (sWarehouseNumber) {
                var oWarehouseFilter = new sap.ui.model.Filter(
                    "WarehouseOrders",
                    sap.ui.model.FilterOperator.EQ,
                    sWarehouseNumber
                );
                aFilters.push(oWarehouseFilter);
            }
            if (sactive) {
                var oactiveFilter = new sap.ui.model.Filter(
                    "ActivationStatus",
                    sap.ui.model.FilterOperator.EQ,
                    sactive
                );
                aFilters.push(oactiveFilter);
                console.log(oactiveFilter)
            }
            if (sprint) {
                var oprintFilter = new sap.ui.model.Filter(
                    "PrintStatus", //property from tabledata
                    sap.ui.model.FilterOperator.EQ, //containe not working eq works
                    sprint
                );
                aFilters.push(oprintFilter);
            }
            if (scount) {
                var ocountFilter = new sap.ui.model.Filter(
                    "PIDocument",
                    sap.ui.model.FilterOperator.EQ,
                    scount
                );
                aFilters.push(ocountFilter);
            }
            // Apply Filters
            oBinding.filter(aFilters);
            console.log("Applied Filters:", aFilters);
        },
        
        onPress:function(){
            console.log("view2")
            const oRouter=this.getOwnerComponent().getRouter();
            oRouter.navTo("View2"); 
        },
    
        
        onClick: function() {
            var oComponent = this.getOwnerComponent(); 
            oComponent.onClick(); // Call the function from Component.js
        },
        onRowSelection: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);    
                // Get selected item data
                var oItem = oEvent.getSource();
                var oContext = oItem.getBindingContext("data");
                if (!oContext) {
                    console.error("Binding context is undefined!");
                    return;
                }
                var sPIDocument = oContext.getProperty("PIDocument"); // Get PIDocument
                if (!sPIDocument) {
                    console.error("PIDocument is undefined!");
                    return;
                }
                console.log(sPIDocument)
            
                // Navigate to Detail view with PIDocument as parameter
                oRouter.navTo("View2", {
                    PIDocument: sPIDocument
                });
            }
            
    });
});