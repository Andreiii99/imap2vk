# imap2vk
It is a Node.js application that listens for incoming emails via IMAP and resends them to VKontakte dialogs

## Features
* Works with any mail server which support IMAP
* Works with private and group VK dialogs
* Gets all unread emails by default (can be changed)
* Doesn't mark emails as seen by default (can be changed)
* Resending messages to VK every minute in case of fail

## How to start
1. Go to the root folder
2. Fill the file `config.js` with proper parameters
3. Execute `npm install` to download dependencies
4. Execute `npm start`

## Issues
When checking mail fails (e.g., timeout, disconnection from server), script gracefully exits (until all messages from a queue are sent). To recover connection use [forever](https://github.com/foreverjs/forever) module.

## Contributing
Contributions to the app welcome. If you've fixed a bug or implemented a cool new feature that you would like to share, please feel free to open a pull request here.

