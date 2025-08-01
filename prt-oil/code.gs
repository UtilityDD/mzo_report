// ✅ Fetch structured data from any sheet
function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

// ✅ Add new row to "ptrs" sheet
function addPTR(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ptrs");
    const headers = sheet.getDataRange().getValues()[0];
    
    // Log the received data for debugging
    console.log('Received PTR data:', JSON.stringify(data));
    console.log('PTR Sheet headers:', headers);
    
    const row = headers.map(header => {
      const value = data[header];
      console.log(`PTR Header: "${header}" -> Value: "${value}"`);
      return value || '';
    });
    
    console.log('PTR Row to be inserted:', row);
    sheet.appendRow(row);
    return { status: "PTR added successfully", data: data };
  } catch (error) {
    console.error('Error in addPTR:', error);
    throw error;
  }
}

// ✅ Add new row to "testingrecords" sheet
function submitTestRecord(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("testingrecords");
    const headers = sheet.getDataRange().getValues()[0];
    
    // Log the received data for debugging
    console.log('Received test record data:', JSON.stringify(data));
    console.log('Sheet headers:', headers);
    
    // Create row array mapping headers to data values
    const row = headers.map(header => {
      const value = data[header];
      console.log(`Header: "${header}" -> Value: "${value}"`);
      return value || '';
    });
    
    console.log('Row to be inserted:', row);
    sheet.appendRow(row);
    
    return { status: "Test record submitted successfully", data: data };
  } catch (error) {
    console.error('Error in submitTestRecord:', error);
    throw error;
  }
}

// ✅ Handle GET for data load
function doGet(e) {
  try {
    if (e.parameter.action === 'getInitialData') {
      const map = getSheetData("Map");
      const ptrs = getSheetData("ptrs");
      return ContentService.createTextOutput(JSON.stringify({ map, ptrs }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid request" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// ✅ Handle POST for adding PTR and submitting records
function doPost(e) {
  try {
    const action = e.parameter.action;
    
    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({ error: "No action specified" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    // Parse the data from the POST request
    let payload;
    if (e.parameter.data) {
      // Data sent as URL parameter
      payload = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      // Data sent as POST body
      payload = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ error: "No data provided" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    let result;
    if (action === 'submitTestRecord') {
      result = submitTestRecord(payload);
    } else if (action === 'addPTR') {
      result = addPTR(payload);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action: " + action }))
                           .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message, stack: err.stack }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
