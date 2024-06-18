// VARIABLES GLOBALES DE AMBIENTE 
const scriptProperties = PropertiesService.getScriptProperties();  // "Configuración del Proyecto" / "Propiedades de secuencia de comandos"
const paramsSheetFileId = scriptProperties.getProperty('paramsSheetFileId');

if ( !paramsSheetFileId ) throw 'Se requieren configurar correctamente las siguientes Properties de Script: "paramsSheetFileId". (incluir en "Configuración del Proyecto" / "Propiedades de secuencia de comandos")';

/***********************************************************************************************************************************/
/***********************************************************************************************************************************/

function main_all()
{
  //importFiles();

  //checkAndAwaitBigQueryJobs('aut-proyectosuspenciones');

  insertData();

  checkAndAwaitBigQueryJobs('aut-proyectosuspenciones'); 
  
  processData();
}

/***********************************************************************************************************************************/

function main_imports() 
{
  importFiles(); // Para la prueba habría que suspenderlo para que lo pase Vir y comparar con las mismas bases.
}

/***********************************************************************************************************************************/

function main_inserts() 
{
  insertData();
}

/***********************************************************************************************************************************/

function main_process() 
{
  processData();
}

/***********************************************************************************************************************************/
/***********************************************************************************************************************************/

const doGet = (event = {}) => 
{
  console.log("Llamada externa de ejecución");
  const { parameter } = event;

  var retorno = getProcessPeriod();

  console.log("Retorno de llamada: "+retorno);
  var salida = retorno; // "[" + retorno + "]";
  const output = `${salida}`;
  return ContentService.createTextOutput(output);
};

/*
EJEMPLOS DE TEST EXTERNOS DE:
https://script.google.com/macros/s/.../exec
*/

/***********************************************************************************************************************************/
/***********************************************************************************************************************************/


