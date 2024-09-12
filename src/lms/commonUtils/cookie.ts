import axios from "axios";
import qs from "qs";
import { getURL } from "./urlClient";
import env from "../../env";
import {
  getLatestCookie,
  insertNewCookie,
  updateCookie,
} from "../../db/dbService";
import { Model } from "mongoose";

export function getFreshCookie(username: string, password: string) {
  const axiosInstance = axios.create();

  const payload = qs.stringify({
    username: username,
    password: password,
  });
  let config = {
    method: "post",
    maxRedirects: 0,
    maxBodyLength: Infinity,
    url: env.LOGIN_URL,
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
  if (!cookie) {
    return false;
  }
  const URL = env.HOME_URL;
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

export async function handleCookieRetrieval(
  cookieDB: typeof Model,
  username: string,
  password: string
) {
  console.log("Retrieving cookies from the database.");

  let cookie = await getLatestCookie(cookieDB);
  const cookieExists = Boolean(cookie);

  if (!cookieExists) {
    console.log(
      "No previous cookie was found in the database. The first validity check will fail."
    );
  } else {
    console.log("Cookie found in the database.");

    try {
      if (isCookieValid(cookie)) {
        console.log("Cookie is valid.");
        return cookie;
      } else {
        console.log(
          "Last cookie in the database was expired, refreshing cookie..."
        );
      }
    } catch (error) {
      console.error(
        "Last cookie in the database had an invalid format. Refreshing cookie..."
      );
    }
  }

  cookie = await getFreshCookie(username, password);

  if (!isCookieValid(cookie)) {
    throw new Error("New cookie was not valid either. Stopping process...");
  }

  console.log("Cookie was refreshed and tested.");

  if (cookieExists) {
    await updateCookie(cookieDB, cookie);
  } else {
    await insertNewCookie(cookieDB, cookie);
  }

  console.log("Cookie was saved in the database.");
  return cookie;
}
