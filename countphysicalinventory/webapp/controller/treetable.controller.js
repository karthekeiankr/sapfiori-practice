sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";

    return Controller.extend("countphysicalinventory.controller.View3", {
      onInit: function(){
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.loadData("/model/treetable.json");
        this.getView().setModel(oModel, "data4");
      },
      //collapse is to close the expanded structure
      onCollapseAll: function() {
        const oTreeTable = this.byId("TreeTable");
        oTreeTable.collapseAll();
    },

    onCollapseSelection: function() {
        const oTreeTable = this.byId("TreeTable");
        oTreeTable.collapse(oTreeTable.getSelectedIndices());
    },
    //expand is to open the hierarchy structure 
    onExpandFirstLevel: function() {
        const oTreeTable = this.byId("TreeTable");
        oTreeTable.expandToLevel(1);
    },

    onExpandSelection: function() {
        const oTreeTable = this.byId("TreeTable");
        oTreeTable.expand(oTreeTable.getSelectedIndices());
    }
    });
});