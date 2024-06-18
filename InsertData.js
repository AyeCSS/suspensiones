/***********************************************************************************************************************************/

function insertData() 
{
  try
  {
    var processName = 'Suspensiones E2 - Insercción de datos';
    console.log('Proceso "' + processName + '" iniciado.');  
    //======================================================================================================================================
    var {driveFolderUploadId, driveFolderBackupId, to_admin, to_notify, send_email_process_report, projectId, datasetId, processPeriod, fileIdResults} = getParams();
    //======================================================================================================================================
    var periods = getPeriods(processPeriod);
    var tables = getTablesIds(periods);

    checkTables(projectId, datasetId, tables);

    callSPToInsert(projectId, datasetId, tables);
    logInfo('Se completó la insercción de datos para procesar.');

  }
  catch (e) 
  {
    logError('El proceso "' + processName + '" falló sin finalizar. Mensaje de error capturado: "'+e+'".', 'FALLÓ');
  }

  if ( send_email_process_report ) 
    sendEmailReport(to_admin, processName);
  
  resetAllLogs();    
  console.log('Proceso "' + processName + '" finalizado.');
}

/***********************************************************************************************************************************/

function getTablesIds (periods)
{
  var tableAP1Id = getTableIdFromName('Aportes_Pagos_'+periods.periodAP1+'.csv') // tblTemp_202401_AportesPagos_202308
  var tableAP2Id = getTableIdFromName('Aportes_Pagos_'+periods.periodAP2+'.csv') // tblTemp_202401_AportesPagos_202309
  var tableAP3Id = getTableIdFromName('Aportes_Pagos_'+periods.periodAP3+'.csv') // tblTemp_202401_AportesPagos_202310
  var tableMAP1Id = getTableIdFromName('Monotributo_Aportes_Pago_'+periods.periodMAP1+'.csv') // tblTemp_202401_MonotributoAportesPago_202310
  var tableMAP2Id = getTableIdFromName('Monotributo_Aportes_Pago_'+periods.periodMAP2+'.csv') // tblTemp_202401_MonotributoAportesPago_202311
  var tableMAP3Id = getTableIdFromName('Monotributo_Aportes_Pago_'+periods.periodMAP3+'.csv') // tblTemp_202401_MonotributoAportesPago_202312
  var tableDesempleoId = getTableIdFromName('Desempleo_'+periods.processPeriod) // tblTemp_202401_Desempleo_202401
  var tablePadronActSuspId = getTableIdFromName('PadronActSusp_'+periods.processPeriod) // tblTemp_202401_PadronActSusp_202401

  var tables = [tableAP1Id, tableAP2Id, tableAP3Id, tableMAP1Id, tableMAP2Id, tableMAP3Id, tableDesempleoId, tablePadronActSuspId];
  return tables; 
}

/***********************************************************************************************************************************/

function checkTables(projectId, datasetId, tables)
{
  tables.forEach((tableId) => {
    if ( getTable(projectId, datasetId, tableId) )
      console.log('TablaId: '+tableId+ ' existente en BQ.')
    else
      logError('No se encontró la tablaId como tabla existente BQ: '+tableId, 'WITH ERRORS');
  });
  console.log('Tablas chequeadas.');
}

/***********************************************************************************************************************************/

function callSPToInsert(projectId, datasetId, tables)
{
  // Truncates tables
  truncateTable(projectId, datasetId, 'tblDesempleo');
  truncateTable(projectId, datasetId, 'tblPadronActSusp');
  truncateTable(projectId, datasetId, 'tblRelacionDependencia');
  truncateTable(projectId, datasetId, 'tblDomestica');
  truncateTable(projectId, datasetId, 'tblMonotributo');
  truncateTable(projectId, datasetId, 'tblReporteOsSusp');
  truncateTable(projectId, datasetId, 'tblControlGeneral');


  // tblDesempleo
  runQuery(projectId, 'CALL '+datasetId+'.SP_INSERT_DESEMPLEO_FROM_TABLE("'+datasetId+'.'+tables[6]+'"); ' );
  
  // tblPadronActSusp
  runQuery(projectId, 'CALL '+datasetId+'.SP_INSERT_PADRON_ACT_SUSP_FROM_TABLE("'+datasetId+'.'+tables[7]+'"); ' );

  // tblRelacionDependencia
  runQuery(projectId, 'CALL '+datasetId+'.SP_INSERT_REL_DEP_FROM_TABLES("'+datasetId+'.'+tables[0]+'", "'+datasetId+'.'+tables[1]+'", "'+datasetId+'.'+tables[2]+'"); ' );

  // tblDomestica
  runQuery(projectId, 'CALL '+datasetId+'.SP_INSERT_DOM_FROM_TABLES("'+datasetId+'.'+tables[3]+'", "'+datasetId+'.'+tables[4]+'"); ' );

  // tblMonotributo
  runQuery(projectId, 'CALL '+datasetId+'.SP_INSERT_MON_FROM_TABLES( "'+datasetId+'.'+tables[4]+'", "'+datasetId+'.'+tables[5]+'" ); ' );
 
  
}









