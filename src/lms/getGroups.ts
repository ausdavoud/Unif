import * as cheerio from 'cheerio'
import { getCookie } from './getCookie'
import { getPageContent } from './requests'

export function getGroupNames(cookie:string) {
    const homePageURL = 'http://lms.ui.ac.ir/members/home' 
    return getPageContent(homePageURL, cookie)
        .then(findGroupNames)
        .catch(err => {
            console.error('Error in loading the home page for getting the group names.')
            throw err
        })
}

function findGroupNames(homePageContent:string) {
    const $ = cheerio.load(homePageContent)
    const groupNames: string[] = []
    $('#profile_groups li').each((i, elem) => {
        let groupName = $(elem).find('a').attr('href')
        if (groupName) {
            groupNames[i] = groupName
        }
    })
    return groupNames
}

async function testGetGroupNames() {
    const username = process.env.lmsUsername || ''
    const password = process.env.lmsPassword || ''
    const groupNames = getCookie(username, password)
                .then(getGroupNames)
                .then(console.log)

}
// testGetGroupNames()