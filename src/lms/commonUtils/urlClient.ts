import axios from "axios";
import env from "../../env";

export function getURL(
  URL: string,
  cookie: string
): Promise<axios.AxiosResponse> {
  const axiosInstance = axios.create();
  axiosInstance.defaults.headers.Cookie = cookie;

  const config = {
    maxRedirects: 0,
    maxBodyLength: Infinity,
    url: URL,
  };

  try {
    const response = axiosInstance.request(config);
    return response;
  } catch (e) {
    throw new Error(
      `Error in getting URL ${URL}. Also note that redirects were set to 0.`
    );
  }
}

export function getPageContent(URL: string, cookie: string) {
  return getURL(URL, cookie)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`Error on getting page content of ${URL}. This happened 
            \rbefore we could access the response to call 'res.data'.`);
      err.handled = true;
      throw err;
    });
}

export function getGroupPageContent(groupSuffixURL: string, cookie: string) {
  const groupURL = env.BASE_URL + groupSuffixURL; // suffixURL includes '/' at the beginning
  return getPageContent(groupURL, cookie); // catches errors inside
}
