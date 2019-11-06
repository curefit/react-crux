export class AuthError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'AuthError'
    }
}

export class FetchUtil {
    static get(headers?: any): any {
        const concatHeaders = Object.assign({}, {
            Accept: "application/json",
            "Content-Type": "application/json"
        }, headers)

        return {
            method: "GET",
            headers: concatHeaders,
            credentials: "include"
        }
    }

    static post(body: any, headers?: any): any {
        const concatHeaders = Object.assign({}, {
            Accept: "application/json",
            "Content-Type": "application/json"
        }, headers)
        return {
            method: "POST",
            headers: concatHeaders,
            body: JSON.stringify(body),
            credentials: "include"
        }
    }

    static put(body: any = {}, headers?: any): any {
        const concatHeaders = Object.assign({}, {
            Accept: "application/json",
            "Content-Type": "application/json"
        }, headers)
        return {
            method: "PUT",
            headers: concatHeaders,
            body: JSON.stringify(body),
            credentials: "include"
        }
    }

    static delete(body: any = {}, headers?: any): any {
        const concatHeaders = Object.assign({}, {
            Accept: "application/json",
            "Content-Type": "application/json"
        }, headers)
        return {
            method: "DELETE",
            headers: concatHeaders,
            body: JSON.stringify(body),
            credentials: "include"
        }
    }

    static parseResponse<T>(response: any): Promise<T> {
        try {
            if (response.status >= 200 && response.status <= 299) {
                return response.json().then((x: any) => {
                    return <T>x
                })
            } else {
                console.error("Status: " + response.status + " StatusText: " + response.statusText)
                console.log(response.body)
                if (response.status == 401) {
                    console.error("Call failed with 401, throwing auth error")
                    throw new AuthError(response.status)
                }
                return response.json().then((err: any) => {
                    console.error("Error message: " + JSON.stringify(err))
                    throw new Error(JSON.stringify(err))
                })
            }
        } catch (err) {
            if (err.name === "AuthError") {
                throw err
            }
            console.error("Status: " + response.status + " StatusText: " + response.statusText)
            console.error("Error message: " + JSON.stringify(err))
            throw new Error(response.statusText)
        }
    }

    static getFormData(params: Map<string, string>): string {
        let respString: string = undefined
        params.forEach((value, key) => {
            const newString = encodeURIComponent(key) + "=" + encodeURIComponent(value)
            respString = (respString) ? respString + "&" + newString : newString
        })
        return respString
    }
}
