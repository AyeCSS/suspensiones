// CONFIG LOG
var logCount = 0; 
var logMsg = '';
var warningCount = 0; 
var warningMsg = '';
var errorCount = 0;
var errorMsg = '';
var report_result = ''; // 'EXITOSO'| 'CON ERRORES'| 'FALLÓ'
var report_detail = '';

/*********************************************************************************************/
/**
 * Registra un mensaje de error y actualiza el contador de errores.
 * 
 * @param {string} mensaje - El mensaje de error.
 * @param {string} resultado - El resultado del proceso.
 * @param {string} detalle - El detalle del proceso.
 */
function logError(mensaje, resultado, detalle) 
{
  console.log(mensaje);
  errorMsg += mensaje + ' | ';
  errorCount++;
  setReportResult(resultado);
  setReportDetail(detalle);
}

/*********************************************************************************************/
/**
 * Registra un mensaje de advertencia y actualiza el contador de advertencias.
 * 
 * @param {string} mensaje - El mensaje de advertencia.
 */
function logWarning(mensaje) 
{
  console.log(mensaje);
  warningMsg += mensaje + ' | ';
  warningCount++;
}

/*********************************************************************************************/
/**
 * Registra un mensaje de información y actualiza el contador de mensajes de log.
 * 
 * @param {string} mensaje - El mensaje de información.
 */
function logInfo(mensaje) 
{
  console.log(mensaje);
  logMsg += mensaje + ' | ';
  logCount++;
}

/*********************************************************************************************/
/**
 * Establece el detalle del informe.
 * 
 * @param {string} detalle - El detalle del informe.
 */
function setReportDetail(detalle = '')
{
  if (detalle != '' )
    report_detail = detalle;
}

/*********************************************************************************************/
/**
 * Establece el resultado del informe.
 * 
 * @param {string} resultado - El resultado del informe.
 */
function setReportResult(resultado = '')
{
  if (resultado != '' )
    report_result = resultado;
}

/*********************************************************************************************/
/**
 * Envía un informe por correo electrónico.
 * 
 * @param {string} email - La dirección de correo electrónico del destinatario.
 * @param {string} subject - El asunto del correo electrónico.
 */
function sendEmailReport(email, subject)
{
  report_result = (report_result == '')? 'EXITOSO' : report_result;
  subject = subject + ' ' + report_result;
  var today = LanguageApp.translate( Utilities.formatDate(new Date(), 'America/Buenos_Aires', 'MMMM dd, yyyy HH:mm'), 'en', 'es');
  logMsg = '<dd>'+(logMsg.replaceAll(' | ','</dd><dd>'))+'</dd>' ; 
  warningMsg = '<dd>'+(warningMsg.replaceAll(' | ','</dd><dd>'))+'</dd>' ; 
  errorMsg = '<dd>'+(errorMsg.replaceAll(' | ','</dd><dd>'))+'</dd>' ; 
  
  var content = '<!DOCTYPE html><html><head><base target="_top"></head><body><br />Información del proceso: <br /><br />'; 
  content += '<div style="padding-left: 50px;"><dl>'; 
  content += '<dt><strong>Resultado</strong>: ' + report_result + '</dt><br />'; 
  content += (report_detail != '')? '<dt><strong>Detalle</strong>: '+report_detail+'</dt><br />' : ''; 
  content += (logCount > 0)? '<dt><strong>Mensajes de LOG</strong>: ' + logMsg + '</dt><br />' : ''; 
  content += (warningCount > 0)? '<dt><strong>Mensajes de ADVERTENCIA ('+warningCount+')</strong>: ' + warningMsg + '</dt><br />' : ''; 
  content += (errorCount > 0)? '<dt><strong>Mensajes de ERROR ('+errorCount+')</strong>: ' + errorMsg + '</dt><br />' : ''; 
  content += '</dl><br /></div>Fecha: ' + today + '.<br /></body></html>'; 
  console.log('Send email process report: ' + content);
  MailApp.sendEmail({to: email, subject: subject, htmlBody: content});
}

/*********************************************************************************************/

function resetAllLogs()
{
  logCount = 0; 
  logMsg = '';
  warningCount = 0; 
  warningMsg = '';
  errorCount = 0;
  errorMsg = '';
  report_result = ''; 
  report_detail = '';
}

