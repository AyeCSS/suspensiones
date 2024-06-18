/*********************************************************************************************/
/**
 * Obtiene archivos de una carpeta según un patrón de nombre.
 * 
 * @param {string} folderId - El ID de la carpeta de Google Drive.
 * @param {string} patternFile - El patrón de nombre de archivo a buscar.
 * @param {Array} filesArray - El array donde se almacenarán los archivos encontrados.
 * @param {string} type - El tipo de archivo.
 * @param {string} folderBackupId - El ID de la carpeta de respaldo.
 * @return {number} El número de archivos obtenidos.
 */
function obtenerArchivos(folderId, patternFile, filesArray, type, folderBackupId) 
{
  var count = 0;
  var folderFiles = DriveApp.getFolderById(folderId).getFiles();

  while (folderFiles.hasNext())  // Get array fon any file on Google Drive Folder
  {
    try
    {
      var file = folderFiles.next();
      if (file.getName().match(patternFile))  // CHEQUEO DE PATRON DE NOMBRE DE ARCHIVO
      {
        filesArray.push({"type": type, "id": file.getId(), "name": file.getName() });
        count++;
      }
    }
    catch
    {
      console.log('Fallo en la toma del archivo: '+file.getName()+'.');
    }
  }
  console.log('Directorio id: '+folderId+' con '+count+' archivos obtenidos.');
  return count;
}

/*********************************************************************************************/
/**
 * Convierte archivos XLSX a Google Sheets.
 * 
 * @param {string} folderId - El ID de la carpeta de Google Drive.
 * @param {string} folderBackupId - El ID de la carpeta de respaldo.
 */
function convertirXlsxAGoogleSheet(folderId, folderBackupId) 
{
  var folder = DriveApp.getFolderById(folderId);
  var arrFiles = folder.getFilesByType(MimeType.MICROSOFT_EXCEL);  // ONLY EXCELS FILES
  while (arrFiles.hasNext()) // FOR EACH EXCEL FILE
  {
    var file = arrFiles.next();
    var config = {
      title: file.getName().replace(".xlsx", ""),
      parents: [{id: file.getParents().next().getId()}],
      mimeType: MimeType.GOOGLE_SHEETS
    };
    var spreadsheet = Drive.Files.insert(config, file.getBlob(), { convert: true, supportsAllDrives: true }); // CREATE FILE
    if (spreadsheet.id) // Re-check if file destination exist
      moveFile(file.getId(), folderBackupId); // MOVER ARCHIVO ORIGINAL
  }
}

/*********************************************************************************************/
/**
 * Mueve un archivo a una carpeta específica.
 * 
 * @param {string} sourceFileId - El ID del archivo a mover.
 * @param {string} targetFolderId - El ID de la carpeta destino.
 */
function moveFile(sourceFileId, targetFolderId) 
{
  var file = DriveApp.getFileById(sourceFileId);
  var folder = DriveApp.getFolderById(targetFolderId);
  file.moveTo(folder);
}

/*********************************************************************************************/
/**
 * Mueve todos los archivos de una carpeta a otra.
 * 
 * @param {string} folderId - El ID de la carpeta de Google Drive.
 * @param {string} folderBackupId - El ID de la carpeta de respaldo.
 */
function moveFiles(folderId, folderBackupId)
{
  var folderFiles = DriveApp.getFolderById(folderId).getFilesByType(MimeType.GOOGLE_SHEETS); // Get files on Google Drive Folder
  var file = null;
  while (folderFiles.hasNext())  // Get array fon any file on Google Drive Folder
  {
    try
    {
      file = folderFiles.next();
      moveFile(file.getId(), folderBackupId);
    }
    catch
    {
      console.log('Fallo en la toma del archivo: '+file.getName()+'.');
    }
  }
}

/*********************************************************************************************/
/**
 * Mueve un archivo a una carpeta de respaldo y luego a otra carpeta destino.
 * 
 * @param {string} sourceFileId - El ID del archivo a mover.
 * @param {string} fileName - El nombre del archivo.
 * @param {string} targetFolderId - El ID de la carpeta destino.
 */
function moveFileWithBackup(sourceFileId, fileName, targetFolderId) 
{
  var file = DriveApp.getFileById(sourceFileId);
  var folder = DriveApp.getFolderById(targetFolderId);

  // MOVE FILES WITH SAME NAME TO SUB-FOLDER CALLED "Backup"
  var folderBackup = getSubFolderByName(folder,"Backup");
  var oldFiles = folder.getFilesByName(fileName);
  while (oldFiles.hasNext()) 
  {
    oldFiles.next().moveTo(folderBackup);
  }
  file.moveTo(folder);
}

/*********************************************************************************************/
/**
 * Obtiene una subcarpeta por nombre o la crea si no existe.
 * 
 * @param {GoogleAppsScript.Drive.Folder} folder - La carpeta principal.
 * @param {string} subFolderName - El nombre de la subcarpeta.
 * @return {GoogleAppsScript.Drive.Folder} La subcarpeta obtenida o creada.
 */
function getSubFolderByName(folder, subFolderName) 
{
  var carpetas = folder.getFoldersByName(subFolderName);
  return (carpetas.hasNext())? carpetas.next() : folder.createFolder(subFolderName);
}

/*********************************************************************************************/
/**
 * Crea una copia de un archivo a partir de una plantilla.
 * 
 * @param {string} templateId - El ID de la plantilla.
 * @param {string} fileName - El nombre del nuevo archivo.
 * @return {string | null} El ID del nuevo archivo o null si hay un error.
 */
function createCopyFromTemplate(templateId, fileName) 
{
  try 
  {
    return DriveApp.getFileById(templateId).makeCopy(fileName).getId();
  } 
  catch (e) 
  {
    console.log(e.message);
    return null;
  }
}

/*********************************************************************************************/


