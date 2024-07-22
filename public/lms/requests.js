"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getURL = getURL;
exports.getPageContent = getPageContent;
exports.getGroupPageContent = getGroupPageContent;
exports.getFile = getFile;
const axios_1 = __importDefault(require("axios"));
function getURL(URL, cookie) {
    const axiosInstance = axios_1.default.create();
    axiosInstance.defaults.headers.Cookie = cookie;
    const config = {
        maxRedirects: 0,
        maxBodyLength: Infinity,
        url: URL,
    };
    const response = axiosInstance.request(config);
    return response;
}
function getPageContent(URL, cookie) {
    return getURL(URL, cookie)
        .then((res) => res.data)
        .catch((err) => {
        console.error(`Error on getting page content of ${URL}. This happened 
            \rbefore we could access the response to call 'res.data'.`);
        err.handled = true;
        throw err;
    });
}
function getGroupPageContent(groupSuffixURL, cookie) {
    const baseURL = "http://lms.ui.ac.ir";
    const groupURL = baseURL + groupSuffixURL; // suffixURL includes '/' at the beginning
    return getPageContent(groupURL, cookie); // catches errors inside
}
function getFile(URL, cookie) {
    const axiosInstance = axios_1.default.create();
    axiosInstance.defaults.headers.Cookie = cookie;
    const config = {
        responseType: "arraybuffer",
    };
    const buff = axiosInstance
        .get(URL, config)
        .then((res) => {
        return toBuffer(res.data);
    })
        .catch((err) => {
        console.log(`Error downloading file with url ${URL}`);
        err.handled = true;
        throw err;
    });
    return buff;
}
function toBuffer(data) {
    const dataBuffer = Buffer.from(data, "binary");
    return dataBuffer;
}
