const FORM_ID = "formId";
const FORM_URL = "formUrl";
const FORM_TRIGGER_ID = "formTriggerId";

function getForm() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const formUrl = findExistingForm_(sheet) || createForm_(sheet);
  showPromptWithFormUrl_(formUrl);
}

// for testing purposes
function clearData_() {
  for (var trigger of ScriptApp.getProjectTriggers()) {
    if (trigger.getHandlerFunction() == 'saveFormToSheet') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheets()
    .forEach(sheet => sheet
        .getDeveloperMetadata()
        .forEach(meta => meta.remove()));
}

function findExistingForm_(sheet) {
  const metadata = sheet.getDeveloperMetadata();
  const formId = metadata.find(meta => meta.getKey() === FORM_ID);
  const formUrl = metadata.find(meta => meta.getKey() === FORM_URL);
  const formTriggerId = metadata.find(meta => meta.getKey() === FORM_TRIGGER_ID);
  if (typeof formId === "undefined") {
    return undefined;
  } else {
    if (formIsAlive_(formId.getValue())) {
      return formUrl.getValue();
    } else {
      // removing dead form data
      removeTrigger_(formTriggerId);
      formTriggerId.remove();
      formId.remove();
      formUrl.remove();
      return undefined;
    }
  }
}

function formIsAlive_(formId) {
    try {
      const form = FormApp.openById(formId);
      // todo the commented code below returns true if the form is in Trash
      // return form.isAcceptingResponses();
      return true;
    } catch (e) {
      return false;
    }
}

function removeTrigger_(triggerId) {
  for (var trigger of ScriptApp.getProjectTriggers()) {
    if (trigger.getUniqueId() == triggerId) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function createForm_(sheet) {
  const sheetName = sheet.getSheetName();
  const form = FormApp.create('Vocabulary 90 - ' + sheetName);
  form.addParagraphTextItem().setTitle('Sentence').setHelpText(sheetName).setRequired(true);
  form.addParagraphTextItem().setTitle('URL');

  const formId = form.getId();
  const formUrl = form.shortenFormUrl(form.getPublishedUrl());

  const formTriggerId = ScriptApp
    .newTrigger("saveFormToSheet")
    .forForm(form)
    .onFormSubmit()
    .create()
    .getUniqueId();
  
  sheet.addDeveloperMetadata(FORM_ID, formId, SpreadsheetApp.DeveloperMetadataVisibility.PROJECT);
  sheet.addDeveloperMetadata(FORM_URL, formUrl, SpreadsheetApp.DeveloperMetadataVisibility.PROJECT);
  sheet.addDeveloperMetadata(FORM_TRIGGER_ID, formTriggerId, SpreadsheetApp.DeveloperMetadataVisibility.PROJECT);

  return formUrl;
}

function showPromptWithFormUrl_(formUrl) {
  const ui = SpreadsheetApp.getUi();
  const locale = Session.getActiveUserLocale();
  ui.alert(i18n("formUrlTitle", locale), i18n("formUrlText", locale) + "\n\n" + formUrl, ui.ButtonSet.OK);
}

function saveFormToSheet(e) {
  const responses = e.response.getItemResponses();
  
  const language = responses[0].getItem().getHelpText()
  const sentence = responses[0].getResponse();
  const url = responses[1].getResponse();

  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(language)
    .appendRow([sentence, "", "", url]);
}