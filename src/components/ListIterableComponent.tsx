import autobind from "autobind-decorator"
import * as React from "react"
import { ListNestedComponent } from "./ListNestedComponent"
import { ListForeignComponent } from "./ListForeignComponent"
import { ListCheckboxComponent } from "./ListCheckboxComponent"
import { InlineEditComponent } from "./InlineEditComponent"
import { ListMultiSelectComponent } from "./ListMultiSelectComponent"
import { map, filter, has } from "lodash"

@autobind
export class ListIterableComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = {}
    }

    modelChanged = (index: number, data: any, success: any, error: any) => {
        const modelCopy = JSON.parse(JSON.stringify(this.props.model))
        modelCopy[index] = data
        this.props.modelChanged(modelCopy, success, error)
    }

    render(): any {
        return <div>
            {
                map(this.props.model, (datum: any, index: number) => {
                    const field = this.props.field
                    if (!field.iterabletype) {
                        return <div key={index}>
                            {datum}
                        </div>
                    } else {
                        if (!this.props) {
                            return <div>{"Loading ..."}</div>
                        }

                        if (field.iterabletype.type === "iterable") {
                            return (
                                <ListIterableComponent
                                    model={datum} field={field}
                                    additionalModels={this.props.additionalModels}
                                    modelChanged={this.modelChanged.bind(this, index)}
                                />
                            )
                        }

                        if (field.iterabletype.type === "nested") {
                            const filtered = filter(field.iterabletype.fields, (f: any) => f.display && has(datum, f.field))
                            return <div>
                                {map(filtered, (f: any, index: number) => {
                                    return <div className="html-comma" style={{ display: "inline-block" }}>
                                        <span style={{ display: "inline-block" }}>{f.title + ":"}&nbsp;</span>
                                        <span style={{ display: "inline-block" }}>
                                            <ListNestedComponent
                                                model={datum} additionalModels={this.props.additionalModels}
                                                field={f} modelChanged={this.modelChanged.bind(this, index)}
                                            />
                                        </span>
                                    </div>
                                })}
                            </div>
                        }

                        if (field.iterabletype.type === "select" || field.iterabletype.type === "searcheableselect") {
                            return <div key={index}>
                                <ListForeignComponent
                                    model={datum} field={field.iterabletype.foreign}
                                    additionalModels={this.props.additionalModels}
                                />
                            </div>
                        }

                        if (field.iterabletype.type === "multiselect") {
                            return <div key={index}>
                                <ListMultiSelectComponent
                                    model={datum}
                                    field={field.foreign}
                                    additionalModels={this.props.additionalModels} />
                            </div>
                        }

                        if (field.iterabletype.type === "checkbox") {
                            return <ListCheckboxComponent model={datum} field={field} />
                        }

                        if (field.iterabletype.inlineEdit) {
                            return <div key={index}>
                                <InlineEditComponent text={datum} handleChange={this.modelChanged.bind(this, index)} />
                            </div>
                        } else {
                            return <div key={index}>{datum}</div>
                        }
                    }
                })
            }
        </div>
    }
}
