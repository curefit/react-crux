import { Dispatch } from "redux"
import { FetchUtil } from "./FetchUtil"

const apiServer = process.env.API_SERVER ? process.env.API_SERVER : ""

export function getMyDetails(success?: any, error?: any) {
    return (dispatch: Dispatch<any>) => {
        dispatch({ type: "FETCH_USER_STARTED" })
        fetch(apiServer + "/auth/me", FetchUtil.get()).then(FetchUtil.parseResponse).then((data: any) => {
            dispatch({ type: "FETCH_USER_COMPLETED", myDetails: data })
            if (success) success(data)
        }).catch((err: any) => {
            if (err.name === "AuthError") {
                dispatch({ type: "AUTH_FAILED" })
                return
            }
            console.log("Error while fetching user", err)
            dispatch({ type: "FETCH_USER_FAILURE", err: err })
            if (error) error(err)
        })
    }
}

export function filterModel(model: string, item: any, success?: any, error?: any) {
    return (dispatch: Dispatch<any>) => {
        dispatch({ type: "FETCH_" + model + "_STARTED", model: model })
        fetch(apiServer + "/model/" + model + "/filter", FetchUtil.post(item)).then(FetchUtil.parseResponse).then((data: any) => {
            dispatch({ type: "FETCH_" + model + "_COMPLETED", data: {results : data.results ? data.results : data, metadata: data.metadata}, model: model})
            if (success) success(data.results ? data.results : data)
        }).catch((err: any) => {
            if (err.name === "AuthError") {
                dispatch({ type: "AUTH_FAILED" })
                return
            }
            console.log("Error while fetching" + model, err)
            dispatch({ type: "FETCH_" + model + "_FAILURE", err: err, model: model })
            if (error) error(err)
        })
    }
}

export function fetchModel(model: string, success?: any, error?: any) {
    return (dispatch: Dispatch<any>) => {
        dispatch({ type: "FETCH_" + model + "_STARTED", model: model })
        fetch(apiServer + "/model/" + model, FetchUtil.get()).then(FetchUtil.parseResponse).then((data: any) => {
            dispatch({ type: "FETCH_" + model + "_COMPLETED", data : data.results ? data.results : data, model: model})
            if (success) success(data)
        }).catch((err: any) => {
            if (err.name === "AuthError") {
                dispatch({ type: "AUTH_FAILED" })
                return
            }
            console.log("Error while fetching" + model, err)
            dispatch({ type: "FETCH_" + model + "_FAILURE", err: err, model: model })
            if (error) error(err)
        })
    }
}

export function searchModel(model: string, id: string, callback: any) {
    return (dispatch: Dispatch<any>) => {
        fetch(`${apiServer}/model/${model}/${id}`, FetchUtil.get()).then(FetchUtil.parseResponse).then((data: any) => {
            if (callback) callback(data)
        }).catch((err: any) => {
            if (err.name === "AuthError") {
                dispatch({ type: "AUTH_FAILED" })
                return
            }
            if (callback) callback(null)
        })
    }
}

export function createOrModify(model: string, item: any, edit: boolean, success?: any, error?: any) {
    return (dispatch: Dispatch<any>) => {
        const word = edit ? "MODIFY" : "CREATE"
        dispatch({ type: word + "_" + model + "_STARTED", model: model })
        fetch(apiServer + "/model/" + model, edit ? FetchUtil.put(item) : FetchUtil.post(item)).then(FetchUtil.parseResponse).then((data: any) => {
            dispatch({ type: word + "_" + model + "_COMPLETED", data: data, model: model })
            if (success) success(data)
        }).catch((err: any) => {
            if (err.name === "AuthError") {
                dispatch({ type: "AUTH_FAILED" })
                return
            }
            console.log("Error while fetching" + model, err)
            dispatch({ type: word + "_" + model + "_FAILURE", err: err, model: model })
            if (error) error(err)
        })
    }
}

export function deleteModel(model: string, item: any, success?: any, error?: any) {
    return (dispatch: Dispatch<any>) => {
        dispatch({ type: "DELETE_" + model + "_STARTED", model: model })
        fetch(apiServer + "/model/" + model, FetchUtil.delete(item)).then(FetchUtil.parseResponse).then((data: any) => {
            dispatch({ type: "DELETE_" + model + "_COMPLETED", data: data, model: model })
            if (success) success(data)
        }).catch((err: any) => {
            if (err.name === "AuthError") {
                dispatch({ type: "AUTH_FAILED" })
                return
            }
            console.log("Error while deleting" + model, err)
            dispatch({ type: "DELETE_" + model + "_FAILURE", err: err, model: model })
            if (error) error(err)
        })
    }
}

export function successCustomModal(data: any, type: string, model: string) {
    return (dispatch: Dispatch<any>) => {
        dispatch({ data, type, model })
    }
}

export function failureCustomModal(err: any, model: string, type: string) {
    return (dispatch: Dispatch<any>) => {
        dispatch({ type, err, model })
    }
}
