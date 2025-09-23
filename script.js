function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function doPut(e) {
  return handleRequest(e, "PUT");
}

function doDelete(e) {
  return handleRequest(e, "DELETE");
}

function handleRequest(e, method) {
  const response = { message: "successful", status: "success", data: ''};

  try {
    if (method === "GET") {
      let { action, data } = e.parameter;
      
      if (action == 'getCustomer') {
        response.data = getCustomerByUid(data);
        return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
      }
      
      /***
      else if (data == 'token_vtp') {
        let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("data");
        let vtpTokenRange = sheet.getRange('A2');
        let token = vtpTokenRange.getValue();
        return ContentService.createTextOutput(token).setMimeType(ContentService.MimeType.TEXT);
      }
      ***/
      
      else {
        return ContentService.createTextOutput("error!").setMimeType(ContentService.MimeType.TEXT);
      }

    }

    if (method === "POST") {
      let params = JSON.parse(e.postData.contents);
      let { action, data } = params;

      if (action == 'setCustomer') {
        try {
          let result = setCustomer(data);
          response.message = result;
        }
        catch (error) {
          response.status = 'error';
          response.message = error.message;
        } 
        finally {
          return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
        }
      }

      if (action == 'token') {
        vtpTokenRange.setValue(data);
        return ContentService.createTextOutput("Dữ liệu đã được thêm.").setMimeType(ContentService.MimeType.TEXT);
      }
    }

    if (method === "PUT") {
      const params = JSON.parse(e.postData.contents);
      const row = parseInt(params.row); // Vị trí dòng cần cập nhật
      sheet.getRange(row, 1, 1, 3).setValues([[params.name, params.age, params.city]]);
      return ContentService.createTextOutput("Dữ liệu đã được cập nhật.");
    }

    if (method === "DELETE") {
      const params = JSON.parse(e.postData.contents);
      const row = parseInt(params.row);
      sheet.deleteRow(row);
      return ContentService.createTextOutput("Dữ liệu đã được xóa.");
    }

    return ContentService.createTextOutput("Phương thức không được hỗ trợ.");
  } catch (error) {
    return ContentService.createTextOutput("Lỗi: " + error).setMimeType(ContentService.MimeType.TEXT);
  }
}

function getCustomerByUid(uid) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("customers");
  let headers = sheet.getRange('1:1').getValues()[0];
  let customer = null;
  let foundRange = sheet.getRange("B:B").createTextFinder(uid).matchEntireCell(true).findNext();
  if (foundRange) {
    let rowIndex = foundRange.getRow();
    let rowValues = sheet.getRange(rowIndex, 1, 1, 10).getValues()[0]
    customer = new Object();
    headers.forEach((header, i) => {
      customer[header] = rowValues[i];
    });
  }
  return customer;
}

function setCustomer(data) {
  let { uid, name, phone, addr, img } = data;
  if (!uid) throw new Error('uid invalid!');

  Object.keys(data).forEach(k => { data[k] = "'"+data[k] }); 

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("customers");
  let headers = sheet.getRange('1:1').getValues()[0];

  let foundRange = sheet.getRange("B:B").createTextFinder(uid).findNext();
  if (foundRange) {
    let rowIndex = foundRange.getRow();
    Object.keys(data).forEach(key => {
      let colIndex = headers.indexOf(key) + 1;
      colIndex && sheet.getRange(rowIndex, colIndex, 1, 1).setValue(data[key]);
    });
    return "Dữ liệu đã được cập nhật";
  } 
  
  else {
    let time = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    sheet.appendRow([time, uid, name, phone, addr, img]);
    return "Dữ liệu đã được thêm";
  }
}
