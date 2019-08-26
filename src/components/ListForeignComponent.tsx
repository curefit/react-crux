import * as React from "react"
import { isEmpty, isNumber, get } from "lodash"

export const ListForeignComponent = (props: any) => {
    let selectField = "Loading..."
    if (!isEmpty(props.additionalModels)) {
        try {
            if (isEmpty(props.model) && !isNumber(props.model)) {
                selectField = ""
            }
            const foreignDoc = props.additionalModels[props.field.modelName]
                .find((datum: any) => datum[props.field.key] === props.model)
            selectField = foreignDoc ? get(foreignDoc, props.field.title) :
                props.model + " - Bad Value"
        } catch (err) {
            selectField = "Loading..."
        }
    }
    return <div>{selectField}</div>
}
