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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupNames = getGroupNames;
const cheerio = __importStar(require("cheerio"));
const requests_1 = require("./requests");
function getGroupNames(cookie) {
    const homePageURL = "http://lms.ui.ac.ir/members/home";
    return (0, requests_1.getPageContent)(homePageURL, cookie)
        .then(selectGroupNames)
        .catch((err) => {
        console.error("Error in loading the home page for getting the group names.");
        throw err;
    });
}
function selectGroupNames(homePageContent) {
    const $ = cheerio.load(homePageContent);
    const groupNames = [];
    $("#profile_groups li").each((i, elem) => {
        let groupName = $(elem).find("a").attr("href");
        if (groupName) {
            groupNames[i] = groupName;
        }
    });
    return groupNames;
}
