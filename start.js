/**
 * Created by Андрей on 29.11.2015.
 */
var MailListener = require("mail-listener2");
var VK = require("vksdk");
var winston = require("winston");
var strftime = require('strftime'); //format dates in logs
var config = require('./config');
var eol = require('os').EOL;

var uuid = require("uuid");
var VkQueue = require("./vk_queue");

/* ========= Setup logging =========*/
function timestamp() {
    return strftime('%d-%m-%Y %H:%M:%S', new Date());
}

function formatter(options) {
    return "[" + options.timestamp() + "]" + ' [' + options.level.toUpperCase() + '] ' + (undefined !== options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '' );
}

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'info',
            timestamp: timestamp,
            formatter: formatter
        }),
        new (winston.transports.File)({
            name: 'info-file',
            filename: 'imap2vk-info.log',
            level: 'info',
            timestamp: timestamp,
            formatter: formatter
        }),

        new (winston.transports.File)({
            name: 'error-file',
            filename: 'imap2vk-error.log',
            level: 'error',
            timestamp: timestamp,
            formatter: formatter
        })
    ]
});

logger.exitOnError = false;

/* ========= Setup VK ============= */
var vk = new VK({
    'appId': config.vk.appId,
    'appSecret': config.vk.appSecret,
    'language': 'ru',
    'secure': true,
    'version': '5.40'
});

vk.setToken(config.vk.token);

var vkQueue = new VkQueue(5000, function (key, message) {
    vk.request('messages.send', {'message': message, 'peer_id': config.vk.peerId}, function (resp) {
        if (resp.response) {
            logger.log("info", "Successfully send to VK, msg id = %d", resp.response);
            vkQueue.remove(key); //if message delivered successful, remove it from queue
        } else {
            logger.log("error", "Error while sending to VK: %s", resp.error.error_msg);
        }
    })
});

vk.on('http-error', function (e) {
    logger.log("error", "HTTP error while sending message to VK: %s", e)
});

vk.on('parse-error', function (e) {
    logger.log("error", "HTTP error while parsing json from VK: %s", e);
});

/* ========= Setup Mail ============= */
var mailListener = new MailListener({
    username: config.mail.login,
    password: config.mail.password,
    host: config.mail.host,
    port: config.mail.port,
    tls: config.mail.tls,
    markSeen: config.mail.markSeen,
    fetchUnreadOnStart: config.mail.fetchUnreadOnStart,
    mailParserOptions: {streamAttachments: true},
    attachments: true
});

function extractMail(mail) {
    return config.mail.strings.from + mail.from[0].name + " <" + mail.from[0].address + ">" + eol +
        config.mail.strings.subject + mail.subject + eol +
        config.mail.strings.body + eol + (config.mail.cutOff ? cutOffSignature(mail.text) : mail.text) + eol +
        (mail.attachments ? config.mail.strings.attachments + extractAttachments(mail.attachments) : "");
}

function extractAttachments(attachments) {
    return attachments.map(function (attachment) {
        return attachment.fileName + " (" + Math.round(attachment.length / 1024) + " КБ)"
    }).join(", ");
}

/* Removes signature and everything after it (e.g., replied message) because it's useless */
function cutOffSignature(messageBody) {
    var isCutOff = false;
    var minPos = -1;
    var lcMessage = messageBody.toLowerCase();
    config.mail.strings.cutOffFilters.forEach(function (filter) {
        var pos = lcMessage.search(filter.toLowerCase());
        if ((pos != -1) && (minPos == -1 || pos < minPos)) {
            minPos = pos;
            isCutOff = true;
        }
    });
    if (isCutOff) return messageBody.substr(0, minPos).replace(/^\s+|\s+$/g, '')
        + eol + "-----------8<-----------";
    return messageBody;
}

mailListener.on("server:connected", function () {
    logger.log("info", "Successfully connected to mail server");
});

mailListener.on("server:disconnected", function () {
    logger.log("info", "Disconnected from mail server");
    vkQueue.shutdown(); //graceful shutdown queue to exit process
});

mailListener.on("mail", function (mail, seqno, attributes) {
    var message = extractMail(mail);
    logger.log("info", "Got new email: %s", eol + message);
    vkQueue.add(uuid.v1(), "&#9993;&#9993;&#9993;" + eol + message);
});

mailListener.on("error", function (err) {
    logger.log("error", "Error while checking mail: %s", err);
    //It is not good way but workaround for error 'This socket has been ended by the other party'
    vkQueue.shutdown(); //graceful shutdown queue to exit process
});

/* ========= Start mail server listening ============= */
mailListener.start();
