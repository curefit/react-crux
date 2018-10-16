# react-crux

CRUX is a simple to use client side library to create UI for CRUD operations on server side entities. Its best suited to create admin dashboards which typically have complex relationships between entities.

It is not a replacement for React or Redux or Bootstrap but rather a higher level abstraction that lets you create simple UI for CRUD operations by just writing a JSON config. CRUX reads this config and creates a React Component that you can add to your app.

Since its a client side library, it is completely agnostic to server side tech stack. 

If you use CRUX, you would not have to write HTML/JSX/TSX code.

### Quick Setup
- yarn add @curefit/react-crux
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

const appReducer = combineReducers({crux: CruxReducerFactory(DefaultModels), user: UserReducer})

...

const store = createStore(
    rootReducer,
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
    "react": "^16.4.2", // Duh
    "react-bootstrap": "^0.32.3", // Its pretty cool
    "react-bootstrap-typeahead": "^3.2.2", // For typeahead component
    "react-datepicker": "^1.6.0", // For datepicker
    "react-dropzone": "^5.0.1", // For file upload component
    "react-redux": "^5.0.7", // Duh
    "superagent": "^3.8.3" // For upload request
  }
```
# Specification

### Basic Schema
- **modelName**: The source name. Crux first looks for this locally. If not present, a http call to /model/:modelName will be made to fetch the list of models. For this to work, a controller on the server side needs to listen to this route
- **title**: The title for the table
- **creationTitle**: Title for the create button. (+ New <creationTitle>)
- **createModal**: If false, option to create new object wont come in the UI. Also note that disabling creation here is not sufficient. You should also make sure that your server does not support creation of this model.
- **editModal**: If true, option to edit a row in the table appears in the last column. Also note that disabling edit here is not sufficient. You should also make sure that your server does not support modification of this model.
- **largeEdit**: (false by default) - If true, a large modal appears instead of a simple default bootstrap modal. This is helpful if your objects are pretty complex and large.
- **stateRoot** - TBD
- **fields** - An array of all the fields in the object. Each field needs to have the following
   * _title_ - Name of the field
   * _field_ - The key in the model to access this field (e.g. "name" field inside "Employee")
   * _representative_ - Set to true if this field is representative of the parent object. Used to show in other select menus etc. Typically name/title fields are representative
   * _type_ - If not set, type is assumed to be a simple text field edited using an input text HTML element
        - _select_ - For dropdowns with single select option. Detailed explanation later.
        - _iterable_ - For lists (of strings or objects or selects). Detailed explanation later.
        - _nested_ - For objects which have fields of their own. Detailed explanation later.
        - _typeahead_ - For searching within dropdown. Specification is same as select. It is a local search. Remote search is currently not supported.
        - _tinyinput_ - For very small texts.
        - _bigtext_ - For large blobs of text.
        - _custom_ - For injecting your own custom component to render this field. Requires another field called _customComponent_ (defined later)
    * _displayChildren_ - Supports only one value - "inline". Causes subfields to be rendered side by side instead of one below the other (which is the default behaviour if _displayChildren_ is not present in schema)
    * _wysiwyg_ - If present and true, adds support to show a live preview will editing the object. Requires another field called _customComponent_
    * _customComponent_ - Required for wysiwyg and for _type_ "custom". 

### Select/Typeahead fields
Most common use case after text fields is to have a field whose value is restricted to a set of values. This set might be small and static and so might be hardcoded as enums or constants. This set might be big and dynamic so its values might come from another api or collection in the database. For CRUX schema it does not matter.

### Iterable fields
Whenever one of fields is a list of other objects/strings, set _type_: "iterable". To define the underlying type use the field _iterabletype_. It follows the same schema as field and supports all features mentioned above
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
### Nested Fields
If the field is itself an object containing more fields, its _type_ should be "nested". A field with "nested" _type_ should have another mandatory field called _fields_. This is a list of all fields inside the nested object and each field follows the same schema as above.

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

### Refreshing other models in creation / modification mode

### Dependent Dynamic Modelling


# Examples

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

# TBD
- Pagination support
- Typings for schema
- Refactoring of schema into (displayOptions, editOptions, createOptions, deleteOptions)
- Defragment style options
