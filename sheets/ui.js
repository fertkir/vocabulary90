function onOpen() {
  const locale = Session.getActiveUserLocale();
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem(i18n("addNewVocabularySheet", locale), "addNewSheetPrompt")
    .addItem(i18n("sendEmails", locale), "sendEmailsAlert")
    .addItem(i18n("getFormUrl", locale), "getForm")
    .addSeparator()
    .addItem(i18n("settings", locale), "openSettings")
    .addToUi();
}

function getSchedulerSettings() {
  const locale = Session.getActiveUserLocale();
  const props = PropertiesService.getUserProperties();
  const enabledFor = props.getProperty('scheduler_enabled_for');
  return {
    "enabled": (enabledFor != null && enabledFor == SpreadsheetApp.getActiveSpreadsheet().getId()),
    "time": props.getProperty('scheduler_time') || '00:00',
    "schema_daily": (props.getProperty('schema_daily') != 'false'),
    "schema_1_week": (props.getProperty('schema_1_week') != 'false'),
    "schema_2_weeks": (props.getProperty('schema_2_weeks') != 'false'),
    "schema_1_month": (props.getProperty('schema_1_month') != 'false'),
    "schema_2_months": (props.getProperty('schema_2_months') != 'false'),
    "customDictionaryUrlInTheEnd": (props.getProperty('custom_dictionary_url_in_the_end') == 'true'),
    "requireReadConfirmation": (props.getProperty('require_read_confirmation') == 'true'),
    "maxSentencesToBeSent": (Number(props.getProperty('max_sentences_to_be_sent') || -1)),
    "i18n": {
      "sendOnSchedule": i18n("sidebarSendOnSchedule", locale),
      "sendTime": i18n("sidebarSendTime", locale),
      "schema": i18n("sidebarSchema", locale),
      "schemaDaily": i18n("sidebarSchemaDaily", locale),
      "schema1Week": i18n("sidebarSchema1Week", locale),
      "schema2Weeks": i18n("sidebarSchema2Weeks", locale),
      "schema1Month": i18n("sidebarSchema1Month", locale),
      "schema2Months": i18n("sidebarSchema2Months", locale),
      "save": i18n("sidebarSave", locale),
      "saved": i18n("sidebarSaved", locale),
      "otherSettings": i18n("sidebarOtherSettings", locale),
      "customDictionaryUrlInTheEnd": i18n("sidebarCustomDictionaryUrlInTheEnd", locale),
      "requireReadConfirmation": i18n("requireReadConfirmation", locale),
      "limitAmountOfSentencesToSend": i18n("limitAmountOfSentencesToSend", locale)
    }
  };
}

function openSettings() {
  const locale = Session.getActiveUserLocale();
  const htmlOutput = HtmlService
      .createHtmlOutputFromFile('sidebar.html')
      .setTitle(i18n("settings", locale))
      .setWidth(500);
  SpreadsheetApp.getUi()
      .showSidebar(htmlOutput);
}

function save(settings) {
  removeTrigger_();
  const props = PropertiesService.getUserProperties();
  if (settings.enabled) {
    const hour = Number(settings.sendTime.split(":")[0]);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ScriptApp.newTrigger("sendEmailsFromScheduler")
      .timeBased()
      .atHour(hour)
      .everyDays(1)
      .inTimezone(ss.getSpreadsheetTimeZone())
      .create();
    props.setProperty('scheduler_enabled_for', ss.getId());
  } else {
    props.deleteProperty('scheduler_enabled_for');
  }
  props.setProperty('scheduler_time', settings.sendTime);
  props.setProperty('schema_daily', settings.schema_daily);
  props.setProperty('schema_1_week', settings.schema_1_week);
  props.setProperty('schema_2_weeks', settings.schema_2_weeks);
  props.setProperty('schema_1_month', settings.schema_1_month);
  props.setProperty('schema_2_months', settings.schema_2_months);
  props.setProperty('custom_dictionary_url_in_the_end', settings.customDictionaryUrlInTheEnd);
  props.setProperty('require_read_confirmation', settings.requireReadConfirmation);
  if (settings.maxSentencesToBeSent == -1) {
    props.deleteProperty('max_sentences_to_be_sent');
  } else {
    props.setProperty('max_sentences_to_be_sent', settings.maxSentencesToBeSent);
  }
}

function removeTrigger_() {
  for (var trigger of ScriptApp.getProjectTriggers()) {
    if (trigger.getHandlerFunction() == 'sendEmailsFromScheduler') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function sendEmailsAlert() {
  const locale = Session.getActiveUserLocale();
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(i18n("sendEmailsAlert", locale), ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    var result = sendEmailsFromUi();
    if (result.sent == false) {
      ui.alert(result.message);
    }
  }
}

function undoTodaysReminderSendAlert() {
  const locale = Session.getActiveUserLocale();
  const ui = SpreadsheetApp.getUi();
  const activeSheetName = SpreadsheetApp.getActiveSheet().getName();
  const response = ui.alert(Utilities.formatString(i18n("undoTodaySendAlert", locale), activeSheetName), ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    undoTodaysReminderSend();
  }
}

function addNewSheetPrompt() {
  const locale = Session.getActiveUserLocale();
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(i18n("addNewVocabularyPromptTitle", locale), i18n("addNewVocabularyPromptText", locale), ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.OK) {
    addNewVocabularySheet_(response.getResponseText());
  }
}

function addNewVocabularySheet_(sheetName) {
  const locale = Session.getActiveUserLocale();
  SpreadsheetApp.getActiveSpreadsheet()
    .insertSheet(sheetName);
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(1, 1).setRichTextValue(bold_(i18n("sentence", locale)));
  sheet.getRange(1, 2).setRichTextValue(bold_(i18n("sentTimes", locale)));
  sheet.getRange(1, 3).setRichTextValue(bold_(i18n("lastSentDate", locale)));
  sheet.getRange(1, 4).setRichTextValue(bold_(i18n("url", locale)));
  var dictionaryLink = DICTIONARY_LINKS[sheetName.toLowerCase()];
  if (dictionaryLink) {
    sheet.getRange(1, 4).setNote(dictionaryLink);
  }
  sheet.setColumnWidth(1, 550);
  sheet.setFrozenRows(1);
  SpreadsheetApp.flush();
}

function bold_(text) {
  const bold = SpreadsheetApp.newTextStyle().setBold(true).build();
  return SpreadsheetApp.newRichTextValue().setText(text).setTextStyle(bold).build();
}