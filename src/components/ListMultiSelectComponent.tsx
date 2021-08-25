import * as React from "react"
import { isEmpty, map, find } from "lodash"

export const ListMultiSelectComponent = (props: any) => {
    let selectField = "Loading..."
    try {
        if (isEmpty(props.model) || !Array.isArray(props.model)) {
            selectField = ""
        }
        const finalString = map(props.model, (selectValue: string) => {
            const foreignDoc = find(props.additionalModels[props.field.modelName], (doc: any) => {
                return doc[props.field.key] === selectValue
            })
            let foreignTitle
            if (isEmpty(foreignDoc)) {
                foreignTitle = selectValue + " Bad Value"
            } else {
                foreignTitle = foreignDoc[props.field.title]
            }
            return foreignTitle
        }).join(", ")
        selectField = finalString
    } catch (err) {
        selectField = "Loading..."
    }
    return <div>{selectField}</div>
}