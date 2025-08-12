sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",           // <== Add this
    "sap/m/MessageToast"  
], (Controller,MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("mailprj.controller.View1", {
        onInit() {
        },
        onMailPress3: function () {
            var contentBox = this.byId("contentBox");
          
            var html = `
              <p>Hello, this is a sample content to send via mail.</p>
              <p>More details can be added here.</p>
              <p><strong>Form Data:</strong></p>
              <ul>
            `;
          
            // Extract Form Data (SimpleForm)
            function extractContent(control) {
              const type = control.getMetadata().getName();
          
              if (type === "sap.ui.layout.form.SimpleForm") {
                const aContent = control.getContent();
                for (let i = 0; i < aContent.length; i++) {
                  const item = aContent[i];
                  const nextItem = aContent[i + 1];
          
                  if (item.getMetadata().getName() === "sap.m.Label") {
                    const labelText = item.getText();
                    let valueText = "";
          
                    if (nextItem) {
                      if (typeof nextItem.getValue === "function") {
                        valueText = nextItem.getValue();
                      } else if (typeof nextItem.getSelectedItem === "function") {
                        const selectedItem = nextItem.getSelectedItem();
                        valueText = selectedItem ? selectedItem.getText() : "";
                      } else if (typeof nextItem.getText === "function") {
                        valueText = nextItem.getText();
                      }
                    }
          
                    html += `<li><strong>${labelText}:</strong> ${valueText}</li>`;
                  }
                }
                html += "</ul>";
              }
          
              // Add table
              if (type === "sap.m.Table") {
                const columns = control.getColumns();
                const headers = columns.map(col => col.getHeader()?.getText?.() || "");
          
                html += `<p><strong>Product Table:</strong></p><table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;"><tr>`;
                headers.forEach(h => {
                  html += `<th>${h}</th>`;
                });
                html += `</tr>`;
          
                control.getItems().forEach(row => {
                  html += `<tr>`;
                  row.getCells().forEach(cell => {
                    const text = typeof cell.getText === "function" ? cell.getText() : "";
                    html += `<td>${text}</td>`;
                  });
                  html += `</tr>`;
                });
          
                html += `</table>`;
              }
          
              // Recursively check children
              const aggs = control.getMetadata().getAllAggregations();
              for (const key in aggs) {
                const aggregation = control.getAggregation(key);
                if (Array.isArray(aggregation)) {
                  aggregation.forEach(child => extractContent(child));
                } else if (aggregation) {
                  extractContent(aggregation);
                }
              }
            }
          
            extractContent(contentBox);
          
            const subject = encodeURIComponent("SAPUI5 Mail Report");
            const body = encodeURIComponent(html); // HTML gets encoded here
          
            const to = "recipient@example.com";
            const cc = "cc@example.com";
            const bcc = "bcc@example.com";
          
            const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}&cc=${cc}&bcc=${bcc}`;
            window.location.href = mailtoLink;
          },
          
        onMailPress: function () {
            var contentBox = this.byId("contentBox");
            var content = "";
          
            function extractContent(control) {
              if (!control || typeof control.getMetadata !== "function") return;
          
              const type = control.getMetadata().getName();
          
              // 👉 Handle SimpleForm (label + value)
              if (type === "sap.ui.layout.form.SimpleForm") {
                const aContent = control.getContent();
                for (let i = 0; i < aContent.length; i++) {
                  const item = aContent[i];
                  const nextItem = aContent[i + 1];
          
                  if (item.getMetadata().getName() === "sap.m.Label") {
                    const labelText = item.getText();
                    let valueText = "";
          
                    if (nextItem) {
                      if (typeof nextItem.getValue === "function") {
                        valueText = nextItem.getValue();
                      } else if (typeof nextItem.getSelectedItem === "function") {
                        const selectedItem = nextItem.getSelectedItem();
                        valueText = selectedItem ? selectedItem.getText() : "";
                      } else if (typeof nextItem.getText === "function") {
                        valueText = nextItem.getText();
                      }
                    }
          
                    content += labelText + ": " + valueText + "\n";
                  }
                }
              }
          
              // 👉 Handle Table
              else if (type === "sap.m.Table") {
                const columns = control.getColumns();
                let headers = [];
                let colWidths = [];
          
                // Collect headers
                columns.forEach(col => {
                  const headerText = col.getHeader()?.getText?.() || "";
                  headers.push(headerText);
                  colWidths.push(headerText.length); // Start with header length
                });
          
                // Prepare rows
                const items = control.getItems();
                const rows = items.map(row => {
                  const cells = row.getCells();
                  return cells.map((cell, index) => {
                    const text = (typeof cell.getText === "function") ? cell.getText() : "";
                    // Update max width for formatting
                    if (text.length > colWidths[index]) {
                      colWidths[index] = text.length;
                    }
                    return text;
                  });
                });
          
                // Format row with padding
                function formatRow(cells) {
                  return cells.map((cell, i) => cell.padEnd(colWidths[i])).join(" | ");
                }
          
                // Add formatted table
                content += "\nProduct Table:\n";
                content += formatRow(headers) + "\n";
                content += colWidths.map(w => "-".repeat(w)).join("-+-") + "\n";
                rows.forEach(row => {
                  content += formatRow(row) + "\n";
                });
              }
          
              // 👉 Generic text elements
              else {
                if (typeof control.getText === "function") {
                  const text = control.getText();
                  if (text) content += text + "\n";
                }
          
                if (typeof control.getValue === "function") {
                  const value = control.getValue();
                  if (value) content += value + "\n";
                }
          
                if (typeof control.getSelectedItem === "function") {
                  const selectedItem = control.getSelectedItem();
                  const text = selectedItem ? selectedItem.getText() : "";
                  if (text) content += text + "\n";
                }
          
                // Recurse
                const aggregations = control.getMetadata().getAllAggregations();
                for (const key in aggregations) {
                  const aggregation = control.getAggregation(key);
                  if (Array.isArray(aggregation)) {
                    aggregation.forEach(child => extractContent(child));
                  } else if (aggregation) {
                    extractContent(aggregation);
                  }
                }
              }
            }
          
            extractContent(contentBox);
          
            const subject = encodeURIComponent("SAPUI5 Mail Report");
            const body = encodeURIComponent(content);
            const to = "recipient@example.com";
            const cc = "cc@example.com";
            const bcc = "bcc@example.com";
          
            const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}&cc=${cc}&bcc=${bcc}`;
            window.location.href = mailtoLink;
          }
          ,
          onMailPress1: function () {
            var contentBox = this.byId("contentBox");
            var content = "";
          
            function extractContent(control) {
              if (!control || typeof control.getMetadata !== "function") return;
          
              const type = control.getMetadata().getName();
          
              // 🟡 Special handling for sap.ui.layout.form.SimpleForm
              if (type === "sap.ui.layout.form.SimpleForm") {
                const aContent = control.getContent();
                for (let i = 0; i < aContent.length; i++) {
                  const item = aContent[i];
                  const nextItem = aContent[i + 1];
          
                  if (item.getMetadata().getName() === "sap.m.Label") {
                    const labelText = item.getText();
                    let valueText = "";
          
                    if (nextItem) {
                      if (typeof nextItem.getValue === "function") {
                        valueText = nextItem.getValue();
                      } else if (typeof nextItem.getSelectedItem === "function") {
                        const selectedItem = nextItem.getSelectedItem();
                        valueText = selectedItem ? selectedItem.getText() : "";
                      } else if (typeof nextItem.getText === "function") {
                        valueText = nextItem.getText();
                      }
                    }
          
                    content += labelText + ": " + valueText + "\n";
                  }
                }
              } else {
                // 🟢 For all other controls (Text, Input, etc.)
                if (typeof control.getText === "function") {
                  const text = control.getText();
                  if (text) content += text + "\n";
                }
          
                if (typeof control.getValue === "function") {
                  const value = control.getValue();
                  if (value) content += value + "\n";
                }
          
                if (typeof control.getSelectedItem === "function") {
                  const selectedItem = control.getSelectedItem();
                  const text = selectedItem ? selectedItem.getText() : "";
                  if (text) content += text + "\n";
                }
          
                // Recursively process child controls
                const aggregations = control.getMetadata().getAllAggregations();
                for (const key in aggregations) {
                  const aggregation = control.getAggregation(key);
                  if (Array.isArray(aggregation)) {
                    aggregation.forEach(child => extractContent(child));
                  } else if (aggregation) {
                    extractContent(aggregation);
                  }
                }
              }
            }
          
            extractContent(contentBox);
          
            const subject = encodeURIComponent("SAPUI5 Mail Report");
            const body = encodeURIComponent(content);
            const to = "recipient@example.com";
            const cc = "cc@example.com";
            const bcc = "bcc@example.com";
          
            const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}&cc=${cc}&bcc=${bcc}`;
            window.location.href = mailtoLink;
          }
          ,
          onMailPress2: function () {
            var contentBox = this.byId("contentBox");
            var content = "";
          
            function extractContent(control) {
              if (!control || typeof control.getMetadata !== "function") return;
          
              const type = control.getMetadata().getName();
          
              // 🟡 Special: Handle SimpleForm (label-value pairs)
              if (type === "sap.ui.layout.form.SimpleForm") {
                const aContent = control.getContent();
                for (let i = 0; i < aContent.length; i++) {
                  const item = aContent[i];
                  const nextItem = aContent[i + 1];
          
                  if (item.getMetadata().getName() === "sap.m.Label") {
                    const labelText = item.getText();
                    let valueText = "";
          
                    if (nextItem) {
                      if (typeof nextItem.getValue === "function") {
                        valueText = nextItem.getValue();
                      } else if (typeof nextItem.getSelectedItem === "function") {
                        const selectedItem = nextItem.getSelectedItem();
                        valueText = selectedItem ? selectedItem.getText() : "";
                      } else if (typeof nextItem.getText === "function") {
                        valueText = nextItem.getText();
                      }
                    }
          
                    content += labelText + ": " + valueText + "\n";
                  }
                }
              }
          
              // 🟢 Special: Handle sap.m.Table
              else if (type === "sap.m.Table") {
                // Extract header row
                const columns = control.getColumns();
                const header = columns.map(col => {
                  const headerControl = col.getHeader();
                  return headerControl && typeof headerControl.getText === "function"
                    ? headerControl.getText()
                    : "";
                }).join(" | ");
                content += "\n" + header + "\n";
          
                // Extract table rows
                const items = control.getItems(); // rows
                items.forEach(row => {
                  const cells = row.getCells();
                  const rowText = cells.map(cell => {
                    if (typeof cell.getText === "function") return cell.getText();
                    if (typeof cell.getValue === "function") return cell.getValue();
                    return "";
                  }).join(" | ");
                  content += rowText + "\n";
                });
              }
          
              // 🧩 Generic Controls (Text, Input, etc.)
              else {
                if (typeof control.getText === "function") {
                  const text = control.getText();
                  if (text) content += text + "\n";
                }
          
                if (typeof control.getValue === "function") {
                  const value = control.getValue();
                  if (value) content += value + "\n";
                }
          
                if (typeof control.getSelectedItem === "function") {
                  const selectedItem = control.getSelectedItem();
                  const text = selectedItem ? selectedItem.getText() : "";
                  if (text) content += text + "\n";
                }
          
                // Recursively handle children
                const aggregations = control.getMetadata().getAllAggregations();
                for (const key in aggregations) {
                  const aggregation = control.getAggregation(key);
                  if (Array.isArray(aggregation)) {
                    aggregation.forEach(child => extractContent(child));
                  } else if (aggregation) {
                    extractContent(aggregation);
                  }
                }
              }
            }
          
            extractContent(contentBox);
          
            const subject = encodeURIComponent("SAPUI5 Mail Report");
            const body = encodeURIComponent(content);
            const to = "recipient@example.com";
            const cc = "cc@example.com";
            const bcc = "bcc@example.com";
          
            const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}&cc=${cc}&bcc=${bcc}`;
            window.location.href = mailtoLink;
          },
          onOpenMailDialog: function () {
            var oView = this.getView();
          
            // Get page content as email body
            var contentBox = this.byId("contentBox");
            var content = "";
            contentBox.getItems().forEach(function (item) {
              if (item.getMetadata().getName() === "sap.m.Text") {
                content += item.getText() + "\n";
              }
            });
          
            // Create mail dialog only once
            if (!this._oMailDialog) {
              this._oMailDialog = new sap.m.Dialog({
                title: "Send Mail",
                contentWidth: "500px",
                content: [
                  new sap.m.Label({ text: "To" }),
                  new sap.m.Input({ id: "toInput", placeholder: "Enter To address" }),
          
                  new sap.m.Label({ text: "CC" }),
                  new sap.m.Input({ id: "ccInput", placeholder: "Enter CC address" }),
          
                  new sap.m.Label({ text: "BCC" }),
                  new sap.m.Input({ id: "bccInput", placeholder: "Enter BCC address" }),
          
                  new sap.m.Label({ text: "Subject" }),
                  new sap.m.Input({ id: "subjectInput", value: "Report from SAPUI5 App" }),
          
                  new sap.m.Label({ text: "Body" }),
                  new sap.m.TextArea({ id: "bodyInput", value: content, rows: 8 })
                ],
                beginButton: new sap.m.Button({
                  text: "Send",
                  press: this.onSendMail.bind(this)
                }),
                endButton: new sap.m.Button({
                  text: "Cancel",
                  press: function () {
                    this._oMailDialog.close();
                  }.bind(this)
                })
              });
          
              oView.addDependent(this._oMailDialog);
            } else {
              sap.ui.getCore().byId("bodyInput").setValue(content);
            }
          
            this._oMailDialog.open();
          },
          
          onSendMail: function () {
            var to = sap.ui.getCore().byId("toInput").getValue();
            var cc = sap.ui.getCore().byId("ccInput").getValue();
            var bcc = sap.ui.getCore().byId("bccInput").getValue();
            var subject = sap.ui.getCore().byId("subjectInput").getValue();
            var body = sap.ui.getCore().byId("bodyInput").getValue();
          
            // Example AJAX call to backend
            $.ajax({
              url: "/your-service/sendMail", // Replace with your backend mail URL
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify({
                to: to,
                cc: cc,
                bcc: bcc,
                subject: subject,
                body: body
              }),
              success: function () {
                MessageToast.show("Email sent successfully");
              },
              error: function () {
                MessageBox.error("Failed to send email.");
              }
            });
          
            this._oMailDialog.close();
          }
          
          
    });
});