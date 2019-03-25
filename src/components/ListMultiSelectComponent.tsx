import * as React from "react"
import * as _ from "lodash"

export const ListMultiSelectComponent = (props: any) => {
    let selectField = "Loading..."
    try {
        if (_.isEmpty(this.props.model) || !Array.isArray(this.props.model)) {
            selectField = ""
        }
        const finalString = _.map(this.props.model, (selectValue: string) => {
            const foreignDoc = _.find(this.props.additionalModels[this.props.field.modelName], (doc: any) => {
                return doc[this.props.field.key] === selectValue
            })
            let foreignTitle
            if (_.isEmpty(foreignDoc)) {
                foreignTitle = selectValue + " Bad Value"
            } else {
                foreignTitle = foreignDoc[this.props.field.title]
            }
            return foreignTitle
        }).join(", ")
        selectField = finalString
    } catch (err) {
        selectField = "Loading..."
    }
    return <div>{selectField}</div>
}