import axios, { ResponseType } from "axios";

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

    const response = axiosInstance.request(config);
    return response;
}

export function getPageContent(URL: string, cookie: string) {
    return getURL(URL, cookie)
        .then((res) => res.data)
        .catch((err) => {
            console.error(`Error in getting ${URL}. This happened before we could 
            access the response to call 'res.data'.`);
            throw err;
        });
}

export function getGroupPageContent(groupSuffixURL: string, cookie: string) {
    const baseURL = "http://lms.ui.ac.ir";
    const groupURL = baseURL + groupSuffixURL; // suffixURL includes '/' at the beginning

    return getPageContent(groupURL, cookie); // catches errors inside
}

export function getFile(URL: string, cookie: string) {
    const axiosInstance = axios.create();
    axiosInstance.defaults.headers.Cookie = cookie;
    const config = {
        responseType: "arraybuffer" as ResponseType,
    };
    const buff = axiosInstance
        .get(URL, config)
        .then((res) => {
            return toBuffer(res.data);
        })
        .catch((err) => {
            console.log(`Error downloading file with url ${URL}`);
            throw err;
        });
    return buff;
}

function toBuffer(data: string) {
    const dataBuffer = Buffer.from(data, "binary");
    return dataBuffer;
}
