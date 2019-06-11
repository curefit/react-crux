import * as React from "react"
import * as _ from "lodash"

export const ListMultiSelectComponent = (props: any) => {
    let selectField = "Loading..."
    try {
        if (_.isEmpty(props.model) || !Array.isArray(props.model)) {
            selectField = ""
        }
        const finalString = _.map(props.model, (selectValue: string) => {
            const foreignDoc = _.find(props.additionalModels[props.field.modelName], (doc: any) => {
                return doc[props.field.key] === selectValue
            })
            let foreignTitle
            if (_.isEmpty(foreignDoc)) {
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