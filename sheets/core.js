const SHEET_START_ROW = 2;
const COLUMNS_COUNT = 4;
const COLUMN_INDEX_SENTENCE = 0;
const COLUMN_INDEX_SENT_TIMES = 1;
const COLUMN_INDEX_LAST_SENT_TIME = 2;
const COLUMN_INDEX_URL = 3;
const ONE_DAY_MILLISECONDS = 24*3600*1000;
const SCHEDULER_FLUCTUATION = 2*3600*1000; // 2 hours
const READ_COUNT_PREFIX = 'read up to ';

function sendEmailsFromUi() {
  const props = PropertiesService.getUserProperties();
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  return sendEmails_(props, spreadSheet);
}

function sendEmailsFromScheduler() {
  const props = PropertiesService.getUserProperties();
  const id = props.getProperty('scheduler_enabled_for');
  const spreadSheet = SpreadsheetApp.openById(id);
  return sendEmails_(props, spreadSheet);
}

function sendEmails_(props, spreadSheet) {
  const alertSchema = getAlertSchema_(props);
  if (alertSchema.length == 0) {
    return {
      sent: false,
      message: i18n("sendingSchemaNotSet", Session.getActiveUserLocale())
    };
  }
  const urlInTheEndOfSentence = props.getProperty('custom_dictionary_url_in_the_end') == 'true';
  const requireReadConfirmation = props.getProperty('require_read_confirmation') == 'true';
  const maxSentencesToBeSent = Number(props.getProperty('max_sentences_to_be_sent') || Number.POSITIVE_INFINITY);
  const sheets = spreadSheet.getSheets().filter(s => !s.isSheetHidden());
  for (var sheet of sheets) {
    handleSheet_(sheet, alertSchema, urlInTheEndOfSentence, requireReadConfirmation, maxSentencesToBeSent);
  }
  return {
    sent: true
  };
}

function getAlertSchema_(props) {
  const alertSchema = [];
  if (props.getProperty('schema_daily')) {
    alertSchema.push(1, 1, 1, 1, 1, 1, 1);
  }
  if (props.getProperty('schema_1_week')) {
    alertSchema.push(7);
  }
  if (props.getProperty('schema_2_weeks')) {
    alertSchema.push(14);
  }
  if (props.getProperty('schema_1_month')) {
    alertSchema.push(28);
  }
  if (props.getProperty('schema_2_months')) {
    alertSchema.push(56);
  }
  return alertSchema;
}

function handleSheet_(sheet, alertSchema, urlInTheEndOfSentence, requireReadConfirmation, maxSentencesToBeSent) {
  const defaultDictionaryUrl = getDefaultDictionaryUrl_(sheet);
  const dataRange = sheet.getDataRange();
  if (dataRange.getLastRow() < SHEET_START_ROW) {
    return;
  }
  if (requireReadConfirmation && sheet.getRange(1, 3).getNote() == 'unread') {
    // for backward compatibility
    return;
  }
  const rowsCount = dataRange.getLastRow() - SHEET_START_ROW + 1;
  const sheetRange = sheet.getRange(SHEET_START_ROW, 1, rowsCount, COLUMNS_COUNT);
  const richTextData = sheetRange.getRichTextValues();
  const plainData = sheetRange.getValues();
  const readCount = getReadCount_(sheet);
  const sentenceIndexes = sheet.getRange(SHEET_START_ROW, COLUMN_INDEX_LAST_SENT_TIME + 1, rowsCount).getNotes();
  var message = '<ol>';
  var externalLinkImageShouldBeAttached = false;
  var sentencesToBeSentCounter = 0;
  var maxSentTimes = 0;
  
  for (var i = 0; i < plainData.length; ++i) {
    if (sentencesToBeSentCounter >= maxSentencesToBeSent) {
      break;
    }
    const sentTimes = Number(plainData[i][COLUMN_INDEX_SENT_TIMES]);
    maxSentTimes = maxSentTimes > sentTimes ? maxSentTimes : sentTimes;
    var lastSentDate = plainData[i][COLUMN_INDEX_LAST_SENT_TIME];
    var sentence = richTextData[i][COLUMN_INDEX_SENTENCE];
    const dictionaryUrl = plainData[i][COLUMN_INDEX_URL];
    if (lastSentDate == '') {
      lastSentDate = new Date(0);
      sentence = replaceAsteriskWithBold_(sentence);
      sheet.getRange(SHEET_START_ROW + i, COLUMN_INDEX_SENTENCE + 1).setRichTextValue(sentence);
    }
    var isRead = true;
    if (requireReadConfirmation) {
      const sentenceIndex = parseInt(sentenceIndexes[i][0]);
      if (!isNaN(sentenceIndex) && sentenceIndex > readCount) {
        isRead = false;
      }
    }
    if (!isRead || shouldBeSent_(sentTimes, lastSentDate, alertSchema)) {
      const {html, externalLinksPresent} = toHtmlText_(sentence, dictionaryUrl, defaultDictionaryUrl, urlInTheEndOfSentence);
      message += html;
      externalLinkImageShouldBeAttached = externalLinkImageShouldBeAttached || externalLinksPresent;
      if (isRead) {
        sheet.getRange(SHEET_START_ROW + i, COLUMN_INDEX_SENT_TIMES + 1)
             .setValue(sentTimes + 1);
      }
      sheet.getRange(SHEET_START_ROW + i, COLUMN_INDEX_LAST_SENT_TIME + 1)
           .setValue(new Date())
           .setNumberFormat("yyyy-MM-dd")
           .setNote(++sentencesToBeSentCounter);
    } else {
      sheet.getRange(SHEET_START_ROW + i, COLUMN_INDEX_LAST_SENT_TIME + 1)
           .clearNote();
    }
  }
  message += '</ol>';
  message += createEmailMeta_(sheet, sentencesToBeSentCounter, maxSentTimes);
  
  if (sentencesToBeSentCounter > 0) {
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: `${sheet.getName()} - ${sheet.getParent().getName()}`,
      body: message,
      htmlBody: message,
      inlineImages: externalLinkImageShouldBeAttached ? { externalLinkIcon: getExternalLinkPngBlob_() } : {}
    });
    markNotRead_(sheet);
  }
}

function getReadCount_(sheet) {
  const note = sheet.getRange(1, 3).getNote();
  const stringValue = note.indexOf(READ_COUNT_PREFIX) < 0 ? '' : note.substring(READ_COUNT_PREFIX.length);
  const value = parseInt(stringValue);
  return isNaN(value) ? 0 : value;
}

function createEmailMeta_(sheet, sentencesCount, maxSentTimes) {
  return `<div id="spreadSheetId" style="display:none;">${sheet.getParent().getId()}</div>` 
  + `<div id="sheetName" style="display:none;">${sheet.getName()}</div>`
  + `<div id="sentencesCount" style="display:none;">${sentencesCount}</div>`
  + `<div id="maxSentTimes" style="display:none;">${maxSentTimes}</div>`;
}

function getExternalLinkPngBlob_() {
  return Utilities.newBlob(
    Utilities.base64Decode(
"iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAe1BMVEUAAAArVdUzZsw5Y8Y2ZMkzZswzZswyZs0zZsw2aM0zZsw0Zsw0Z800ZswzZsw0Z8w1aM05as06a85AcNBBcM9Fc9FchdaAoN+BoeCEo+CHpeGhueiku+iwxOu3ye27zO6/z+/J1vHV4PTm7Pnt8vv7/P79/v/+/v////8OA8YtAAAADnRSTlMABg8SIYyvsc3Q5Pz9/mHFF3MAAAABYktHRCi9sLWyAAAAW0lEQVQI12XOxxZAMBRF0egtiN5F1Pv/X0iECWf09uSuR8g3zYlkCla1A8cD3W0AxNcVUErZ+CDa5oJDtDuTWPMBIvVrTwJdybPQtI0b6JOJqqkLWLYXd8HvkxM3vgdSSgRXFAAAAABJRU5ErkJggg=="
    )
  )
  .setContentType(MimeType.PNG);
}

function getDefaultDictionaryUrl_(sheet) {
  return sheet.getRange(1, 4).getNote();
}

function markNotRead_(sheet) {
  sheet.getRange(1, 3).clearNote();
}

/**
 * Workaround to make words added with browser extension bold.
 */
function replaceAsteriskWithBold_(richTextValue) {
  if (richTextValue.getRuns().length > 1) {
    return richTextValue;
  }
  var text = richTextValue.getText();
  const boldPositions = [];
  while (text.indexOf('*') != -1) {
    boldPositions.push(text.indexOf('*'));
    text = text.replace('*', '');
  }
  const bold = SpreadsheetApp.newTextStyle().setBold(true).build();
  const result = SpreadsheetApp.newRichTextValue().setText(text);
  for (var i = 0; i < boldPositions.length; i = i + 2) {
    const start = boldPositions[i];
    const end = (i == boldPositions.length)
      ? text.length
      : boldPositions[i+1];
    if (start == end) {
      continue;
    }
    result.setTextStyle(start, end, bold);
  }
  return result.build();
}

function toHtmlText_(richTextValue, dictionaryUrl, defaultDictionaryUrl, urlInTheEndOfSentence) {
  if (dictionaryUrl != "") {
    dictionaryUrl = addAnchorToUrl_(dictionaryUrl, richTextValue.getText());
  }
  let html = '<li>';
  let externalLinksPresent = false;
  for (var value of richTextValue.getRuns()) {
    const style = value.getTextStyle();
    if (style.isBold()) {
      html += '<b>';
      if (dictionaryUrl != "" && !urlInTheEndOfSentence) {
        html += `<a style="color:black;text-decoration:none;" href="${dictionaryUrl}">`;
      } else if (defaultDictionaryUrl != "") {
        html += '<a style="color:black;text-decoration:none;" href="' + Utilities.formatString(defaultDictionaryUrl, value.getText()) + '">';
      }
    }
    html += value.getText();
    if (style.isBold()) {
      if (dictionaryUrl != "" || defaultDictionaryUrl != "") {
        html += '</a>';
      }
      html += '</b>';
    }
  }
  if (dictionaryUrl != "" && urlInTheEndOfSentence) {
    externalLinksPresent = true;
    html += `<a style="color:black;text-decoration:none;" href="${dictionaryUrl}"><img src="cid:externalLinkIcon"/></a>`;
  }
  html += '</li>';
  return {
    html: html,
    externalLinksPresent: externalLinksPresent
  };
}

function addAnchorToUrl_(url, text) {
  if (url.includes('#')) {
    return url;
  }
  const subsentence = text.substring(0, 60);
  const subsentenceWithCompleteWords = subsentence.substring(0, subsentence.lastIndexOf(" "));
  return url + "#:~:text=" + encodeURIComponent(subsentenceWithCompleteWords);
}

function shouldBeSent_(sentTimes, lastSentDate, alertSchema) {
  if (sentTimes >= alertSchema.length) {
    return false;
  }
  const daysOffset = alertSchema[sentTimes];
  const now = new Date().getTime();
  const timeSent = lastSentDate.getTime();
  const lastSentDaysAgo = Math.floor((now - timeSent + SCHEDULER_FLUCTUATION)/ONE_DAY_MILLISECONDS);
  return lastSentDaysAgo >= daysOffset;
}