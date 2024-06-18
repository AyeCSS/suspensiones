
/***********************************************************************************************************************************/

function processData() 
{
  try
  {
    var processName = 'Suspensiones E2 - Proceso de datos';
    console.log('Proceso "' + processName + '" iniciado.');  
    //======================================================================================================================================
    var {driveFolderUploadId, driveFolderBackupId, to_admin, to_notify, send_email_process_report, projectId, datasetId, processPeriod, fileIdResults} = getParams();
    //======================================================================================================================================

    callSPProcess(projectId, datasetId, processPeriod);
    //updateNextProcessPeriod(); // CAMBIAR : DESCOMENTAR LUEGO DE PRUEBAS.. 
  }
  catch (e) 
  {
    logError('El proceso "' + processName + '" falló sin finalizar. Mensaje de error capturado: "'+e+'".', 'FALLÓ');
  }

  if ( send_email_process_report ) 
    sendEmailReport(to_notify, processName);
  
  resetAllLogs();
  console.log('Proceso "' + processName + '" finalizado.');
}

/***********************************************************************************************************************************/

function callSPProcess(projectId, datasetId, processPeriod)
{
  var retorno = runQuery(projectId, 'CALL '+datasetId+'.SP_FALTANTE_OS('+processPeriod+');' );

  if ( retorno && retorno['result'] && retorno['result'].length > 0 )
    logWarning( 'No se encontraron las siguientes obras sociales en los periodos de analisis: ' + retorno['result'].join(', ') + '.' );
  else
    logInfo( 'Todas las obras sociales se encontraron en los periodos de analisis. ');

  runQuery(projectId, 'DECLARE result STRING; CALL '+datasetId+'.SP_UPD_REL_DEP('+processPeriod+', result); SELECT result;' ); 

  runQuery(projectId, 'DECLARE result STRING; CALL '+datasetId+'.SP_UPD_MON('+processPeriod+', result); SELECT result;' ); 

  runQuery(projectId, 'DECLARE result STRING; CALL '+datasetId+'.SP_UPD_DOM('+processPeriod+', result); SELECT result;' ); 

  runQuery(projectId, 'DECLARE result STRING; CALL '+datasetId+'.SP_UPD_DES('+processPeriod+', result); SELECT result;' ); 

  runQuery(projectId, 'DECLARE result STRING; CALL '+datasetId+'.SP_UPD_ACT_SUS('+processPeriod+', result); SELECT result;' ); 

  runQuery(projectId, 'DECLARE result STRING; CALL '+datasetId+'.SP_METRICAS_ACT_SUS('+processPeriod+', result); SELECT result;' ); 

  runQuery(projectId, 'DECLARE result STRING; CALL '+datasetId+'.SP_CONTROL_GENERAL('+processPeriod+', result); SELECT result;' ); 

  runQuery(projectId, 'DECLARE result STRING; CALL '+datasetId+'.SP_GUARDAR_HISTORICO('+processPeriod+', result); SELECT result;' ); 

  runQuery(projectId, 'CALL '+datasetId+'.SP_ESTADISTICAS_PROCESS('+processPeriod+');' ); 

}

/***********************************************************************************************************************************/


