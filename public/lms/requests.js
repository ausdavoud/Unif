"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getURL = getURL;
exports.getPageContent = getPageContent;
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
        .then(res => res.data)
        .catch(err => {
        console.error(`Error in getting ${URL}. This happened before we could 
            access the response to call 'res.data'.`);
        throw err;
    });
}
function getFile(URL, cookie) {
    const axiosInstance = axios_1.default.create();
    axiosInstance.defaults.headers.Cookie = cookie;
    const config = {
        responseType: "arraybuffer"
    };
    const buff = axiosInstance.get(URL, config)
        .then(res => {
        return toBuffer(res.data);
    })
        .catch(err => {
        console.log(`Error downloading file with url ${URL}`);
        throw err;
    });
    return buff;
}
function toBuffer(data) {
    const dataBuffer = Buffer.from(data, 'binary');
    return dataBuffer;
}
