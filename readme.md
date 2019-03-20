# react-crux

CRUX is a simple to use client side library to create UI for CRUD operations on server side entities. Its best suited to create admin dashboards which typically have complex relationships between entities.

It is not a replacement for React or Redux or Bootstrap but rather a higher level abstraction that lets you create simple UI for CRUD operations by just writing a JSON config. CRUX reads this config and creates a React Component that you can add to your app.

Since its a client side library, it is completely agnostic to server side tech stack. 

If you use CRUX, you would not have to write HTML/JSX/TSX code. Essentially it converts a config in JSON to a UI that creates a table with all objects and a model to create new objects or modify existing objects in a user friendly manner.

### Quick Setup
- yarn add @curefit/react-crux
- yarn add react-bootstrap bootstrap-sass
- Add react crux css and bootstrap to your app.scss
```
$icon-font-path: "~bootstrap-sass/assets/fonts/bootstrap/";
$bootstrap-sass-asset-helper: false;

@import "~bootstrap-sass/assets/stylesheets/_bootstrap.scss";
@import "~@curefit/react-crux/scss/crux.scss";

```
- Write the config and pass it to the factory method to create the component (config guide explained later)
```

import * as React from "react"
import { CruxComponentCreator } from "@curefit/react-crux"

const constants = {
    modelName: "serviceAccess",
    title: "Service Access",
    creationTitle: "Service Access",
    createModal: true,
    editModal: true,
    largeEdit: true,
    stateRoot: "none",
    fields: [
        {
            title: "Service",
            field: "serviceName",
            representative: true,
        },
        {
            title: "Users",
            field: "users",
            type: "iterable",
            iterabletype: {
                title: "User",
                inlineEdit: true
            }
        }
    ]
}

const ServiceAccessComponent = CruxComponentCreator.create<ServiceAccess, ServiceAccessProps>(constants)
export {ServiceAccessComponent}
```
- Create the CRUX reducer by using the factory method and it to your redux app
```
import { applyMiddleware, combineReducers, createStore } from "redux"
import { createLogger } from "redux-logger"
import thunk from "redux-thunk"
import { CruxReducerFactory } from "@curefit/react-crux"

...

const appReducer = combineReducers({crux: CruxReducerFactory({}), user: UserReducer})

...

const store = createStore(
    appReducer,
    applyMiddleware(thunk, createLogger())
)
```
- Use the exported component in your react app like you do with any component.


### Dependencies
```
  "dependencies": {
    "autobind-decorator": "^2.1.0", // Because binding manually is so 2017
    "lodash": "^4.17.10", // Used heavily for all list/object manipulations
    "moment": "^2.22.2", // Used in date picker
    "moment-timezone": "^0.5.23", // Used in date picker with timezone
    "react": "^16.4.2", // Duh
    "react-bootstrap": "^0.32.3", // Its pretty cool
    "react-bootstrap-typeahead": "^3.2.2", // For typeahead component
    "react-datepicker": "^1.6.0", // For datepicker
    "react-datetime": "^2.16.3", // For datepicker with timezone
    "react-timezone": "^2.3.0", // Used in datepicker with timezone
    "react-dropzone": "^5.0.1", // For file upload component
    "react-redux": "^5.0.7", // Duh
    "react-select": "^2.3.0", // For Multi Select component
    "superagent": "^3.8.3", // For upload request
    "query-string": "^6.2.0" // For Query Params formation
    "react-color": "^2.17.0" // For Color Pallete Component Addition
    "reactcss": "^1.2.3" // Dynamic Css For Color Pallete
  }
```
# Specification
### Information Flow (Where does crux fit in redux)
![alt text](https://s3.ap-south-1.amazonaws.com/react-crux-doc/images/redux.png "Redux flow")


### Basic Schema
- **modelName**: The source name. Crux first looks for this locally in redux store. If not present, a http call to /model/:modelName will be made to fetch the list of models. For this to work, a controller on the server side needs to listen to this route
- **title**: The title for the table
- **creationTitle**: Title for the create button. (+ New <creationTitle>)
- **createModal**: If false, option to create new object wont come in the UI. Also note that disabling creation here is not sufficient. You should also make sure that your server does not support creation of this model.
- **editModal**: If true, option to edit a row in the table appears in the last column. Also note that disabling edit here is not sufficient. You should also make sure that your server does not support modification of this model.
- **deleteModal**: If false, option to delete button in edit modal will not appear.
- **largeEdit**: (false by default) - If true, a large modal appears instead of a simple default bootstrap modal. This is helpful if your objects are pretty complex and large.
- **stateRoot** - TBD
- **fields** - An array of all the fields in the object. Each field needs to have the following
   * _title_ - Name of the field
   * _field_ - The key in the model to access this field (e.g. "name" field inside "Employee")
   * _representative_ - Set to true if this field is representative of the parent object. Used to show in other select menus etc. Typically name/title fields are representative
   * _type_ - If not set, type is assumed to be a simple text field edited using an input text HTML element
        - _select_ - For dropdowns with single select option. Detailed explanation later. [Example](https://curefit.github.io/react-crux-examples/#/select)
        - _multiselect_ - For dropdowns with multiple select option. Detailed explanation later.
        - _colorpallete_ - For Selecting color from pallete. Detailed explanation later.
        - _searcheableselect_ - For dropdowns with searcheable single select option. Detailed explanation later.
        - _iterable_ - For lists (of strings or objects or selects). Detailed explanation later. [Example](https://curefit.github.io/react-crux-examples/#/iterable)
        - _nested_ - For objects which have fields of their own. Detailed explanation later. [Example](https://curefit.github.io/react-crux-examples/#/nested)
        - _typeahead_ - For searching within dropdown. Specification is same as select. It is a local search. Remote search is currently not supported.
        - _tinyinput_ - For very small texts. [Example](http://localhost:3000/#/bigtext) 
        - _bigtext_ - For large blobs of text. [Example](http://localhost:3000/#/bigtext)
        - _checkbox_ - For boolean fields. [Example](https://curefit.github.io/react-crux-examples/#/checkbox)
        - _imageUpload_ - For triggering file uploads. Server side controller required to handle multipart requests. Detailed specification later in the document. [Example](https://curefit.github.io/react-crux-examples/#/file)
        - _datepicker_ - For fields that have dates. Detailed spec later. [Example](https://curefit.github.io/react-crux-examples/#/datepicker)
        - _datetimezonepicker_ - For fields that have object {with date and timezone }. Detailed spec later.
        - _recursive_ - For fields that have recursive definition. Detailed spec later.
        - _custom_ - For injecting your own custom component to render this field. Requires another field called _customComponent_ (defined later)
        - _customedit_ - For injecting your own custom Editable component to render this field. Requires another field called _customEditComponent_ (defined later)
    * _displayChildren_ - Supports only one value - "inline". Causes subfields to be rendered side by side instead of one below the other (which is the default behaviour if _displayChildren_ is not present in schema)
    * _wysiwyg_ - If present and true, adds support to show a live preview will editing the object. Requires another field called _customComponent_
    * _customComponent_ - Required for wysiwyg and for _type_ "custom".
    * _customEditComponent_ - Required for _type_ "customedit".

### Select/Typeahead fields
Most common use case after text fields is to have a field whose value is restricted to a set of values. This set might be small and static and so might be hardcoded as enums or constants. This set might be big and dynamic so its values might come from another api or collection in the database. For CRUX schema it does not matter. 

For fields with _type_: "select", another field _foreign_ is mandatory. This field tells CRUX where to get the options for select from. Three fields are mandatory in foreign
 - _modelName_: where to get the options from. The logic for this is same. Initially find it in redux store. If not found, fetch it by making http get call to /model/:modelName
 - _title_: Which field in the foreign object to use to show title in the option
 - _key_: @deprecated(use keys) - Which field in the foreign object to use to store the value (typically some sort of id field)
 - _keys_: array of fields in the foreign object to use to store the value
 - _titleTransform_: lambda fn to generate title for foreign object
 - _search_: if set, allows field level filtering
    - _key_: identifier used for this field in filterModel
    - _filterLocation_: `client | server` specifies whether to filter at client or server, defaults to `client`

[Example](https://curefit.github.io/react-crux-examples/#/select)

```
{
    title: "Media Type",
    field: "mediaType",
    display: true,
    editable: true,
    type: "select",
    foreign: {
        modelName: "mediaTypes",
        key: "typeId", // typeId is what will be stored while storing mediaType for the object
        title: "title" // title is what will be used to show in the dropdown
    }
}


// Above example assumes that /model/mediaTypes returns a response like
[
    {
        typeId: "IMAGE",
        title: "Image"
    },
    {
        typeId: "VIDEO",
        title: "Video"
    }
]
```

###MultiSelect Field
This helps us to select multiple values in List. multiClear will allow us to clear multi values

```
{
    title: "Media Type",
    field: "mediaType",
    display: true,
    editable: true,
    type: "multiselect",
    multiClear: true
    foreign: {
        modelName: "mediaTypes",
        key: "typeId", // typeId is what will be stored while storing mediaType for the object
        title: "title" // title is what will be used to show in the dropdown
    }
}
```

###Color Pallete Field
This helps us to select color in Color Pallete.

```
{
    title: "Text Color",
    field: "textColor",
    display: true,
    editable: true,
    type: "colorpallete"
}
```

###Searcheable Select Field
This helps us to select multiple values in List.

```
{
    title: "Media Type",
    field: "mediaType",
    display: true,
    editable: true,
    type: "searcheableselect",
    foreign: {
        modelName: "mediaTypes",
        key: "typeId", // typeId is what will be stored while storing mediaType for the object
        title: "title" // title is what will be used to show in the dropdown
    }
}
```

###Select Field with Custom Filter
Select Field with Customized Filter Option. Modal Values can be filtered in that Custom Filter Function based on the requirement
```
{
   editable: true,
   title: "Attribute Name",
   type: "select",
   field: "id",
   foreign: {
       modelName: "cohortEventMeta",
       key: "id",
       title: "name",
       transform: customFilter
   }
}

Example: 
function customFilter(dataSource: any, currentModel: any, additionalModels: any, parentModel: any ) {
    const cohortEventMetas = additionalModels[dataSource]
    let attributes
    // Filter Logic
    return attributes
}
```

###Typeahead Field with Custom Filter
Typeahead Field with Customized Filter Option. Modal Values can be filtered in that Custom Filter Function based on the requirement
```
{
   editable: true,
   title: "Attribute Name",
   type: "typeahead",
   field: "id",
   foreign: {
       modelName: "cohortEventMeta",
       key: "id",
       title: "name",
       transform: customFilter
   }
}

Example: 
function customFilter(dataSource: any, currentModel: any, additionalModels: any, parentModel: any ) {
    const cohortEventMetas = additionalModels[dataSource]
    let attributes
    // Filter Logic
    return attributes
}
```

### Iterable fields
Whenever one of fields is a list of other objects/strings, set _type_: "iterable". To define the underlying type use the field _iterabletype_. It follows the same schema as field and supports all features mentioned above
[Example](https://curefit.github.io/react-crux-examples/#/iterable)
```
{
    title: "Nicknames",
    field: "nicknames",
    type: "iterable",
    editable: true,
    iterabletype: {
        type: "text",
        title: "Name"
    }
}
```

### Iterable fields with Reorder Buttons
Whenever one of fields is a list of other objects/strings, set _type_: "iterable". To define the underlying type use the field _iterabletype_. It follows the same schema as field and supports all features mentioned above . Iterable Field will have re-order button
[Example](https://curefit.github.io/react-crux-examples/#/iterable)
```
{
    title: "Nicknames",
    field: "nicknames",
    type: "iterable",
    editable: true,
    additionalButtons: {
        reorder: true
    },
    iterabletype: {
        type: "text",
        title: "Name"
    }
}
```

### Iterable fields with Add At Index Buttons
Whenever one of fields is a list of other objects/strings, set _type_: "iterable". To define the underlying type use the field _iterabletype_. It follows the same schema as field and supports all features mentioned above . Iterable Field will have Add At Index Button
[Example](https://curefit.github.io/react-crux-examples/#/iterable)
```
{
    title: "Nicknames",
    field: "nicknames",
    type: "iterable",
    editable: true,
    additionalButtons: {
        addAtIndex: true
    },
    iterabletype: {
        type: "text",
        title: "Name"
    }
}
```

### Iterable fields with Custom Button
Whenever one of fields is a list of other objects/strings, set _type_: "iterable". To define the underlying type use the field _iterabletype_. It follows the same schema as field and supports all features mentioned above
Iterable Field will also have re-order buttons
[Example](https://curefit.github.io/react-crux-examples/#/iterable)
```
{
    title: "Nicknames",
    field: "nicknames",
    type: "iterable",
    editable: true,
    additionalButtons: {
        customButton: true,
        customButtonAction: customButtonAction,
    },
    iterabletype: {
        type: "text",
        title: "Name"
    }
}

function customIterableButtonAction(data: any) {
    // Custom Button Action will be captured here
}
```

### Nested Fields
If the field is itself an object containing more fields, its _type_ should be "nested". A field with "nested" _type_ should have another mandatory field called _fields_. This is a list of all fields inside the nested object and each field follows the same schema as above.
[Example](https://curefit.github.io/react-crux-examples/#/nested)
```
{
  "modelName": "employees",
  "title": "Employees with list of free-form Tags",
  "creationTitle": "Employee",
  "editModal": true,
  "fields": [
    {
      "title": "Name",
      "field": "name",
      "editable": true,
      "representative": true,
      "display": true
    },
    {
      "title": "Address",
      "editable": true,
      "display": true,
      "field": "address",
      "type": "nested",
      "fields": [
        {
          "title": "Address Type",
          "field": "type",
          "display": true,
          "editable": true,
          "type": "select",
          "foreign": {
            "modelName": "addressTypes",
            "key": "typeId",
            "title": "displayName"
          }
        },
        {
          "title": "Address Line 1",
          "field": "addressLine1",
          "display": true,
          "editable": true
        },
        {
          "title": "Address Type",
          "field": "addressLine2",
          "display": true,
          "editable": true
        },
        {
          "title": "City",
          "field": "city",
          "display": true,
          "editable": true
        },
        {
          "title": "ZipCode",
          "field": "zipcode",
          "display": true,
          "editable": true,
          "type": "tinyinput"
        }
      ]
    }
  ],
  "createModal": true
}
```

### Default Value Support for our components
This is to support default values for our components. In each config, we can represent a defaultValueFn key. Custom Function will be called, when the
component does not have value.

```
{
    "title": "Text",
    "editable": true,
    "display": true,
    "type": "text",
    "defaultValueFn": () => "Initial Default Value"
},
{
    "title": "Checkbox",
    "editable": true,
    "display": true,
    "type": "checkbox",
    "defaultValueFn": () => true
},
{
    "title": "Number",
    "editable": true,
    "display": true,
    "type": "number",
    "defaultValueFn": () => 123
}
```

### Recursive fields (To be documented)
### Checkbox
This is to support boolean fields. If the field is not present in the object, the edit modal shows it "unchecked" and saving does not set it. Otherwise that field is set as true or false (based on state). [Example](https://curefit.github.io/react-crux-examples/#/checkbox)

```
{
  "title": "Is Part Time ?",
  "editable": true,
  "display": true,
  "field": "isPartTime",
  "type": "checkbox"
}
```

### Datepickers
Datepicker is a cool widget to show fields which are dates and to modify them. We use react-datepicker to render dates. The underlying api needs to return the value which moment understands. If moment(<value>).format() returns a properly formatted date, CRUX will be able to handle it. Otherwise it will lead to errors.
[Example](https://curefit.github.io/react-crux-examples/#/datepicker)

```
{
  "title": "Date Of Joining",
  "editable": true,
  "display": true,
  "field": "joiningDate",
  "type": "datepicker"
}
```

### Datepickers With Time Select
Datepicker is a cool widget to show fields which are dates and to modify them. We use react-datepicker to render dates. The underlying api needs to return the value which moment understands. If moment(<value>).format() returns a properly formatted date, CRUX will be able to handle it. Otherwise it will lead to errors. Datepicker will also time select option
[Example](https://curefit.github.io/react-crux-examples/#/datepicker)

```
{
  "title": "Date Of Joining",
  "editable": true,
  "display": true,
  "field": "joiningDate",
  "type": "datepicker",
  "showTimeSelect": true
}
```

### Datepickers With Time Zone Selection and Time Selection
Datepicker is a cool widget to show fields which are dates and to modify them. We use react-datetime to render dates. The underlying api needs to return the value which moment understands. If moment(<value>).format() returns a properly formatted date, CRUX will be able to handle it. Otherwise it will lead to errors. Datepicker will also time select option

Here data will be stored as an object with ( date and timezone ) ex: joiningDate = { date: 2019-03-06 05:30:00.000Z, timezone: "Asia/Kolkata" }

```
{
  "title": "Date Of Joining",
  "editable": true,
  "display": true,
  "field": "joiningDate",
  "type": "datetimezonepicker"
}
```

### File/Image upload
This is to support fields that require a image/file upload. When _type_ is _imageUpload_, another field called _contentType_ becomes mandatory. Finally for upload a http post call to /content/:contentType/upload/ is made. If _width_ and _height_ are specified in the schema, they are also sent as part of form data with the file.
```
{
    editable: true,
    width: 100,
    height: 100,
    title: "App Image",
    field: "image",
    contentType: "image",
    type: "imageUpload"
},
```


### Custom Modal
This is to support that require a Custom Modal with Custom Button in Table. 

```
{
  "modelName": "employees",
  "title": "Employees with list of free-form Tags",
  "creationTitle": "Employee",
  "editModal": true,
  "fields": [
    {
      "title": "Name",
      "field": "name",
      "editable": true,
      "representative": true,
      "display": true
    },
    {
      "title": "Address",
      "field": "address",
      "editable": true,
      "display": true
    },
  ],
  "createModal": true
  "customModal": true,
  "customModalComponent": CustomModalComponent
}

// ModalComponent.tsx

class CustomModalComponent extends React.Component<any, any> {
    render() {
        return (<ModalComponent
            constants={CustomModalConstants}
            showModal={true}
            closeModal={this.props.closeModal}
            modalType={"CUSTOM"}
            successButtonLabel={"CLONE"}
            item={model}
            createOrModify={this.props.customModalSuccess}
            additionalModels={[]}
        />)
    }
}
```

### Custom Components
This is to support Custom Components with our edit/create Modal. 

```
{
  "modelName": "employees",
  "title": "Employees with list of free-form Tags",
  "creationTitle": "Employee",
  "editModal": true,
  "fields": [
    {
      "title": "Name",
      "field": "name",
      "editable": true,
      "representative": true,
      "display": true
    },
    {
        title: "Address",
        type: "custom",
        customComponent: customComponentView
    }
  ],
  "createModal": true
}

function customComponentView(model: model, additionalModels: any) {
    class CustomComponent extends React.Component<{}, {}> {
        render() {
            return <p>{model.address}</p>
        }
    }
    return CustomComponent
}
```

### Custom Edit Components
This is to support Custom Components with our edit/create Modal. This will allow us to create our own support with our own state.

```
{
  "modelName": "employees",
  "title": "Employees with list of free-form Tags",
  "creationTitle": "Employee",
  "editModal": true,
  "fields": [
    {
      "title": "Name",
      "field": "name",
      "editable": true,
      "representative": true,
      "display": true
    },
    {
        title: "Address",
        field: "address",
        type: "customedit",
        editable: true,
        customEditComponent: CustomEditComponent
    }
  ],
  "createModal": true
}

// Props for this CustomEditComponent is currentModal, additionalModels, parentModel, field, handleChange

export class CustomEditComponent extends React.Component<any, any> {

    constructor(props: any) {
        super(props)
        this.state = {
            address = "India"
        }
    }

    handleChange = () => {
        this.setState({ address = "America" })
        // React Crux change event props to be called here. To reflect changes in crux (redux)
        this.props.handleChange(this.props.field, value)
    }

    render() {
        return <div>
            <p>{this.state.address}</p>
            <button onClick={this.handleChange}>Change Address</button>
        </div>
    }
}
```

### Default Models
For a lot of values (e.g. enums, constants), typically its not desired to fetch them from the API server via http call. To support this, CRUX supports injecting of default models through the CRUX reducer. e.g.
```
// DefaultModels.tsx

const DefaultModels = {
    mediaTypes: [
        {
            typeId: "IMAGE",
            title: "Image"
        },
        {
            typeId: "VIDEO",
            title: "Video"
        }
    ],
    addressTypes: [
        {
            typeId: "HOME",
            title: "Home"
        },
        {
            typeId: "OFFICE",
            title: "Office"
        },
        {
            typeId: "OTHERS",
            title: "Other"
        },
    ]
}

// index.tsx (Main React App)
import { DefaultModels } from "./DefaultModels"

const appReducer = combineReducers({crux: CruxReducerFactory(DefaultModels), ...})
const store = createStore(
    appReducer,
    applyMiddleware(thunk, createLogger())
)
```
### Filtering and Ordering
Filtering and Ordering (Client Side) will be performed. Search Bar will shown above the Table. Based on search value, data will be loaded in Table
```
{
  "modelName": "employees",
  "title": "Employees with list of free-form Tags",
  "creationTitle": "Employee",
  "editModal": true,
  "enableSearch": true
  "fields": [
    {
      "title": "Name",
      "field": "name",
      "editable": true,
      "representative": true,
      "display": true
    },
    {
      "title": "Address",
      "field": "address",
      "editable": true,
      "display": true
    }
  ],
  "createModal": true
}
```

### Refreshing other models in creation / modification mode

### Dependent Dynamic Modelling
The Field will have conditionalField and ConditionalValue as their Attributes. The Field will be rendered only when conditionalValue matched with Conditional
Field Value
```
{
  "modelName": "employees",
  "title": "Employees with list of free-form Tags",
  "creationTitle": "Employee",
  "editModal": true,
  "fields": [
    {
      "title": "Name",
      "field": "name",
      "editable": true,
      "representative": true,
      "display": true
    },
    {
      "title": "Address",
      "editable": true,
      "display": true,
      "field": "address",
      "type": "nested",
      "fields": [
        {
          "title": "Address Type",
          "field": "type",
          "display": true,
          "editable": true,
          "type": "select",
          "foreign": {
            "modelName": "addressTypes",
            "key": "typeId",
            "title": "displayName"
          }
        },
        {
          "title": "Address Line",
          "field": "home",
          "display": true,
          "editable": true,
          "conditionalField": "type",
          "conditionalValue": "residential",
        },
        {
          "title": "Address Line",
          "field": "office",
          "display": true,
          "editable": true,
          "conditionalField": "type",
          "conditionalValue": "office",
        },
        {
          "title": "City",
          "field": "city",
          "display": true,
          "editable": true
        },
        {
          "title": "ZipCode",
          "field": "zipcode",
          "display": true,
          "editable": true,
          "type": "tinyinput"
        }
      ]
    }
  ],
  "createModal": true
}
```
### Styles
Config Based Styles Can be Applied to Components. 

#Hide Label
{
    title: "",
    field: "units",
    display: true,
    editable: true,
    type: "select",
    style: {
        hideLabel: true
    },
    foreign: {
        modelName: "timeUnits",
        key: "typeId",
        title: "title"
    }
}

#Border
{
    title: "",
    field: "units",
    display: true,
    editable: true,
    type: "iterable",
    style: {
        border: "none"
    },
    iterabletype: {
        type: "nested",
        title: "Scales",
        fields: [
            {
                title: "Smiley Type",
                editable: true,
                display: false,
                field: "smileyType",
                type: "text"
            }
        ]
    }
}

#Force Indent
{
    title: "",
    field: "units",
    display: true,
    editable: true,
    type: "nested",
    style: {
        forceIndent: true
    },
    fields: [
        {
            title: "Smiley Type",
            editable: true,
            display: false,
            field: "smileyType",
            type: "text"
        }
    ]
}

### Query Param Support With React Crux
We can give queryParams in config. It will append queryparams with every fetch call.

```
import * as React from "react"
import { CruxComponentCreator } from "@curefit/react-crux"

const constants = {
    modelName: "serviceAccess",
    title: "Service Access",
    creationTitle: "Service Access",
    createModal: true,
    editModal: true,
    largeEdit: true,
    stateRoot: "none",
    fields: [
        {
            title: "Service",
            field: "serviceName",
            representative: true,
        },
        {
            title: "Users",
            field: "users",
            type: "iterable",
            iterabletype: {
                title: "User",
                inlineEdit: true
            }
        }
    ]
}

const ServiceAccessComponent = CruxComponentCreator.create<ServiceAccess, ServiceAccessProps>(constants)

class ComponentWithQueryParams extends React.Component<{}, {}> {
    render() {
        return (<ServiceAccessComponent {...this.props} options={{ queryParams: { data: "1", title: "check" }}}/>)
    }
}

export {ComponentWithQueryParams}
```


### Fetching logic in CRUX
A crux component when mounted does the following in order
1. Parse the whole config.
2. Collects all modelNames (normal or foreign)
3. Filters distinct modelNames
4. Filters out those which are already present in redux store
5. Fetches the filtered models by making http calls to /model/:modelName in no particular order

# Examples
All the live examples can be found at https://curefit.github.io/react-crux-examples
The code for the examples can be found at https://github.com/curefit/react-crux-examples

Some example snippets have been copied below for convenience.

#### Table + Basic form with text inputs for create/modify/delete
Lets say we want to show a table of employees with 3 fields (name, employeeId, emailId) with a functionality to create, modify and delete employees 

```
const schema = {
    modelName: "employees", // http call to /model/employees
    title: "Employees", // Title for the table
    creationTitle: "Employee", // Create button will show "+ New Employee"
    createModal: true, // Enable creation of new employees through modal 
    editModal: true,
    largeEdit: true,
    stateRoot: "none",
    fields: [ // We have 3 fields - name, age, emailAddress
        {
            title: "Name",
            field: "name",
            representative: true,
            display: true, // We want to display it in table
            editable: true, // We want to be able to edit it
        },
        {
            title: "Age",
            field: "age",
            display: false, // We _dont_ want to display it in table
            editable: true, // We want to be able to edit it
        },
        {
            title: "Email Address", 
            field: "emailAddress",
            display: true, // We want to display it in table
            editable: true, // We want to be able to edit it
        }
    ]
}

const Employees = CruxComponentCreator.create<Employee, EmployeeWodProps>(schema)
export { Employees }
```

#### Table + Basic form with text inputs for create/modify/delete/Save As New
Lets say we want to show a table of employees with 3 fields (name, employeeId, emailId) with a functionality to create, modify, save as new and delete employees 

```
const schema = {
    modelName: "employees", // http call to /model/employees
    title: "Employees", // Title for the table
    creationTitle: "Employee", // Create button will show "+ New Employee"
    createModal: true, // Enable creation of new employees through modal 
    editModal: true,
    saveAsNew: true,
    largeEdit: true,
    stateRoot: "none",
    fields: [ // We have 3 fields - name, age, emailAddress
        {
            title: "Name",
            field: "name",
            representative: true,
            display: true, // We want to display it in table
            editable: true, // We want to be able to edit it
        },
        {
            title: "Age",
            field: "age",
            display: false, // We _dont_ want to display it in table
            editable: true, // We want to be able to edit it
        },
        {
            title: "Email Address", 
            field: "emailAddress",
            display: true, // We want to display it in table
            editable: true, // We want to be able to edit it
        }
    ]
}

const Employees = CruxComponentCreator.create<Employee, EmployeeWodProps>(schema)
export { Employees }
```

#### Table + Basic form with Readonly inputs for create/modify/delete
Lets say we want to show a table of employees with 4 fields (name, joiningDate, isPartTime, nicknames) with a functionality to create, modify and delete employees. Readonly attribute is applicable for all the components.

```
const schema = {
    modelName: "employees", // http call to /model/employees
    title: "Employees", // Title for the table
    creationTitle: "Employee", // Create button will show "+ New Employee"
    createModal: true, // Enable creation of new employees through modal 
    editModal: true,
    largeEdit: true,
    stateRoot: "none",
    fields: [ // We have 4 fields - name, joiningDate, isPartTime, nicknames
        {
            title: "Name",
            field: "name",
            representative: true,
            display: true, // We want to display it in table
            readonly: true // We want to be able to disable it
        },
        {
            "title": "Date Of Joining",
            "readonly": true,
            "display": true,
            "field": "joiningDate",
            "type": "datepicker"
        },
        {
            "title": "Is Part Time ?",
            "readonly": true,
            "display": true,
            "field": "isPartTime",
            "type": "checkbox"
        },
        {
            title: "Nicknames",
            field: "nicknames",
            type: "iterable",
            readonly: true,
            iterabletype: {
                type: "text",
                title: "Name"
            }
        }
    ]
}

const Employees = CruxComponentCreator.create<Employee, EmployeeWodProps>(schema)
export { Employees }
```

#### Multiple CRUX components on same page
Since components created using CRUX are actual react components, you can render as many CRUX components on a page or inside another component. Since they are all backed by same Redux store, they also share all the models and dont make redundant http requests if some of the underlying models are same.

```

const employeeSchema = {
    modelName: "employees",
    ...
}

const projectSchema = {
    modelName: "projects",
    ...
}

const Employees = CruxComponentCreator.create<Employee, EmployeeProps>(employeeSchema)
const Projects = CruxComponentCreator.create<Project, ProjectProps>(projectSchema)

export class EmployeeContainer extends React.Component<{}, {}> {
    render() {
        return <div>
            <Employees />
            <Projects />
        </div>
    }
}

```
#### Iterable of nested
One very common pattern is to have a field which is a list of objects. In CRUX terminology that translates to iterable of nested. The example below shows how to model it. The example if for products which typically have list of media attached to them. Each media object can either be a image or video and have a url.

```
{
    title: "Media",
    field: "media",
    display: false,
    editable: true,
    type: "iterable",
    iterabletype: {
        type: "nested",
        title: "Media",
        fields: [
            {
                title: "Media Type",
                field: "type",
                display: true,
                editable: true,
                type: "select",
                foreign: {
                    modelName: "mediaTypes",
                    key: "typeId",
                    title: "title"
                }
            },
            {
                title: "Media Url",
                field: "url",
                display: true,
                editable: true,
            }
        ]
    }
}
```
#### Iterable of nested ( Collapse Support)
Addition of Support for Collapsed Nested Iterable Component. Each Iterable component can be expanded based on necessity.

```
{
    title: "Media",
    field: "media",
    display: false,
    editable: true,
    type: "iterable",
    iterabletype: {
        type: "nested",
        title: "Media",
        nestedIterableCollapse: {
            default: true,
            title: "Banner"
        },
        fields: [
            {
                title: "Media Type",
                field: "type",
                display: true,
                editable: true,
                type: "select",
                iterableRepresentative: true,
                foreign: {
                    modelName: "mediaTypes",
                    key: "typeId",
                    title: "title"
                }
            },
            {
                title: "Media Url",
                field: "url",
                display: true,
                editable: true,
            }
        ]
    }
}
```
#### Pagination (Server Side Pagination)
Lets say we want to show a table of employees with 3 fields (name, age, emailAddress) with a functionality to create, modify and delete employees with server
side pagination. (i.e. server call will be pointed to /filter rather than /fetch)

```
const schema = {
    modelName: "employees", // http call to /model/employees
    title: "Employees", // Title for the table
    creationTitle: "Employee", // Create button will show "+ New Employee"
    createModal: true, // Enable creation of new employees through modal 
    editModal: true,
    largeEdit: true,
    stateRoot: "none",
    paginate: {
        defaultPageSize : 10,
        allowedPageSizes : [10, 50, 100, 500, 1000]
    },
    fields: [ // We have 3 fields - name, age, emailAddress
        {
            title: "Name",
            field: "name",
            representative: true,
            display: true, // We want to display it in table
            editable: true // We want to be able to edit it
        },
        {
            title: "Age",
            field: "age",
            display: false, // We _dont_ want to display it in table
            editable: true // We want to be able to edit it
        },
        {
            title: "Email Address", 
            field: "emailAddress",
            display: true, // We want to display it in table
            editable: true // We want to be able to edit it
        }
    ]
}

const Employees = CruxComponentCreator.create<Employee, EmployeeWodProps>(schema)
export { Employees }
```

# TBD
- Typings for schema
- Refactoring of schema into (displayOptions, editOptions, createOptions, deleteOptions)
- Defragment style options into one uniform way of specifying styles
- Create a UI to generate schema
- Removing hardcoding of /model in fetch urls
- For fetching models, create a proper DAG, do a topological sort and then fetch
