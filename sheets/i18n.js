function i18n(message, lang) {
  var locale = LOCALES_[lang];
  if (locale == null) {
    locale = LOCALES_["en"];
  }
  var value = locale[message];
  if (value == null) {
    value = LOCALES_["en"][message];
  }
  return value;
}

const LOCALES_ = {
  "en": {
    "addNewVocabularySheet": "Add new vocabulary sheet",
    "getFormUrl": "Get Google Form for current sheet",
    "formUrlTitle": "Google Form",
    "formUrlText": "Use the following form to add sentences to this sheet:",
    "sendEmails": "Send emails",
    "undoTodaySend": "Undo last sending for current sheet",
    "settings": "Settings",
    "sendEmailsAlert": "Are you sure you want to send vocabulary emails?",
    "undoTodaySendAlert": "Are you sure you want to undo today's sending for %s?",
    "addNewVocabularyPromptTitle": "New vocabulary sheet",
    "addNewVocabularyPromptText": "Please enter sheet name (e.g. English)",
    "sentence": "Sentence",
    "sentTimes": "Sent times",
    "lastSentDate": "Last sent date",
    "url": "URL",
    "sidebarSendOnSchedule": "Send on schedule",
    "sidebarSendTime": "At time:",
    "sidebarSchema": "Sending schema:",
    "sidebarSchemaDaily": "Daily, first 7 days",
    "sidebarSchema1Week": "After 1 week",
    "sidebarSchema2Weeks": "After 2 weeks",
    "sidebarSchema1Month": "After 1 month",
    "sidebarSchema2Months": "After 2 months",
    "sidebarSave": "Save",
    "sidebarSaved": "Settings saved.",
    "sidebarOtherSettings": "Other settings",
    "sidebarCustomDictionaryUrlInTheEnd": "Add custom dictionary URL to the end of the sentence",
    "sendingSchemaNotSet": "Sending schema is empty or not set. Please set up sending schema in add-on settings.",
    "requireReadConfirmation": 'Confirm reading from Gmail',
    "limitAmountOfSentencesToSend": "Limit amount of sentences to be sent to:"
  },
  "ru": {
    "addNewVocabularySheet": "Добавить новый лист со словами",
    "getFormUrl": "Получить Google Форму для текущего листа",
    "formUrlTitle": "Google Форма",
    "formUrlText": "Используйте следующую форму для добавления предложений на данный лист:",
    "sendEmails": "Отправить слова на email",
    "undoTodaySend": "Отменить последнюю отправку для текущего листа",
    "settings": "Настройки",
    "sendEmailsAlert": "Вы уверены, что хотите отправить слова на email?",
    "undoTodaySendAlert": "Вы уверены, что хотите отменить сегодняшнюю отправку для листа %s?",
    "addNewVocabularyPromptTitle": "Новый словарный лист",
    "addNewVocabularyPromptText": "Введите название листа (например, English)",
    "sentence": "Предложение",
    "sentTimes": "Отправлено раз",
    "lastSentDate": "Дата последней отправки",
    "url": "URL",
    "sidebarSendOnSchedule": "Отправлять по расписанию",
    "sidebarSendTime": "Время:",
    "sidebarSchema": "Схема отправки:",
    "sidebarSchemaDaily": "Ежедневно, в течение 7 дней",
    "sidebarSchema1Week": "Через 1 неделю",
    "sidebarSchema2Weeks": "Через 2 недели",
    "sidebarSchema1Month": "Через 1 месяц",
    "sidebarSchema2Months": "Через 2 месяца",
    "sidebarSave": "Сохранить",
    "sidebarSaved": "Настройки сохранены.",
    "sidebarOtherSettings": "Прочие настройки",
    "sidebarCustomDictionaryUrlInTheEnd": "Добавлять ссылку на словарь в конец предложения",
    "sendingSchemaNotSet": "Схема отправки пуста или не настроена. Необходимо настроить схему отправки в настройках плагина.",
    "requireReadConfirmation": 'Подтверждать прочтение из Gmail',
    "limitAmountOfSentencesToSend": "Ограничить кол-во отправляемых предложений до:"
  }
}