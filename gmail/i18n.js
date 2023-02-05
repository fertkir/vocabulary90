function i18n(message, lang) {
  var locale = locales[lang];
  if (locale == null) {
    locale = locales["en"];
  }
  var value = locale[message];
  if (value == null) {
    value = locales["en"][message];
  }
  return value;
}

var locales = {
  "en": {
    "appMarketplaceUrl": "https://gsuite.google.com/u/0/marketplace/app/vocabulary_90/637385062408",
    "openVocabulary90Email": "Open an email from Vocabulary 90 to confirm that vocabulary list is read.",
    "extensionWebsite": "Extension\'s Website",
    "markAsRead": "Mark as read",
    "markAsUnread": "Mark as unread",
    "readUpTo": "Read up to",
    "lastReadSentenceIndex": "Index of the last sentence you've read",
    "markAllRead": "Mark all read",
    "couldNotUpdateReadSentencesCount": "Could not update read sentences count",
    "markedSentences": 'Marked %s sentences as read',
    "rateHeader": "<b>Enjoy the app?</b>",
    "rateLine1": "Please rate it on the marketplace and consider leaving a review (on <i>Reviews</i> tab).",
    "rateLine2": "This helps new users discover the app and the developer receive a feedback.",
    "rateNowButton": "Rate it now",
    "rateLaterButton": "Remind me later",
    "rateNotButton": "Do not remind",
    "rateThanks": "Thanks for rating the app!"
  },
  "ru": {
    "appMarketplaceUrl": "https://gsuite.google.com/u/0/marketplace/app/vocabulary_90/637385062408?hl=ru",
    "openVocabulary90Email": "Откройте письмо от Vocabulary 90, чтобы пометить список предложений прочитанным.",
    "extensionWebsite": "Вебсайт приложения",
    "markAsRead": "Прочитано",
    "markAsUnread": "Не прочитано",
    "readUpTo": "Прочитано до",
    "lastReadSentenceIndex": "Номер последнего прочитанного предложения",
    "markAllRead": "Прочитать все",
    "couldNotUpdateReadSentencesCount": "Не удалось обновить количество прочитанных предложений",
    "markedSentences": '%s предложений отмечено прочитанными',
    "rateHeader": "<b>Нравится приложение?</b>",
    "rateLine1": "Пожалуйста, оцените приложение и по возможности оставьте отзыв (на вкладке <i>Отзывы</i>).",
    "rateLine2": "Это поможет новым пользователям найти приложение, а разработчику - получить обратную связь.",
    "rateNowButton": "Оценить сейчас",
    "rateLaterButton": "Позже",
    "rateNotButton": "Не напоминать",
    "rateThanks": "Спасибо, что оценили приложение!"
  }
}