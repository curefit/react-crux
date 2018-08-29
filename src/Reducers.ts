
import * as _ from "lodash"
import { DefaultModels } from "./DefaultModels"

export function AllReducer(
    initialState = DefaultModels.getValues(),
    action: any
): any {
    if (action.model) {
        if (action.type.startsWith("FETCH_")) {
            if (action.type.endsWith("_STARTED")) {
                if (_.isEmpty((<any>initialState)[action.model])) {
                    return Object.assign({}, initialState, {[action.model]: [], fetchComplete: false})
                } else {
                    return Object.assign({}, initialState, {fetchComplete: false})
                }
            }

            if (action.type.endsWith("_COMPLETED")) {
                return Object.assign({}, initialState, { [action.model]: action.data, fetchComplete: true } )
            }

            if (action.type.endsWith("_FAILURE")) {
                return Object.assign({}, initialState, { [action.model]: {error: action.err}, fetchComplete: true } )
            }
        }
    }

    return Object.assign({}, initialState)
}

