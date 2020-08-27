import * as React from "react"
import ReactTooltip from 'react-tooltip';

export const TitleComponent = (props: any) => {
    const { field, isValueChanged, modalType } = props
    return (
        <label className="small mr-2" style={isValueChanged && modalType === "EDIT" ? {
            background: 'gainsboro',
            padding: 5
        } : null}>{field.title.toUpperCase()}
            {field.required ?
                <span className="text-danger" style={{
                    fontSize: 24,
                    position: 'absolute',
                    marginTop: -4,
                    marginLeft: 2
                }}> * </span> : null}
            {!!field.description ? <span data-tip={field.description} style={{
                borderRadius: 10,
                marginLeft: 10,
                background: 'white',
                color: 'black',
                padding: 4,
                fontSize: 13,
                opacity: 0.5
            }}>?</span> : null}
            <ReactTooltip />
        </label>
    )
}

