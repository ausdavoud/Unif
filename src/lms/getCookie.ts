import axios from 'axios'
import qs from 'qs'
import 'dotenv/config'

export const getCookie = async (username: string, password: string) => {

    const axiosInstance = axios.create();
    
    const payload = qs.stringify({
        'username': username,
        'password': password
    })
    let config = {
        method: 'post',
        maxRedirects: 0,
        maxBodyLength: Infinity,
        url: 'http://lms.ui.ac.ir/login',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: payload
    }

    const cookie = axiosInstance.request(config)
        .then(res => Promise.reject("LMS didn't redirect to home after login. Possibility of failed login."))
        .catch(err => {
            if (err.response && err.response.status == 302){
                return err.response.headers['set-cookie'][1]
            }
            Promise.reject(err)
        })

    return cookie
};

export async function getHomePage(cookie: string): Promise<axios.AxiosResponse> {
    const axiosInstance = axios.create()
    axiosInstance.defaults.headers.Cookie = cookie
    
    const config = {
        maxRedirects: 0,
        maxBodyLength: Infinity,
        url: 'http://lms.ui.ac.ir/members/home',
    }
    
    const response = axiosInstance.request(config)
    return response
}

export async function isCookieValid(cookie: string) {

    console.log(cookie)
    const validity = getHomePage(cookie)
    .then(res => true)
    .catch(err => {
        if (err.response.status == 302) return false
        return Promise.reject(err)
    })

    return validity
}

function testLogin() {
    const username = process.env.lmsUsername || ''
    const password = process.env.lmsPassword || ''
    console.log('username', username)
    console.log('password', password)
    const cookie = getCookie(username, password)
                    .then(cookie =>  isCookieValid(cookie))
                    .then(console.log)
                    .catch(console.log)
}
// testLogin()