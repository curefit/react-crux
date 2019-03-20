import * as React from "react"
import * as _ from "lodash"

export const ListForeignComponent = (props: any) => {
    let selectField = "Loading..."
    if (!_.isEmpty(props.additionalModels)) {
        try {
            if (_.isEmpty(props.model) && !_.isNumber(props.model)) {
                selectField = ""
            }
            const foreignDoc = props.additionalModels[props.field.modelName]
                .find((datum: any) => datum[props.field.key] === props.model)
            selectField = foreignDoc ? _.get(foreignDoc, props.field.title) :
                props.model + " - Bad Value"
        } catch (err) {
            selectField = "Loading..."
        }
    }
    return <div>{selectField}</div>
}
