import * as cheerio from "cheerio";
import { getPageContent } from "./requests";

export function getGroupNames(cookie: string) {
    const homePageURL = "http://lms.ui.ac.ir/members/home";
    return getPageContent(homePageURL, cookie)
        .then(selectGroupNames)
        .catch((err) => {
            if (!err.handled) {
                console.error(
                    `Error in using css selector to extract groupNames
                    \rfrom hom page. Probably an error in CheerIO.`
                );
            }
            throw err;
        });
}

function selectGroupNames(homePageContent: string) {
    const $ = cheerio.load(homePageContent);
    const groupNames: string[] = [];
    $("#profile_groups li").each((i, elem) => {
        let groupName = $(elem).find("a").attr("href");
        if (groupName) {
            groupNames[i] = groupName;
        }
    });
    return groupNames;
}
