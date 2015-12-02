/**
 * Created by Андрей on 29.11.2015.
 */
var config = {};

config.vk = {};
config.mail = {};
config.mail.strings = {};

config.vk.appId = 5167405;
config.vk.appSecret = process.env.VK_APP_SECRET || "vk_app_secret";
//You need to get a token for STANDALONE APPLICATIONS with permissions 'messages' and 'offline'
//See more: https://vk.com/dev/permissions
config.vk.token = process.env.VK_APP_TOKEN || "vk_app_token";
config.vk.peerId = process.env.PEER_ID || "14410915";

config.mail.login = process.env.MAIL_USER || 'example@gmail.com';
config.mail.password = process.env.MAIL_PASSWORD || 'password';
config.mail.host = "imap.gmail.com"; //IMAP server host
config.mail.port = 993; // IMAP server port
config.mail.tls = true;
config.mail.markSeen = false;
config.mail.fetchUnreadOnStart = true;
config.mail.cutOff = true;

config.mail.strings.subject = "Тема: ";
config.mail.strings.from = "От: ";
config.mail.strings.body = "Тело: ";
config.mail.strings.attachments="Вложения: ";
config.mail.strings.cutOffFilters=["С уважением", "Regards"];

module.exports = config;


