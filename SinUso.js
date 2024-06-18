
/********************************************************************************************/

function csvToBigQueryCopiaOriginal(csvFileId, projectId, datasetId, tableId, append)   // Copia del completo sin fraccional funcionando
{
  var file = DriveApp.getFileById(csvFileId);
  var csvData = Utilities.parseCsv(file.getBlob().getDataAsString());
  
  var jsonData = [];
  var headers = csvData[0].map(function(header) {
    return header.replace(/ /g, '_');
  });
  
  for (var i = 1; i < csvData.length; i++) 
  {
    var row = csvData[i];
    var obj = {};
    for (var j = 0; j < row.length; j++) 
    {
      var cellValue = row[j];
      if (typeof cellValue === 'string' && cellValue.includes(',')) 
      {
        cellValue = parseFloat(cellValue.replace(',', '.'));
      }
      obj[headers[j]] = cellValue;
    }
    jsonData.push(JSON.stringify(obj));
  }
  
  var blob = Utilities.newBlob(jsonData.join('\n'), 'application/octet-stream');
  
  // Configure the BigQuery job
  var jobSpec = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        writeDisposition: append ? 'WRITE_APPEND' : 'WRITE_TRUNCATE'
      }
    }
  };
  
  // Upload the data to BigQuery
  var job = BigQuery.Jobs.insert(jobSpec, projectId, blob);
  return job.status.state;
}

/********************************************************************************************/

/********************************************************************************************/

function csvToBigQuery2(csvFileId, projectId, datasetId, tableId, append) 
{
  var file = DriveApp.getFileById(csvFileId);
  var csvData = Utilities.parseCsv(file.getBlob().getDataAsString());
  csvData.shift(); // Remove the first row (headers)

  // Convert the data back to CSV format
  var newCsvData = csvData.map(function(row) {
    return row.join(',');
  }).join('\n');
  
  var newBlob = Utilities.newBlob(newCsvData, 'text/csv');
  
  // Configure the BigQuery job
  var jobSpec = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        sourceFormat: 'CSV',
        skipLeadingRows: 0,
        writeDisposition: append ? 'WRITE_APPEND' : 'WRITE_TRUNCATE'
      }
    }
  };
  
  // Upload the data to BigQuery
  var job = BigQuery.Jobs.insert(jobSpec, projectId, newBlob);
  return job.status.state;
}

/********************************************************************************************/

function csvToBigQuery3(csvFileId, projectId, datasetId, tableId, append) 
{
  var file = DriveApp.getFileById(csvFileId);
  var blob = file.getBlob().setContentType('application/octet-stream');
  
  // Configure the BigQuery job
  var jobSpec = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        writeDisposition: append ? 'WRITE_APPEND' : 'WRITE_TRUNCATE'
      }
    }
  };
  
  // Upload the data to BigQuery
  var job = BigQuery.Jobs.insert(jobSpec, projectId, blob);
  return job.status.state;
}

/********************************************************************************************/



function sheetToBigQuery(sheetFileId, sheetName, projectId, datasetId, tableId, append) 
{
  //var file = DriveApp.getFileById(csvFileId);
  //var csvData = Utilities.parseCsv(file.getBlob().getDataAsString());
  var fileSheet = null;
  var dataSheet = null;

  // Ejecuto un Truncate de tabla en BQ (segun si funciona o no append = false)
  // ... 
  //truncateTable(projectId, datasetId, tableId);
  
  var jsonData = [];
  var headers = dataSheet[0].map(function(header) {
    return header.replace(/ /g, '_');
  });
  
  for (var i = 1; i < dataSheet.length; i++) 
  {
    var row = dataSheet[i];
    var obj = {};
    for (var j = 0; j < row.length; j++) 
    {
      var cellValue = row[j];
      if (typeof cellValue === 'string' && cellValue.includes(',')) 
      {
        cellValue = parseFloat(cellValue.replace(',', '.'));
      }
      obj[headers[j]] = cellValue;
    }
    jsonData.push(JSON.stringify(obj));
  }
  
  var blob = Utilities.newBlob(jsonData.join('\n'), 'application/octet-stream');
  
  // Configure the BigQuery job
  var jobSpec = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        writeDisposition: append ? 'WRITE_APPEND' : 'WRITE_TRUNCATE'
      }
    }
  };
  
  // Upload the data to BigQuery
  var job = BigQuery.Jobs.insert(jobSpec, projectId, blob);
  return job.status.state;
}

/********************************************************************************************/
