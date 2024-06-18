/*********************************************************************************************/
/**
 * Obtiene los parámetros desde una hoja de configuración.
 * 
 * @return {Array} Un array de parámetros.
 */
function obtenerParametros(paramsSheetFileId, params) 
{
  var arrayParams = [];
  var sheetFile = obtenerSheetFile(paramsSheetFileId);
  params.forEach(function(value) {
     arrayParams[value] = obtenerDatosHoja(sheetFile,value); 
  });
  return arrayParams;
}

/*********************************************************************************************/
/**
 * Obtiene un parámetro específico del conjunto de parámetros.
 * 
 * @param {Array} arrParams - El conjunto de parámetros.
 * @param {string} tipo - El tipo de parámetro.
 * @param {string} nombre - El nombre del parámetro.
 * @return {any} El valor del parámetro.
 */
function obtenerParametro(arrParams, tipo, nombre)
{
  var buscar = String(nombre).trim().toUpperCase();
  var params = arrParams[tipo];
  var parametro = params.find( (element) => String(element[0]).trim().toUpperCase() == buscar);
  var valor = (parametro)? parametro[1] : 0;
  return valor;
}

/*********************************************************************************************/
/**
 * Obtiene los datos de una hoja específica en una hoja de configuración.
 * 
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheetFile - La hoja de configuración.
 * @param {string} sheetName - El nombre de la hoja de configuración.
 * @return {Array} Un array de datos.
 * @throws {Error} Si no se encuentran datos en la hoja de configuración.
 */
function obtenerDatosHoja(sheetFile, sheetName)
{
  try
  {
    var sheet = obtenerSheet(sheetFile, sheetName); 
    var rowsCount = sheet.getLastRow()-1;
    var data = sheet.getRange(2, 1, rowsCount, 2).getValues();
    if ((rowsCount > 0) && data)
      return data;
    else
      throw new Error('No se encontraron datos en la Hoja de parametros "' + sheetName + '" en el archivo de configuración.');  
  }
  catch
  {
    throw new Error('No se encontraron datos en la Hoja de parametros "' + sheetName + '" en el archivo de configuración.');
  }
}

/*********************************************************************************************/
/**
 * Obtiene una hoja de configuración a partir de su ID.
 * 
 * @param {string} fileId - El ID del archivo de configuración.
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet} La hoja de configuración.
 * @throws {Error} Si no se encuentra el archivo de configuración o no es accesible.
 */
function obtenerSheetFile(fileId)
{
  try {
    return SpreadsheetApp.openById(fileId);
  } catch {
    throw new Error('No se encontró el archivo Google Sheet con id "' + fileId + '" o no se encuentra accesible.');
  }
}

/*********************************************************************************************/
/**
 * Obtiene una hoja específica del archivo de configuración.
 * 
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheetFile - La hoja de configuración.
 * @param {string} ordersSheetName - El nombre de la hoja a obtener.
 * @return {GoogleAppsScript.Spreadsheet.Sheet} La hoja solicitada.
 * @throws {Error} Si no se encuentra la hoja en el archivo.
 */
function obtenerSheet(sheetFile, ordersSheetName)
{
  try {
    return sheetFile.getSheetByName(ordersSheetName);
  } catch {
    throw new Error('No se encontró una Hoja con nombre "' + ordersSheetName + '" en el archivo.');
  }
}

/*********************************************************************************************/



