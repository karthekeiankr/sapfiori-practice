sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/unified/FileUploaderParameter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"

  ], function (Controller, JSONModel, FileUploaderParameter, MessageToast, MessageBox ) {
    "use strict";
  
    return Controller.extend("xlupload.controller.View1", {
      onInit: function () {
        this.getView().setModel(new JSONModel({ fileData: [] }));
        console.log("OData Model check:", this.getView().getModel());
        // const oModel = this.getView().getModel("odata");
        // oModel.setUseBatch(true);
      },
       // download xlsx.full.min.js from google and create lib folder and inside it and use it here
      onFileUpload: function (oEvent) {
        const oFileUploader = oEvent.getSource();
        const oFile = oFileUploader.getFocusDomRef().files[0];
        const that = this;
  
        if (!oFile) return;
  
        const fileName = oFile.name.toLowerCase();
  
        const reader = new FileReader();
  
        if (fileName.endsWith(".csv")) {
          reader.onload = function (e) {
            const text = e.target.result;
            const lines = text.split("\n");
            const headers = lines[0].trim().split(",");
            const data = [];
  
            for (let i = 1; i < lines.length; i++) {
              const row = lines[i].trim();
              if (!row) continue;
              const values = row.split(",");
              const obj = {};
              headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim();
              });
              data.push(obj);
            }
  
            that.getView().getModel().setProperty("/fileData", data);
            sap.m.MessageToast.show("CSV file loaded");
          };
  
          reader.readAsText(oFile);
        } else if (fileName.endsWith(".xlsx")) {
          

          reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' }); 
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
            var headers = jsonData[0];
            var rows = jsonData.slice(1);
          
            var formattedData = rows.map(row => {
              var obj = {};
              headers.forEach((header, index) => {
                var key = header.trim();
                switch (key) {
                  case "Id":
                    obj["Id"] = row[index].toString();
                    break;
                  case "Name":
                    obj["Name"] = row[index];
                    break;
                  case "City":
                    obj["City"] = row[index];
                    break;
                }
              });
              return obj;
            });
          
            that.getView().getModel().setProperty("/fileData", formattedData);
            console.log(formattedData)
            sap.m.MessageToast.show("Excel file loaded");
          };
          
          reader.readAsArrayBuffer(oFile);  // ✅ keep this
          
        } else {
          sap.m.MessageToast.show("Unsupported file type. Please use .csv or .xlsx");
        }
      },

      // function to upload data to backend with batchcall,makesure the usebatch is true in model of your manifest
      onUploadData: function () {
        const oView = this.getView();
        const aData = oView.getModel().getProperty("/fileData");
        const oODataModel = oView.getModel("odata");
      
        console.log("Data to upload:", aData);
        console.log("OData Model:", oODataModel);
      
        if (!aData || aData.length === 0) {
          sap.m.MessageToast.show("No data to upload.");
          return;
        }
      
          let successCount = 0;
          let errorCount = 0;

        // Set batch and deferred group
        oODataModel.setUseBatch(true); // Optional if already in manifest
        oODataModel.setDeferredGroups(["batchGroup1"]);
      
        // Loop and create batch requests
        // aData.forEach((entry) => {
        //   oODataModel.create("/UPLOADSet", entry, {
        //     groupId: "batchGroup1"
        //   });
        // });
      
      
       // When you send a batch request via submitChanges, 
       // all create() calls are grouped into one single changeset by default — unless configured otherwise.
       //  But the default backend handler (DPC_EXT) only supports ONE operation per changeset.


       aData.forEach((entry, index) => {
        oODataModel.create("/UPLOADSet", entry, {
          groupId: "batchGroup1",
          changeSetId: "changeset_" + index ,// 

          success: function () {
            successCount++;
             if (successCount + errorCount === aData.length) {
                sap.m.MessageToast.show(`${successCount} entries uploaded successfully. ${errorCount} failed.`);
              }
          },
          error: function (oError) {
            errorCount++;
            console.error("Upload failed for row " + (index + 1), oError);
            if (successCount + errorCount === aData.length) {
               sap.m.MessageToast.show(`${successCount} entries uploaded successfully. ${errorCount} failed.`);
            }
          }
        });
      });

      
        //By assigning a unique changeSetId for each record, 
        // you're telling SAP Gateway to handle each one individually — avoiding the "only one operation per changeset" error.

        // Submit the batch
        oODataModel.submitChanges({
          groupId: "batchGroup1",
          success: function (oData) {
            const aChangeResponses = oData.__batchResponses?.[0]?.__changeResponses;
    
            if (aChangeResponses && aChangeResponses[0]?.statusCode === "201") {
              setTimeout(function() {
                sap.m.MessageToast.show("Data uploaded successfully!");
            }, 2000);
            } else {
                console.warn("Upload might not be successful. Check:", aChangeResponses);
                sap.m.MessageBox.warning("Upload finished, but response was unexpected.");
            }
          },
          error: function (oError) {
            console.error("Upload failed!", oError);
            sap.m.MessageBox.error("Upload failed. See console for details.");
          }
        
        });
      },
     
      onLoadData: function () {
        const oModel = this.getView().getModel("odata");
      
        oModel.read("/UPLOADSet", {
          success: (oData) => {
            // Set the data to local JSON model (bound to table)
            this.getView().getModel().setProperty("/fileData", oData.results);
            sap.m.MessageToast.show("Data loaded from backend.");
          },
          error: (oError) => {
            console.error("Failed to load data", oError);
            sap.m.MessageBox.error("Error loading data from backend.");
          }
        });
      },
      
  
      onDeleteSelected: function () {
        const oModel = this.getView().getModel("odata");
        const oTable = this.byId("dataTable");
        const aSelectedItems = oTable.getSelectedItems();
  
        if (!aSelectedItems.length) {
          return MessageToast.show("No rows selected for deletion.");
        }
  
        oModel.setDeferredGroups(["batchDelete"]);
  
        aSelectedItems.forEach((item, i) => {
          const oData = item.getBindingContext().getObject();
          const sPath = `/UPLOADSet('${oData.Id}')`;
  
          oModel.remove(sPath, {
            groupId: "batchDelete",
            changeSetId: "deleteSet_" + i
          });
        });
  
        oModel.submitChanges({
          groupId: "batchDelete",
          success: () => {
            MessageToast.show("Batch delete successful.");
            this.onLoadData(); // Refresh
          },
          error: (oError) => {
            console.error("Delete error", oError);
            MessageBox.error("Batch delete failed.");
          }
        });
      },
  
      onUpdateSelected: function () {
        const oModel = this.getView().getModel("odata");
        const oTable = this.byId("dataTable");
        const aSelectedItems = oTable.getSelectedItems();
  
        if (!aSelectedItems.length) {
          return MessageToast.show("No rows selected for update.");
        }
  
        oModel.setDeferredGroups(["batchUpdate"]);
  
        aSelectedItems.forEach((item, i) => {
          const oData = item.getBindingContext().getObject();
          const sPath = `/UPLOADSet('${oData.Id}')`;
  
          oModel.update(sPath, {
            Name: oData.Name,
            City: oData.City
          }, {
            groupId: "batchUpdate",
            changeSetId: "updateSet_" + i
          });
        });
  
        oModel.submitChanges({
          groupId: "batchUpdate",
          success: () => MessageToast.show("Batch update successful."),
          error: (oError) => {
            console.error("Update error", oError);
            MessageBox.error("Batch update failed.");
          }
        });
      }
  
      
      
      
      
    
// //function for uploading to backend without batchcall,makesure the usebatch is false in model of your manifest, if it is true the upload wont happen
//       onUploadData: function () {
//   const oView = this.getView();
//   const aData = oView.getModel().getProperty("/fileData");
//   const oODataModel = oView.getModel("odata"); // <- OData model alias from manifest.json

//   console.log("Data to upload:", aData);
//   console.log("OData Model:", oODataModel);

//   if (!aData || aData.length === 0) {
//     sap.m.MessageToast.show("No data to upload.");
//     return;
//   }

//   let successCount = 0;
//   let errorCount = 0;

//   aData.forEach((entry, index) => {
//     console.log("Uploading row:", entry);  // ✅ helpful debug
//     oODataModel.create("/UPLOADSet", entry, {
//       success: function () {
//         successCount++;
//         if (successCount + errorCount === aData.length) {
//           sap.m.MessageToast.show(`${successCount} entries uploaded successfully. ${errorCount} failed.`);
//         }
//       },
//       error: function (oError) {
//         errorCount++;
//         console.error("Upload failed for row " + (index + 1), oError);
//         if (successCount + errorCount === aData.length) {
//           sap.m.MessageToast.show(`${successCount} entries uploaded successfully. ${errorCount} failed.`);
//         }
//       }
//     });
//   });
// },



// onUploadData: function () {    
//            const aData = this.getView().getModel().getProperty("/fileData");  
//            console.log(aData);           
//            const oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZXL_UPLOAD_SRV/");            
//             oODataModel.setUseBatch(false); // Avoid batch-related 500 errors             
//             aData.forEach((row,index) => {                 
//               const payload = {
//                Id: row.Id.toString(), 
//                 Name: row.Name,
//                 City: row.City
//               };
//               console.log("Payload:", payload);              
//               oODataModel.create("/UPLOADSet", payload, {                     
                
//                 success: () => sap.m.MessageToast.show("Uploaded: " +payload+ payload.Name),   
                            
//                 error: (oError) => {                         
//                   sap.m.MessageToast.show("Failed to upload: " + payload.Name);                         
//                   console.error("Upload error:", oError);                     
//                 }                 
//               });             
//             });         
//           },
 
    });
  });
  