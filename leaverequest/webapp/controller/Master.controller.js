sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("leaverequest.controller.Master", {
    onItemPress: function (oEvent) {
      const sPath = oEvent.getSource().getBindingContext().getPath().substr(1); // remove "/"
      this.getOwnerComponent().getRouter().navTo("Detail", {
        path: encodeURIComponent(sPath)
      });
    }
    
  });
});
