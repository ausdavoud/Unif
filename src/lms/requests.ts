import axios from "axios"

export function getURL(URL:string, cookie:string): Promise<axios.AxiosResponse> {
    const axiosInstance = axios.create()
    axiosInstance.defaults.headers.Cookie = cookie
    
    const config = {
        maxRedirects: 0,
        maxBodyLength: Infinity,
        url: URL,
    }
    
    const response = axiosInstance.request(config)
    return response
}

export function getPageContent(URL:string, cookie:string) {
    return getURL(URL, cookie)
        .then(res => res.data)
        .catch(err => {
            console.error(`Error in getting ${URL}. This happened before we could 
            access the response to call 'res.data'.`)
            throw err
        })
}
