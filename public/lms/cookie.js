"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookie = getCookie;
exports.isCookieValid = isCookieValid;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const requests_1 = require("./requests");
function getCookie(username, password) {
    const axiosInstance = axios_1.default.create();
    const payload = qs_1.default.stringify({
        username: username,
        password: password,
    });
    let config = {
        method: "post",
        maxRedirects: 0,
        maxBodyLength: Infinity,
        url: "http://lms.ui.ac.ir/login",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data: payload,
    };
    const cookie = axiosInstance
        .request(config)
        .then((res) => {
        throw new Error();
    })
        .catch((err) => {
        if (err.response && err.response.status == 302) {
            return err.response.headers["set-cookie"][1];
        }
        console.error(`Error in getting the cookie. Probably the status code was 
            \rnot 302, meaning no redirect happened after Login.`);
        err.handled = true;
        throw err;
    });
    return cookie;
}
function isCookieValid(cookie) {
    const URL = "http://lms.ui.ac.ir/members/home";
    const validity = (0, requests_1.getURL)(URL, cookie)
        .then((res) => true)
        .catch((err) => {
        if (err.response.status == 302) {
            console.error(`Error in validating cookie. Home page redirects
            \rto another page which is probably the login page, so the cookie
            \rwas probably not valid.`);
            return false;
        }
        console.error(`Error in validating the cookie. 
        \rThe error was **not** caused by status code 302. Maybe a network error?`);
        err.handled = true;
        throw err;
    });
    return validity;
}
