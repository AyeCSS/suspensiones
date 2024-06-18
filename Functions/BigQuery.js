/********************************************************************************************/

function runQuery(projectId, query) 
{
  try 
  {
    var result = null, queryResults = null, totalRows = 0;
    var request = { query: query, useLegacySql: false };
    var queryResults = BigQuery.Jobs.query(request, projectId);
    var jobId = queryResults.jobReference.jobId;

    while (!queryResults.jobComplete) 
    {
      Utilities.sleep(1000); // Espera un segundo
      queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
    }
    //result = (queryResults && queryResults['rows'] ) ? queryResults['rows']  : null ;
    result = simplificarResultados(queryResults);
    totalRows = (queryResults && queryResults.totalRows) ? queryResults.totalRows : null;
    
    console.log('Query: ' + query + ' - Total: '+totalRows + ' - Resultado: ' + ((totalRows < 20) ? result.join(', ') : ' ...demasiados para mostrar... ') );
  }
  catch (error) 
  {
    console.log('Query: ' + query + ' - ERROR: ' + error.toString() );
  }
  return {result, queryResults};
}

/********************************************************************************************/

function runStoredProc(projectId, storedProc, params) 
{
  var query = `CALL \`${storedProc}\`("${params.join('", "')}")`;
  return runQuery(projectId, query);
}


/********************************************************************************************/
function simplificarResultados(queryResults) {
    return queryResults.rows ? queryResults.rows.map(row => row.f.map(item => item.v)) : [];
}
/********************************************************************************************/

function createTable(projectId, datasetId, tableId, fields)
{
  try
  {
    if ( !getTable(projectId, datasetId, tableId) )
    {
      if (fields)
      {
        var query = 'CREATE TABLE '+datasetId+'.'+tableId+' ( '+fields+' );';
        console.log(query);
        runQuery(projectId, query);
      }
      else
      {
        console.log('No se pudo crear tabla, error: No se mapearon campos según tipos de tablas registradas para el nombre de tabla: "'+tableId+'".');
      }
    }
  }
  catch (e)
  {
    console.log('No se pudo crear tabla, error: '+e);
  }
}

/********************************************************************************************/

function getTable(projectId, datasetId, tableId) 
{
  try 
  {
    return BigQuery.Tables.get(projectId, datasetId, tableId);
  } 
  catch (e) 
  {
    console.log('La tabla de nombre: '+tableId+' no existe.'); // console.log('La tabla de nombre: '+tableId+' no existe. ('+e+')');
    return null;
  }
}

/********************************************************************************************/

function importFileToBigQuery(fileId, projectId, datasetId, tableId, fields, headers, append) 
{
  var temp_append = append;
  createTable(projectId, datasetId, tableId, fields);
  var data = getDataFile(fileId);

  if (data)
  {
    //var headers = data[0].map(function(header) { return header.replace(/ /g, '_'); });
    data.shift(); // Remove the first row (headers)

    var maxLength = 50000;
    console.log('Se importarán en la tabla "' + tableId + '" ' + data.length + ' registros.');
    if (data.length > maxLength)
    {
      var arraySplit = splitArray(data, maxLength);
      arraySplit.forEach(function(el) {
        arrayToBigQuery(headers, el, projectId, datasetId, tableId, temp_append);
        temp_append = true; // para que no borre los registros antes cargados por ejecutarlo en bloques
        Utilities.sleep(2000); // 2 seconds wait
      });
    }
    else
    {
      arrayToBigQuery(headers, data, projectId, datasetId, tableId, temp_append);
    }
  }
}

/********************************************************************************************/


function arrayToBigQuery(headers, data, projectId, datasetId, tableId, append) 
{
  var jsonData = [];
  
  for (var i = 0; i < data.length; i++) 
  {
    var row = data[i];
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
  
  var job = BigQuery.Jobs.insert(jobSpec, projectId, blob);  // Upload the data to BigQuery
  var jobId = job.jobReference.jobId;
  console.log('Se ejecutó para la TablaId: "'+tableId+'" el JobId: "'+jobId+'" ');
  return jobId;
}

/********************************************************************************************/

function splitArray(bigArray, maxLength) 
{
  var arrayResult = [];
  for ( var startIndex = 0 ; startIndex < bigArray.length ; startIndex += maxLength ) 
  {
    var endIndex = startIndex + maxLength;
    var subarray = bigArray.slice(startIndex, endIndex);
    arrayResult.push(subarray);
  }
  return arrayResult;
}

/***********************************************************************************************************************************/

function truncateTable(projectId, datasetId, tableId)
{
  try
  {
    var query = 'TRUNCATE TABLE '+datasetId+'.'+tableId+' ;'; // TRUNCATE TABLE [[project_name.]dataset_name.]table_name
    console.log(query);
    runQuery(projectId, query);
  }
  catch (e)
  {
    console.log('No se pudo crear tabla, error: '+e);
  }
}

/********************************************************************************************/

function getDataFile(fileId)
{
  var file = DriveApp.getFileById(fileId);
  var data = [];

  switch (file.getMimeType()) 
  {
    case MimeType.GOOGLE_SHEETS:  // Process as Google Sheets
      data = SpreadsheetApp.openById(fileId).getActiveSheet().getDataRange().getValues();
      break;

    case MimeType.CSV:  // Process as CSV file
      data = Utilities.parseCsv(file.getBlob().getDataAsString());
      break;

    default:
      throw new Error("Tipo de Archivo no soportado.");
  }
  return data;
}

/********************************************************************************************/

function checkAndAwaitBigQueryJobs(projectId) 
{
  var waitTimeInMillis = 10000; // 10 segundos
  
  while (true) 
  {
    var jobsList = (BigQuery.Jobs.list(projectId)).jobs;
    
    if (!jobsList) 
      return true;
    
    var unfinishedJobs = false;
    
    for (var i = 0; i < jobsList.length; i++) 
    {
      var job = jobsList[i];
      
      var jobState = job.status.state;  // Verifica el estado del job  // console.log('Job ID: ' + job.id + ' Estado: ' + jobState);
      
      if (jobState != 'DONE') 
      {
        unfinishedJobs = true; // Marca que hay jobs sin finalizar
        break; // Sale del bucle ya que solo necesitamos saber si al menos uno no ha terminado
      }
    }
    
    if (!unfinishedJobs) 
    {
      console.log('Todos los jobs han finalizado.');
      return true;
    } 
    else 
    {
      console.log('Esperando a que los jobs finalicen...');
      Utilities.sleep(waitTimeInMillis); // Espera antes de volver a verificar
    }
  }
}

/*********************************************************************************************/




