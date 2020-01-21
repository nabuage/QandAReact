import { webAPIUrl } from "./AppSettings";

export interface HttpRequest<REQB> {
    path: string;
}

export interface HttpResponse<RESB> extends Response {
    parsedBody?: RESB;
}

export const http = <REQB, RESB>(
    config: HttpRequest<REQB>
): Promise<HttpResponse<RESB>> => {
    return new Promise((resolve, reject) => {
        //make the http request
        const request = new Request(`${webAPIUrl}${config.path}`);
        let response: HttpResponse<RESB>;
        fetch(request)
            .then(res => {
                response = res;
                return res.json();
            })
            .then(body => {
                if (response.ok) {
                    response.parsedBody = body;
                    resolve(response);
                }
                else {
                    reject(response);
                }
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });

        //resolve the promise with the parsed body if a successful request

        //reject the promise if the request is not successful
    });
};