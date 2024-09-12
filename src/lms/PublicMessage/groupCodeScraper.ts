import * as cheerio from "cheerio";
import { getPageContent } from "../commonUtils/urlClient";
import env from "../../env";

export function getGroupCodes(cookie: string) {
  return getPageContent(env.HOME_URL, cookie)
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
