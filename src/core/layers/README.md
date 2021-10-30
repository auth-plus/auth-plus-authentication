# LAYERS

There're 3 layers:

1. Services
2. Providers
3. Usecases

Where each layer can import between them and the layer above, i.e.: Provider can import Service, Usecase can import Provider, anything else it's forbidden.

## Example

```js
const s = new Service()
const p = new Provider(s)
const u = new Usecase(p)
```

## Responsability

### Usecase

This layer it's responsible for business rule, where they use interface for interact with database, or anything else.

### Provider

This layer it's responsible for interact with database, message broker, cache

### Service

This layer it's responsible for micro interactions with data (create hash, transform and etc)

## Exeception

The only exeception is the logger file which for better usability you can import anywhere you want to log. This is ok because in this system there's no side-effect for this function and there's no need to test if this it's executed