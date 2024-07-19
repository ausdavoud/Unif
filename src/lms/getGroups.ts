import * as cheerio from 'cheerio'
import { getHomePage, getCookie } from './getCookie'

async function getHomePageContent(cookie:string) {
    const homePageContent = getHomePage(cookie)
                    .then(res => res.data)
                    .catch(err => err)
    return homePageContent
}

export async function getGroupNames(cookie:string) {
    const homePageContent = await getHomePageContent(cookie)
    const groupNames = findGroupNames(homePageContent)
    return groupNames
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