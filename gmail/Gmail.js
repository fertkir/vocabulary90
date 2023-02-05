function onHomepage(e) {
  const locale = toLocale_(e.userLocale);
  return createWelcomeCard_(locale);
}

function onGmailMessage(e) {
  const messageId = e.gmail.messageId;
  const accessToken = e.gmail.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);

  const message = GmailApp.getMessageById(messageId);
  const locale = toLocale_(e.userLocale);
  
  if (!isVocabulary90Message_(message)) {
      return createWelcomeCard_(locale);
  }
  
  const {spreadSheetId, sheetName, sentencesCount, maxSentTimes} = parseSpreadSheetMeta_(message.getBody());
  
  return sentencesCount != null 
      ? createCard_(spreadSheetId, sheetName, sentencesCount, maxSentTimes, locale)
      : createCardLegacy(spreadSheetId, sheetName, locale);
}

function createWelcomeCard_(locale) {
  return CardService.newCardBuilder()
      .addSection(CardService.newCardSection()
//          .addWidget(CardService.newImage()
//              .setImageUrl("https://raw.githubusercontent.com/fertkir/vocabulary90/main/logos/logo-with-caption2.png"))
          .addWidget(CardService.newTextParagraph()
              .setText(i18n("openVocabulary90Email", locale))))
     .setFixedFooter(CardService.newFixedFooter()
         .setPrimaryButton(CardService.newTextButton()
             .setText(i18n("extensionWebsite", locale))
             .setOpenLink(CardService.newOpenLink()
                 .setUrl('https://github.com/fertkir/vocabulary90'))))
      .build();
}

function toLocale_(userLocale) {
  return userLocale.substring(0, 2); // e.g. from en-US to en
}

function isVocabulary90Message_(message) {
  return (message.getFrom() == Session.getActiveUser().getEmail()) && (message.getBody().indexOf('<div id="spreadSheetId"') != -1);
}

function parseSpreadSheetMeta_(messageBody) {
  const spreadSheetIdStart = messageBody.indexOf('>', messageBody.indexOf('<div id="spreadSheetId"')) + 1;
  const spreadSheetIdEnd = messageBody.indexOf('</div>', spreadSheetIdStart);
  const sheetNameStart = messageBody.indexOf('>', messageBody.indexOf('<div id="sheetName"', spreadSheetIdEnd)) + 1;
  const sheetNameEnd = messageBody.indexOf('</div>', sheetNameStart);
  const sentencesCountTagIndex = messageBody.indexOf('<div id="sentencesCount"', sheetNameEnd);
  const sentencesCountStart = sentencesCountTagIndex == -1 ? null : messageBody.indexOf('>', sentencesCountTagIndex) + 1;
  const sentencesCountEnd = sentencesCountTagIndex == -1 ? null : messageBody.indexOf('</div>', sentencesCountStart);
  const maxSentTimesTagIndex = messageBody.indexOf('<div id="maxSentTimes"', sheetNameEnd);
  const maxSentTimesStart = maxSentTimesTagIndex == -1 ? null : messageBody.indexOf('>', maxSentTimesTagIndex) + 1;
  const maxSentTimesEnd = maxSentTimesTagIndex == -1 ? null : messageBody.indexOf('</div>', maxSentTimesStart);
  
  return {
    spreadSheetId: messageBody.substring(spreadSheetIdStart, spreadSheetIdEnd),
    sheetName: messageBody.substring(sheetNameStart, sheetNameEnd),
    sentencesCount: sentencesCountTagIndex == -1 ? null : messageBody.substring(sentencesCountStart, sentencesCountEnd),
    maxSentTimes: maxSentTimesTagIndex == -1 ? "0" : messageBody.substring(maxSentTimesStart, maxSentTimesEnd)
  };
}

function createCard_(spreadSheetId, sheetName, sentencesCount, maxSentTimes, locale) {
  const sheet = getSheet_(spreadSheetId, sheetName);
  const readCount = getReadCount_(sheet);
  return CardService.newCardBuilder()
      .addSection(CardService.newCardSection()
        .addWidget(CardService.newTextInput()
          .setFieldName("readCount")
          .setTitle(i18n("readUpTo", locale))
          .setHint(i18n("lastReadSentenceIndex", locale))
          .setOnChangeAction(CardService.newAction()
            .setFunctionName('onMarkRead')
            .setLoadIndicator(CardService.LoadIndicator.SPINNER)
            .setParameters({
              spreadSheetId: spreadSheetId, 
              sheetName: sheetName, 
              sentencesCount: sentencesCount, 
              maxSentTimes: maxSentTimes, 
              markAll: 'false'
            }))
          .setValue(readCount))
        .addWidget(CardService.newTextButton()
          .setText(i18n("markAllRead", locale))
          .setDisabled(readCount == sentencesCount)
          .setOnClickAction(CardService.newAction()
            .setFunctionName('onMarkRead')
            .setParameters({
              spreadSheetId: spreadSheetId, 
              sheetName: sheetName, 
              sentencesCount: sentencesCount, 
              maxSentTimes: maxSentTimes, 
              markAll: 'true'
            }))
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)))
      .build();
}

function getReadCount_(sheet) {
  const note = sheet.getRange(1, 3).getNote();
  const stringValue = note.indexOf(READ_COUNT_PREFIX) < 0 ? '' : note.substring(READ_COUNT_PREFIX.length);
  const value = parseInt(stringValue);
  return isNaN(value) ? '0' : value.toString();
}

function onMarkRead(e) {
  const spreadSheetId = e.parameters.spreadSheetId;
  const sheetName = e.parameters.sheetName;
  const sentencesCount = e.parameters.sentencesCount;
  const maxSentTimes = e.parameters.maxSentTimes;
  const markAll = e.parameters.markAll;
  const readCount = markAll == 'true' ? sentencesCount : limitReadCountInputValue_(e.formInput.readCount, sentencesCount);
  if (readCount >= 0) {
    const sheet = getSheet_(spreadSheetId, sheetName);
    sheet.getRange(1, 3).setNote(READ_COUNT_PREFIX + readCount);
  }
  const locale = toLocale_(e.userLocale);
  const navigation = CardService.newNavigation()
    .updateCard(createCard_(spreadSheetId, sheetName, sentencesCount, maxSentTimes, locale));
  const shouldRemindRateTheApp = PropertiesService.getUserProperties()
    .getProperty('do_not_remind_to_rate_the_app') != 'true';
  if (shouldRemindRateTheApp && Number(maxSentTimes) > 3) {
    navigation.pushCard(createRateAppCard_(locale))
  }
  return CardService.newActionResponseBuilder()
      .setNavigation(navigation)
      .setNotification(CardService.newNotification()
        .setText(readCount >= 0 ? Utilities.formatString(i18n("markedSentences", locale), readCount) : i18n("couldNotUpdateReadSentencesCount", locale)))
      .build();
}

function createRateAppCard_(locale) {
  return CardService.newCardBuilder()
      .addSection(CardService.newCardSection()
        .addWidget(CardService.newTextParagraph()
          .setText(i18n("rateHeader", locale)))
        .addWidget(CardService.newTextParagraph()
          .setText(i18n("rateLine1", locale)))
        .addWidget(CardService.newTextParagraph()
          .setText(i18n("rateLine2", locale))))
      .addSection(CardService.newCardSection()
        .addWidget(CardService.newButtonSet()
          .addButton(CardService.newTextButton()
            .setText(i18n("rateNowButton", locale))
            .setOnClickAction(CardService.newAction()
              .setFunctionName('onRateButtonClicked')
              .setParameters({openLink: 'true', remindLater: 'false'}))
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor("#008000"))
          .addButton(CardService.newTextButton()
            .setText(i18n("rateLaterButton", locale))
            .setOnClickAction(CardService.newAction()
              .setFunctionName('onRateButtonClicked')
              .setParameters({openLink: 'false', remindLater: 'true'}))
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor("#808080"))
          .addButton(CardService.newTextButton()
            .setText(i18n("rateNotButton", locale))
            .setOnClickAction(CardService.newAction()
              .setFunctionName('onRateButtonClicked')
              .setParameters({openLink: 'false', remindLater: 'false'})))))
      .build();
}

function onRateButtonClicked(e) {
  const locale = toLocale_(e.userLocale);
  const openLink = e.parameters.openLink == 'true';
  const remindLater = e.parameters.remindLater == 'true';
  if (!remindLater) {
    PropertiesService.getUserProperties()
      .setProperty('do_not_remind_to_rate_the_app', 'true');
  }
  const responseBuilder = CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().popCard());
  if (openLink) {
    responseBuilder
      .setOpenLink(CardService.newOpenLink()
        .setUrl(i18n("appMarketplaceUrl", locale)))
      .setNotification(CardService.newNotification().setText(i18n("rateThanks", locale)));
  }
  return responseBuilder.build();
}

function limitReadCountInputValue_(readCount, sentencesCount) {
  const readCountInt = parseInt(readCount);
  if (isNaN(readCountInt)) return -1;
  if (readCountInt > sentencesCount) return sentencesCount;
  return readCountInt.toString();
}

function getSheet_(spreadSheetId, sheetName) {
  const spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  return spreadSheet.getSheetByName(sheetName);
}

const READ_COUNT_PREFIX = 'read up to '