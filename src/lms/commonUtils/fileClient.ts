import axios, { ResponseType } from "axios";
import env from "../../env";

function abortSignal(timeoutMs: number) {
  const abortController = new AbortController();
  setTimeout(() => {
    abortController.abort();
  }, timeoutMs || 0);

  return abortController.signal;
}

function toBuffer(data: string) {
  const dataBuffer = Buffer.from(data, "binary");
  return dataBuffer;
}

export function getFileBuffer(URL: string, cookie: string) {
  const axiosInstance = axios.create();
  axiosInstance.defaults.headers.Cookie = cookie;
  const config = {
    responseType: "arraybuffer" as ResponseType,
    signal: abortSignal(+env.MAX_DOWNLOAD_TIME),
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
