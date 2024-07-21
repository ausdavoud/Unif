import * as cheerio from 'cheerio'
import { getPageContent } from "./requests"
import { getCookie, isCookieValid } from './getCookie'
import { getGroupNames } from './getGroups'
import fs from 'fs'

function getGroupPageContent(groupSuffixURL:string, cookie:string) {
    const baseURL = 'http://lms.ui.ac.ir'
    const groupURL = baseURL + groupSuffixURL // suffixURL includes '/' at the beginning

    return getPageContent(groupURL, cookie) // catches errors inside
}

function findFeedElements(groupPageContent:string) {
    const feedMessages: string[] = []
    const $ = cheerio.load(groupPageContent)
    $('div[class="feed_item_body"]').each((i, elem) => {
        const elementHTML = $(elem).html()
        if (elementHTML!= null){
            feedMessages.push(elementHTML)
    }})
    return feedMessages
}

function createMessageBody(feedElement: string) {
    // Extract message text and shape the overall structure to store in db;
    const $ = cheerio.load(feedElement)
    const author = $('a[class~="feed_item_username"]')
    const textBody = $('span[class="feed_item_bodytext"]')
    const textSpan = textBody.find('span[class="view_more"][style^="display"]')
    const text = textSpan.text() === '' ? textBody : textSpan
    const date = $('span[class="timestamp"]')
    console.log(author.text())
    console.log(text.text())
    console.log(date.text())
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

function getGroupFeed(groupSuffixURL:string, cookie:string) {
    return getGroupPageContent(groupSuffixURL, cookie)
        .then(findFeedElements)
        .catch(err => {
            console.error(`There was an error in extracting feed 
            in group ${groupSuffixURL}`)
            throw err
        })
}


function testLocalHTML() {
    const sampleHTML = fs.readFileSync('./src/lms/exampleGroupFeed.txt', { encoding: 'utf-8' })
    const feedElements = findFeedElements(sampleHTML)
    const msgBody = createMessageBody(feedElements[0])
}

function testFindFeedMessages() {
    const username = process.env.lmsUsername || ''
    const password = process.env.lmsPassword || ''
    console.log('username', username)
    console.log('password', password)
    getCookie(username, password)
        .then(cookie => {
            if (!isCookieValid(cookie)) throw new Error()
            return cookie
        })
        .then(cookie => {
            return getGroupNames(cookie)
                .then(groupNames => [groupNames, cookie])
                // cuz we need cookie for the next .then
        })
        .then(([groupNames, cookie]) => {
            return getGroupFeed(groupNames[0], cookie)
        })
        .then(feedElements => {
            createMessageBody(feedElements[0])
        })
}
testLocalHTML()