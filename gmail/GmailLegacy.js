// The code below is used for backward compatibility

function createCardLegacy(spreadSheetId, sheetName, locale) {
  const sheet = getSheet_(spreadSheetId, sheetName);
  return CardService.newCardBuilder()
      .addSection(CardService.newCardSection()
        .addWidget(CardService.newButtonSet()
          .addButton(CardService.newTextButton()
            .setText(isRead_(sheet) ? i18n('markAsUnread', locale) : i18n('markAsRead', locale))
            .setOnClickAction(CardService.newAction()
              .setFunctionName('onToggleRead')
              .setParameters({spreadSheetId: spreadSheetId, sheetName: sheetName}))
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor(isRead_(sheet) ? '#808080' : '#008000'))))
      .build();
}

function onToggleRead(e) {
  const spreadSheetId = e.parameters.spreadSheetId;
  const sheetName = e.parameters.sheetName;
  const sheet = getSheet_(spreadSheetId, sheetName);
  toggleRead_(sheet);
  const locale = toLocale_(e.userLocale);
  
  const card = createCardLegacy(spreadSheetId, sheetName, locale);
  return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation()
          .updateCard(card))
      .build();
}

function isRead_(sheet) {
  return sheet.getRange(1, 3).getNote() != 'unread';
}

function toggleRead_(sheet) {
  return isRead_(sheet) 
    ? sheet.getRange(1, 3).setNote('unread') 
    : sheet.getRange(1, 3).setNote('')
}

function getSheet_(spreadSheetId, sheetName) {
  const spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  return spreadSheet.getSheetByName(sheetName);
}

function toLocale_(userLocale) {
  return userLocale.substring(0, 2); // e.g. from en-US to en
}