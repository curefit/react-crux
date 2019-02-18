import * as _ from "lodash"

export function CruxReducerFactory(defaultModels: any) {
        return function CruxReducer(initialState = defaultModels,
        action: any): any {
        if (action.model) {
            if (action.type.startsWith("FETCH_")) {
                if(action.isFilters) {
                    const modelFilters = [action.model]+"AppliedFilters"
                    initialState = Object.assign({}, initialState, { [modelFilters]: action.item })
                }

                if (action.type.endsWith("_STARTED")) {
                    if (_.isEmpty((<any>initialState)[action.model])) {
                        return Object.assign({}, initialState, { [action.model]: [], fetchComplete: false })
                    } else {
                        return Object.assign({}, initialState, { fetchComplete: false })
                    }
                }

                if(action.type.endsWith("_FILTER")){
                    const modelFilters = [action.model]+"AppliedFilters"
                    return Object.assign({}, initialState, { [modelFilters]: action.item })
                }
                // It can be used, when New Data Comes in. It will be concated with existing props
                if (action.type.endsWith("_PUT_DATA")) {
                    const data = _.cloneDeep(initialState[action.model])
                    if(data.results){
                        data.results.unshift(action.data)
                    } else {
                        data.unshift(action.data)
                    }
                    return Object.assign({}, initialState, { [action.model]: data, fetchComplete: true })
                }
                if (action.type.endsWith("_COMPLETED")) {
                    return Object.assign({}, initialState, { [action.model]: action.data, fetchComplete: true })
                }

                if (action.type.endsWith("_FAILURE")) {
                    return Object.assign({}, initialState, { [action.model]: { error: action.err }, fetchComplete: true })
                }
            }
        }

        return Object.assign({}, initialState)
    }
}