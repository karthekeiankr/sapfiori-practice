sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";

    return Controller.extend("countphysicalinventory.controller.View2", {
        onInit: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.loadData("/model/localData.json");
            this.getView().setModel(oModel, "data3");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("View2").attachPatternMatched(this._onObjectMatched, this);
        },
        onClick: function() {
            var oComponent = this.getOwnerComponent(); 
            oComponent.onClick(); // Call the function from Component.js
        },
  
        _onObjectMatched: function (oEvent) {
            var sPIDocument = oEvent.getParameter("arguments").PIDocument;
        
            // Set the value to the Warehouse Order Label dynamically
            var oView = this.getView();
            var oLabel = oView.byId("PIDocumentnum"); // Make sure this ID is used in XML
            if (oLabel) {
                oLabel.setText("Warehouse Order: " + sPIDocument);
            }
        },
        navigatetoView3:function(){
            const oRouter=this.getOwnerComponent().getRouter();
            oRouter.navTo("treetable"); 
        }
    });
});