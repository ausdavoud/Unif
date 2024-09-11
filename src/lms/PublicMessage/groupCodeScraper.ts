import * as cheerio from "cheerio";
import { getPageContent } from "../commonUtils/urlClient";

export function getGroupCodes(cookie: string) {
  const homePageURL = "http://lms.ui.ac.ir/members/home";
  return getPageContent(homePageURL, cookie)
    .then(selectGroupCodes)
    .catch((err) => {
      if (!err.handled) {
        console.error(
          `Error in using css selector to extract groupCodes
                    \rfrom home page. Probably an error in CheerIO.`
        );
      }
      throw err;
    });
}

function selectGroupCodes(homePageContent: string) {
  const $ = cheerio.load(homePageContent);
  const groupCodes: string[] = [];
  $("#profile_groups li").each((i, elem) => {
    let groupCode = $(elem).find("a").attr("href");
    if (groupCode) {
      groupCodes[i] = groupCode;
    }
  });
  return groupCodes;
}
