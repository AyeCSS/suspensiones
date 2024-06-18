const arrFieldsTable = {
    'MonotributoAportesPago': 
      'OBRA_SOCIAL_CODIGO INTEGER, PERIODO INTEGER, CUIT INTEGER, CUIL INTEGER, CONCEPTO STRING, PAGOS_APORTES FLOAT64, PAGOS_CONTRIBUCION FLOAT64, PAGOS_RETENCION FLOAT64, TOTAL_PAGADO FLOAT64, PAGOS_INTERESES FLOAT64, FECHA_PAGO DATE, FECHA_PROCESO_DDJJ DATE',
    'AportesPagos': 
      'OBRA_SOCIAL_CODIGO INTEGER, PERIODO INTEGER, CUIT INTEGER, CUIL INTEGER, ASOCIADO STRING, REMOSIMP FLOAT64, REMCONT FLOAT64, DDJJ_APORTES FLOAT64, ADIC_DDJJ_APORTES FLOAT64, DDJJ_CONTRIBUCION FLOAT64, ADIC_DDJJ_CONTRIBUCION FLOAT64, ADIC_FAMILIARES FLOAT64, TOTAL_DECLARADO FLOAT64, PAGOS_APORTES FLOAT64, PAGOS_CONTRIBUCION FLOAT64, PAGOS_RETENCION FLOAT64, TOTAL_PAGADO FLOAT64, SALDO FLOAT64, FECHA_PAGO DATE, FECHA_PROCESO_DDJJ DATE',
    'Desempleo': 
      'PERIODO INTEGER, RNOS STRING, CUIL INTEGER, ',
    'PadronActSusp': 
      'PERIODO INTEGER, CUIL INTEGER, NRO_PERSONA INTEGER, NRO_CUENTA INTEGER, SUBCUENTA INTEGER, DESC_OS STRING, ESTADO STRING, MONOTRIBUTO FLOAT64, PAGOS FLOAT64, PAGOS_VS_INTEGRANTES FLOAT64, DESEMPLEO FLOAT64, DOMESTICAS FLOAT64, DDJJ FLOAT64, APORTE3_ACTUAL FLOAT64, APORTE2_ANTERIOR FLOAT64, APORTE1_ANTIGUO FLOAT64, ANALISIS STRING, ANALISIS1 FLOAT64'
  };

const arrHeadersTable = {
    'MonotributoAportesPago': 
      ['OBRA_SOCIAL_CODIGO','PERIODO','CUIT','CUIL','CONCEPTO','PAGOS_APORTES','PAGOS_CONTRIBUCION','PAGOS_RETENCION','TOTAL_PAGADO','PAGOS_INTERESES','FECHA_PAGO','FECHA_PROCESO_DDJJ'],
    'AportesPagos': 
      ['OBRA_SOCIAL_CODIGO','PERIODO','CUIT','CUIL','ASOCIADO','REMOSIMP','REMCONT','DDJJ_APORTES','ADIC_DDJJ_APORTES','DDJJ_CONTRIBUCION','ADIC_DDJJ_CONTRIBUCION','ADIC_FAMILIARES','TOTAL_DECLARADO','PAGOS_APORTES','PAGOS_CONTRIBUCION','PAGOS_RETENCION','TOTAL_PAGADO','SALDO','FECHA_PAGO','FECHA_PROCESO_DDJJ'],
    'Desempleo': 
      ['PERIODO','RNOS','CUIL'],
    'PadronActSusp': 
      ['PERIODO','CUIL','NRO_PERSONA','NRO_CUENTA','SUBCUENTA','DESC_OS','ESTADO','MONOTRIBUTO','PAGOS','PAGOS_VS_INTEGRANTES','DESEMPLEO','DOMESTICAS','DDJJ','APORTE3_ACTUAL','APORTE2_ANTERIOR','APORTE1_ANTIGUO','ANALISIS','ANALISIS1']
  };

/***********************************************************************************************************************************/
/***********************************************************************************************************************************/

function getPeriods(processPeriod)
{
  //var processPeriod = getProcessPeriod();
  const formatDate = date => `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  let date = new Date(parseInt(processPeriod.substring(0, 4)), parseInt(processPeriod.substring(4, 6)) - 1);
  let periodAP1 = formatDate(new Date(date.setMonth(date.getMonth() - 5)));
  let periodAP2 = formatDate(new Date(date.setMonth(date.getMonth() + 1)));
  let periodAP3 = formatDate(new Date(date.setMonth(date.getMonth() + 1)));
  let periodMAP1 = formatDate(new Date(date.setMonth(date.getMonth())));
  let periodMAP2 = formatDate(new Date(date.setMonth(date.getMonth() + 1)));
  let periodMAP3 = formatDate(new Date(date.setMonth(date.getMonth() + 1)));
  return {processPeriod, periodAP1, periodAP2, periodAP3, periodMAP1, periodMAP2, periodMAP3};
}

/***********************************************************************************************************************************/

function getParams()
{
    // SE OBTIENEN LOS PARAMETROS
    var arrParams = obtenerParametros(paramsSheetFileId, ['Parametros']);
    var driveFolderUploadId = obtenerParametro(arrParams,'Parametros','UPLOAD FOLDER ID');
    var driveFolderBackupId = obtenerParametro(arrParams,'Parametros','BACKUP FOLDER ID');
    var to_admin = obtenerParametro(arrParams,'Parametros','ADMIN EMAIL');
    var to_notify = obtenerParametro(arrParams,'Parametros','NOTIFY EMAIL');
    var send_email_process_report = (obtenerParametro(arrParams,'Parametros','ENVIAR REPORTE')=='SI')? true : false;
    var projectId = obtenerParametro(arrParams,'Parametros','PROJECT_ID');
    var datasetId = obtenerParametro(arrParams,'Parametros','DATASET_ID');
    var processPeriod = String(obtenerParametro(arrParams,'Parametros','PROCESS_PERIOD')).trim();
    var fileIdResults = String(obtenerParametro(arrParams,'Parametros','FILE_ID_RESULTS')).trim();
    
    return {driveFolderUploadId, driveFolderBackupId, to_admin, to_notify, send_email_process_report, projectId, datasetId, processPeriod, fileIdResults};
}

/***********************************************************************************************************************************/

function getProcessPeriod()
{
    var arrParams = obtenerParametros(paramsSheetFileId, ['Parametros']);
    var processPeriod = String(obtenerParametro(arrParams,'Parametros','PROCESS_PERIOD')).trim();
    return processPeriod;
}

/***********************************************************************************************************************************/

function getTableIdFromName(fileName)
{
  var processPeriod = getProcessPeriod(); 
  var tablePrefix = "tblTemp_"+processPeriod+"_";
  var periodo = fileName.replace(/\D+/g, '');
  switch (true) 
  {
    case /Aportes_Pagos.*\.csv$/.test(fileName):
        return tablePrefix + "AportesPagos_"+periodo;
    case /Monotributo_Aportes_Pago.*\.csv$/.test(fileName):
        return tablePrefix + "MonotributoAportesPago_"+periodo;
    case /Desempleo.*$/.test(fileName):
        return tablePrefix + "Desempleo_"+periodo;
    case /PadronActSusp.*$/.test(fileName):
        return tablePrefix + "PadronActSusp_"+periodo;
  }
  throw new Error('No se pudo obtener el tablaId para el archivo de nombre: '+fileName);
}

/***********************************************************************************************************************************/


function updateNextProcessPeriod() 
{
  var celdaFecha = "B10";
  var nextProcessPeriod = calcNextProcessPeriod();
  SpreadsheetApp.openById(paramsSheetFileId).getSheetByName('Parametros').getRange(celdaFecha).setValue(nextProcessPeriod);
  logInfo('Se actualizó el periodo del proceso para la siguiente ejecución: '+nextProcessPeriod)
}

/***********************************************************************************************************************************/

function getFieldsOfTable(tableId)
{
  for (const key in arrFieldsTable) 
  {
    if (tableId.includes(key)) 
      return arrFieldsTable[key];
  }
  throw new Error('No se pudieron obtener los campos y tipos para la tabla de nombre: '+tableId);
}

/***********************************************************************************************************************************/

function getHeadersOfTable(tableId)
{
  for (const key in arrHeadersTable) 
  {
    if (tableId.includes(key)) 
      return arrHeadersTable[key];
  }
  throw new Error('No se pudieron obtener los campos para la tabla de nombre: '+tableId);
}

/***********************************************************************************************************************************/

function calcProcessPeriod()
{
  var processPeriod = Utilities.formatDate(new Date(new Date((new Date().setDate(1))).setMonth(new Date().getMonth() + 1)), 'America/Buenos_Aires', 'yyyyMM');
  return processPeriod;
}

/***********************************************************************************************************************************/

function calcNextProcessPeriod()
{
  var diffMonths = (new Date().getDate() < 28) ? 1 : 2;
  var processPeriod = Utilities.formatDate(new Date(new Date((new Date().setDate(1))).setMonth(new Date().getMonth() + diffMonths)), 'America/Buenos_Aires', 'yyyyMM');
  return processPeriod;
}

/***********************************************************************************************************************************/
/***********************************************************************************************************************************/




