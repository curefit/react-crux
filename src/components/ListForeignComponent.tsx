import autobind from "autobind-decorator"
import * as React from "react"
import * as _ from "lodash"

@autobind
export class ListForeignComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = {}
    }

    render() {
        if (_.isEmpty(this.props.additionalModels)) {
            return <div>{"Loading ....."}</div>
        }

        try {
            if (_.isEmpty(this.props.model) && !_.isNumber(this.props.model)) {
                return <div />
            }
            const foreignDoc = this.props.additionalModels[this.props.field.modelName]
                .find((datum: any) => datum[this.props.field.key] === this.props.model)
            return foreignDoc ? <div>{_.get(foreignDoc, this.props.field.title)}</div> :
                <div>{this.props.model + " - Bad Value"}</div>
        } catch (err) {
            return <div>{"Loading ...."}</div>
        }
    }
}