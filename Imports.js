/***********************************************************************************************************************************/

function importFiles() 
{
  try
  {
    var processName = 'Suspensiones E2 - Importación de datos';
    console.log('Proceso "' + processName + '" iniciado.');  
    //======================================================================================================================================
    var {driveFolderUploadId, driveFolderBackupId, to_admin, to_notify, send_email_process_report, projectId, datasetId, processPeriod, fileIdResults} = getParams();
    //======================================================================================================================================

    var filesArray = [];
    convertirXlsxAGoogleSheet(driveFolderUploadId, driveFolderBackupId);
    obtenerArchivos(driveFolderUploadId, '.*$', filesArray, '', driveFolderBackupId);
    //======================================================================================================================================
    if (filesArray.length > 0)
    {
      for (pos in filesArray)  
      {
        try
        {
          var rowFile = filesArray[pos];
          console.log('Archivo a importar: "' + rowFile.name + '" (' + rowFile.id + ').'); 
          
          importFile(rowFile.id, projectId, datasetId, rowFile.name);

          moveFile(rowFile.id, driveFolderBackupId);

          logInfo('Se importó el archivo "'+rowFile.name+'".');
        }
        catch (e) // CAPTURA DE ERROR DE UN ARCHIVO EN PARTICULAR
        {
          logError('El proceso "' + processName + '" encontró un error en el archivo "'+rowFile.name+'" y no lo pudo importar correctamente. Mensaje de error capturado: "'+e+'".', 'CON ERRORES');
        }
      }
    }
    else
    {
      logError('El proceso "' + processName + '" finalizó sin encontrar archivos para importar.', 'FALLÓ');
    }
  }
  catch (e) 
  {
    logError('El proceso "' + processName + '" falló sin finalizar correctamente, por favor revisar el log de ejecución para su corrección. Mensaje de error capturado: "'+e+'".', 'FALLÓ');
  }

  if ( send_email_process_report ) 
    sendEmailReport(to_admin, processName);
  
  resetAllLogs();
  
  console.log('Proceso "' + processName + '" finalizado.');
}

/***********************************************************************************************************************************/

function importFile(fileId, projectId, datasetId, fileName)
{
  var tableId = getTableIdFromName(fileName);
  var fields = getFieldsOfTable(tableId);
  var headers = getHeadersOfTable(tableId);
  var append = false;
  importFileToBigQuery(fileId, projectId, datasetId, tableId, fields, headers, append);
}

/***********************************************************************************************************************************/


