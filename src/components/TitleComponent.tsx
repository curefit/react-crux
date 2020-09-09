import * as React from "react"
import ReactTooltip from 'react-tooltip';
export const TitleComponent = (props: any) => {
    const { field, isValueChanged, modalType } = props
    console.log(isValueChanged , modalType, 'isValueChanged && modalType')
    return (
        <label className="small mr-2">{field.title.toUpperCase()}
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
            {isValueChanged && modalType === "EDIT" ?
                <img src="https://icons.iconarchive.com/icons/custom-icon-design/office/256/edit-icon.png" style={{
                    height: 15,
                    marginLeft: 15
                }} /> : null}
            <ReactTooltip />
        </label>
    )
}

