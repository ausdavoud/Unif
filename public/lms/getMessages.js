"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const requests_1 = require("./requests");
const getCookie_1 = require("./getCookie");
const getGroups_1 = require("./getGroups");
const fs_1 = __importDefault(require("fs"));
function getGroupPageContent(groupSuffixURL, cookie) {
    const baseURL = 'http://lms.ui.ac.ir';
    const groupURL = baseURL + groupSuffixURL; // suffixURL includes '/' at the beginning
    return (0, requests_1.getPageContent)(groupURL, cookie); // catches errors inside
}
function findFeedElements(groupPageContent) {
    const feedMessages = [];
    const $ = cheerio.load(groupPageContent);
    $('div[class="feed_item_body"]').each((i, elem) => {
        const elementHTML = $(elem).html();
        if (elementHTML != null) {
            feedMessages.push(elementHTML);
        }
    });
    return feedMessages;
}
function createMessageBody(feedElement) {
    // Extract message text and shape the overall structure to store in db;
    const $ = cheerio.load(feedElement);
    const author = $('a[class~="feed_item_username"]');
    const textBody = $('span[class="feed_item_bodytext"]');
    const textSpan = textBody.find('span[class="view_more"][style^="display"]');
    const text = textSpan.text() === '' ? textBody : textSpan;
    const date = $('span[class="timestamp"]');
    console.log(author.text());
    console.log(text.text());
    console.log(date.text());
    /*
    body: span[class=feed_item_posted]
        username: a[class=feed_item_username].text
        text: span[class="feed_item_bodytext"]
            if there is no span[class="view_more"][style^="display"] //it starts with display:none
                return the text inside the feed_item_bodytext,
            else
                return span[class="view_more"][style^="display"].text
        date: span[class="timestamp"]
        hasAttachment: find div[class="feed_item_attachments"]
        if div does not exist:
            return false
        else:
            find spans as children, they must be 4.
            if spans don't exist
                isExercise = false
                look for anchor tag
            else:
                isExercise = true
                first span is title
                second span is attachment:
                    if anchor tag in second span:
                        hasAttachment = true
                third span is start
                forth span is deadline


    */
}
function getGroupFeed(groupSuffixURL, cookie) {
    return getGroupPageContent(groupSuffixURL, cookie)
        .then(findFeedElements)
        .catch(err => {
        console.error(`There was an error in extracting feed 
            in group ${groupSuffixURL}`);
        throw err;
    });
}
function testLocalHTML() {
    const sampleHTML = fs_1.default.readFileSync('./src/lms/exampleGroupFeed.txt', { encoding: 'utf-8' });
    const feedElements = findFeedElements(sampleHTML);
    const msgBody = createMessageBody(feedElements[0]);
}
function testFindFeedMessages() {
    const username = process.env.lmsUsername || '';
    const password = process.env.lmsPassword || '';
    console.log('username', username);
    console.log('password', password);
    (0, getCookie_1.getCookie)(username, password)
        .then(cookie => {
        if (!(0, getCookie_1.isCookieValid)(cookie))
            throw new Error();
        return cookie;
    })
        .then(cookie => {
        return (0, getGroups_1.getGroupNames)(cookie)
            .then(groupNames => [groupNames, cookie]);
        // cuz we need cookie for the next .then
    })
        .then(([groupNames, cookie]) => {
        return getGroupFeed(groupNames[0], cookie);
    })
        .then(feedElements => {
        createMessageBody(feedElements[0]);
    });
}
testLocalHTML();
