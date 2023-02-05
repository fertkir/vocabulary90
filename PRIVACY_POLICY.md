**Effective Date**  
March 21 2020

# Privacy Policy - Vocabulary 90 Add-on
This policy describes how Kirill Fertikov ("Developer") maintains your privacy when you use the Vocabulary 90 Add-on ("Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.

## Data Collection and Use
- The Service provides users with the ability to work more effectively with their documents and to automate some of their tasks.
- The Service does not collect, maintain or use personally identifiable information outside the user’s Google account.
- The Service is examined to meet Google’s guidelines for safeguarding user data, before it is publicly available. For more information, see https://developers.google.com/gsuite/add-ons/concepts/gsuite-addon-review.
- In order for the Service to function, it requires access to data (“Personal Data”) in your Google Spreadsheet, Google Drive or other services in your G-Suite domain.
- The Service only interacts with the Personal Data that you consent and approve.
- All the operations performed on Personal Data are carried out within and under the authority of your Google account.
- The Service doesn’t transmit Personal Data to the Developer or any third parties.
- Any calculations performed on your Personal Data by the Service cannot be accessed by the Developer.
- All intellectual property rights of your Personal Data are retained by you.
- For more information on the specific permissions the Service requires, see “Authorization Scopes” section of this policy.

## Authorization Scopes
Below are the permissions required by the Service and a description of how they are used:
- Send email as you
    - This permission is used to send you the list of sentences with vocabulary. The sender of the email will be you.
- See, edit, create, and delete your spreadsheets in Google Drive
    - The permission to see a spreadsheet is used to read the sentences with vocabulary in order to construct a list that will be sent to your email.
    - The permission to edit a spreadsheet is needed to update it with information about how many times each sentence was sent and when it was sent for the last time.
    - Permissions to create and delete spreadsheets are not used, but Google’s OAuth API provides them alongside the edit permission.
- Display and run third-party web content in prompts and sidebars inside Google applications
    - This permission is used for a settings sidebar (the one where the mailing schedule is set) to work. The sidebar contains custom HTML rather than standard SpreadsheetApp UI elements in order to provide a better user experience.
- Allow this application to run when you are not present
    - This permission is used to schedule mailings of vocabulary, so you could receive them on a daily basis.
- View your email address
    - This permission is used to filter out the emails that were sent by you. The Gmail add-on doesn’t need the context of an arbitrary email, but it needs the email with vocabulary. The sender of the email is used as one of the filters, since the vocabulary emails are being sent from your email address. Another filter is the subject of the email. Checking that the sender was you isn’t necessary, of course, but it makes the filtering more robust.
- View your email messages when the add-on is running
    - This permission is required to read a spreadsheet id and sheet name from which the email was sent. These data are provided in a hidden html-tag of an email message and are used for the “Mark as read” functionality to identify the sheet. The permission is NOT used for snooping on your emails.
- Run as a Gmail add-on
    - The permission allows the service to work as a Gmail add-on, which adds the “Mark as read” functionality to an email with the vocabulary list. If you haven’t read the email, you won’t receive the next one, which adds some convenience to the whole workflow.
- View your country, language and timezone
    - The permission is used to provide a localization for a user interface of the Gmail add-on.

You can review access you have authorized to your Google Account under “Security” “Third-party apps with account access”.

## How to Contact Us
If you have any questions about this Privacy Policy, please <a class="mlink" href="https://github.com/fertkir">contact us</a>.

## Changes to Our Privacy Policy
This Privacy Policy may be updated to reflect changes to the Service. Upon making changes, we will update the “Effective Date” found at the top of this document. Your continued use of the Service after any changes constitutes your acceptance of the new terms.