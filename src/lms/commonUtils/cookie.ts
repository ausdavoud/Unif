import axios from "axios";
import qs from "qs";
import { getURL } from "./urlClient";

export function getCookie(username: string, password: string) {
  const axiosInstance = axios.create();

  const payload = qs.stringify({
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

export function isCookieValid(cookie: string) {
  const URL = "http://lms.ui.ac.ir/members/home";
  const validity = getURL(URL, cookie)
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
