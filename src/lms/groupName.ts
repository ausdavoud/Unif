import * as cheerio from "cheerio";
import { getCookie } from "./cookie";
import { getPageContent } from "./requests";

export function getGroupNames(cookie: string) {
    const homePageURL = "http://lms.ui.ac.ir/members/home";
    return getPageContent(homePageURL, cookie)
        .then(selectGroupNames)
        .catch((err) => {
            console.error(
                "Error in loading the home page for getting the group names."
            );
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
