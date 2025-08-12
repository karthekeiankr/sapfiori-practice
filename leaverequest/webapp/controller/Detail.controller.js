sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("leaverequest.controller.Detail", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(this._onMatched, this);
          },
          
          _onMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const sPath = decodeURIComponent(oArgs.path);
            this.getView().bindElement({ path: "/" + sPath });
          
            const oModel = this.getView().getModel();
            const oData = oModel.getProperty("/" + sPath);
            this._renderCalendar(oData);
          },
          
          _renderCalendar: function (oCurrent) {
            const oCalendar = this.getView().byId("leaveCalendar");
            oCalendar.removeAllSpecialDates();
          
            const oModel = this.getView().getModel();
            const aRequests = oModel.getProperty("/LeaveRequests");
          
            aRequests.forEach(req => {
              const startDate = new Date(req.StartDate);
              const endDate = new Date(req.EndDate);
              for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
                  startDate: new Date(d),
                  type: req.Employee === oCurrent.Employee ? "Type01" : "Type07", // blue for current, red for others
                  tooltip: `${req.Employee}'s Leave`
                }));
              }
            });
          },
          
          onApprove: function () {
            sap.m.MessageToast.show("Leave Approved");
          },
          
          onReject: function () {
            sap.m.MessageToast.show("Leave Rejected");
          }
          
    });
  });
  