/**
 * Created by Андрей on 29.11.2015.
 */
var config = {};

config.vk = {};
config.mail = {};
config.mail.strings = {};

config.vk.appId = 5167405;
config.vk.appSecret = process.env.VK_APP_SECRET || "vk_app_secret";
config.vk.token = "user_access_token_who_sends_messages_to_vk";
config.vk.peerId = "user_or_chat_id";

config.mail.login = process.env.MAIL_USER || 'example@gmail.com';
config.mail.password = process.env.MAIL_PASSWORD || 'password';
config.mail.host = "imap.gmail.com"; //IMAP server host
config.mail.port = 993; // IMAP server port
config.mail.tls = true;
config.mail.markSeen = false;
config.mail.fetchUnreadOnStart = true;

config.mail.strings.subject = "Тема: ";
config.mail.strings.from = "От: ";
config.mail.strings.body = "Тело: ";

module.exports = config;


