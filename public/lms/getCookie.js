"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookie = void 0;
exports.isCookieValid = isCookieValid;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
require("dotenv/config");
const getCookie = async (username, password) => {
    const axiosInstance = axios_1.default.create();
    const payload = qs_1.default.stringify({
        'username': username,
        'password': password
    });
    let config = {
        method: 'post',
        maxRedirects: 0,
        maxBodyLength: Infinity,
        url: 'http://lms.ui.ac.ir/login',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: payload
    };
    const cookie = axiosInstance.request(config)
        .then(res => Promise.reject("LMS didn't redirect to home after login. Possibility of failed login."))
        .catch(err => {
        if (err.response && err.response.status == 302) {
            return err.response.headers['set-cookie'][1];
        }
        Promise.reject(err);
    });
    return cookie;
};
exports.getCookie = getCookie;
async function isCookieValid(cookie) {
    console.log(cookie);
    const axiosInstance = axios_1.default.create();
    axiosInstance.defaults.headers.Cookie = cookie;
    const config = {
        maxRedirects: 0,
        maxBodyLength: Infinity,
        url: 'http://lms.ui.ac.ir/members/home',
    };
    const validity = axiosInstance.request(config)
        .then(res => true)
        .catch(err => {
        if (err.response.status == 302)
            return false;
        return Promise.reject(err);
    });
    return validity;
}
function testLogin() {
    const username = process.env.lmsUsername || '';
    const password = process.env.lmsPassword || '';
    console.log('username', username);
    console.log('password', password);
    const cookie = (0, exports.getCookie)(username, password)
        .then(cookie => isCookieValid(cookie))
        .then(console.log)
        .catch(console.log);
}
// testLogin()
