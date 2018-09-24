# CRUX

Crux is a simple to use client side library to create UI for CRUD operations on server side entities. Its best suited to create admin dashboards which typically have complex relationships between entities.

It is not a replacement for React or Redux or Bootstrap but rather a higher level abstraction that lets you create simple UI for CRUD operations by just writing a JSON config. CRUX reads this config and creates a React Component that you can add to your app.

If you use CRUX, you would not have to write HTML/JSX/TSX code.

### Quick Setup
- yarn add @curefit/react-crux
- Write the config and pass it to the factory method to create the component (config guide explained later)
```
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

const ServiceAccessComponent = BaseModelContainerCreator.create<ServiceAccess, ServiceAccessProps>(constants)
export {ServiceAccessComponent}
```
- Create the CRUX reducer by using the factory method
```
```
- Add the reducer to you react app
```
```
- Use the exported component in your react app like you do with any component.

### Dependencies
- react (insert version here)
- react-redux (insert version here)
- react-bootstrap (insert version here)

