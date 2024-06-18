
/***********************************************************************************************************************************/

function ResultsInSreadsheet() 
{
  try
  {
    var processName = 'Suspensiones E2 - Proceso de datos';
    console.log('Proceso "' + processName + '" iniciado.');  
    //======================================================================================================================================
    var {driveFolderUploadId, driveFolderBackupId, to_notify, send_email_process_report, projectId, datasetId, processPeriod, fileIdResults} = getParams();
    //======================================================================================================================================

    insertResultsInSpreadsheet(projectId, datasetId, processPeriod, fileIdResults);

  }
  catch (e) 
  {
    logError('El proceso "' + processName + '" falló sin finalizar. Mensaje de error capturado: "'+e+'".', 'FALLÓ');
  }

  if ( send_email_process_report ) 
    sendEmailReport(to_notify, processName);
    
  console.log('Proceso "' + processName + '" finalizado.');
}

/***********************************************************************************************************************************/
/***********************************************************************************************************************************/

function insertResultsInSpreadsheet(projectId, datasetId, processPeriod, fileIdResults)
{
  var data = [];

  // tblPadronActSusp
  
  insertResultsInSheet(projectId, datasetId, tableId, fileIdResults)
  var data = getDataFromTableInPeriod(projectId, datasetId, 'tblPadronActSusp', processPeriod)
  insertDataInSheet(fileIdResults, 'PadronActSusp', data['headers'], data['data']); 

  // tblControlGeneral
  var data =  getDataFromTableInPeriod(projectId, datasetId, 'tblControlGeneral', processPeriod)
  insertDataInSheet(fileIdResults, 'ControlGeneral', headers, data['headers'], data['data']); 

  // tblReporteOsSusp
  var data =  getDataFromTableInPeriod(projectId, datasetId, 'tblReporteOsSusp', processPeriod)
  insertDataInSheet(fileIdResults, 'ReporteOsSusp', headers, data['headers'], data['data']); 
  

}

/***********************************************************************************************************************************/

function getDataFromTableInPeriod(projectId, datasetId, tableId, processPeriod)
{
  var retorno = [];

  var retorno = runQuery(projectId, "SELECT * FROM " + datasetId + "." + tableId + " WHERE PERIODO = " + processPeriod + ";" );
  var data = retorno['result'];

  var retorno = runQuery(projectId, "SELECT column_name FROM SuspensionesE2.INFORMATION_SCHEMA.COLUMNS WHERE table_name = '" + tableId + "' ;" );
  var headers = retorno['result'];

  return {headers, data};
}

/***********************************************************************************************************************************/

function insertDataInSheet(fileId, sheetName, headers, data) 
{
  var sheetFile = SpreadsheetApp.openById(fileId);
  var sheet = sheetFile.getSheetByName(sheetName);

  if ( ! sheet )
  {
    sheet = sheetFile.insertSheet();
    sheet.setName(sheetName);
  }
  else
    sheet.clear(); //sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()-1 ).clearContent();
  
  // Datos
  sheet.getRange(1, 1, 1, headers.length).setValues(headers);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
}

/***********************************************************************************************************************************/

