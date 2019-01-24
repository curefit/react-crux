import autobind from "autobind-decorator"
import * as React from "react"
import * as _ from "lodash"

@autobind
export class ListMultiSelectComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = {}
    }

    render() {
        if (_.isEmpty(this.props.additionalModels)) {
            return <div>{"Loading ....."}</div>
        }

        try {
            if (_.isEmpty(this.props.model) || !Array.isArray(this.props.model)) {
                return <div />
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
            }).join(', ')
            return <div>{finalString}</div>
        } catch (err) {
            return <div>{"Loading ...."}</div>
        }
    }
}