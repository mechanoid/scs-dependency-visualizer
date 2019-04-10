# scs-dependency-visualizer

## 1. quick start

```
mkdir my-project
npm i scs-dependency-visualizer
touch scs-dep-viewer.yml # put in a main definition config, see "2. definition config"

npx scs-dependency-visualizer -p 5678 -c scs-dep-viewer.yml
```

Examples of the main definition config and a definition file, can be found in this repository in the `sample` directory.

### CLI Usage

When you run

```
npm i scs-dependency-visualizer
npx scs-dependency-visualizer -h
```

you should get an output pretty similar to this:

```
Usage: scs dependency-visualizer [options] [command]

Commands:
  help     Display help
  version  Display version

Options:
  -c, --config   the definition configuration path. A file defining which component defintions are available. (defaults to "")
  -h, --help     Output usage information
  -p, --port     the server port, where the service is listening to. Manually exporting PORT also works
  -s, --static   local path, relative to the invoked process, that will be served static in the mounted application root in the form of mount-path=folder-path
  -v, --version  Output the version number
```

#### serving definition files:

While the main definition file is loaded via file lookup, this tool loads all definitions via HTTP. This allows to serve the definitions alongside the services and applications that should be described.

If you want to start quickly you can serve a static definition folder by calling the `-s` or `--static` flag of the command line interface.

E.g.:

```
npx scs-dependency-visualizer -p 5678 -c sample/scs-dependency-viewer.yml -s /sample=./sample
```

## 2. definition config

### System Definitions

The systems definition file describes the structure of the tooling.
The included definitions are reflecting the core documents that then describe the different systems.

#### Properties:

##### `definitions`

A list of `definition` blocks. The `definitions` property describes e.g. the order of appearance in the main menu.

**Scope:** `root`, `definitions`

---

##### `definition`

Each `definition` describes one definition-file that is loaded from the provided source defined with the `href` property.

By default the first definition is loaded and displayed.

**Scope:** `definitions`

---

##### `name`

describes the name of a definition, which is used as navigation label.
By default the URI slug is generated from the name, see RFC 3986

**Scope:** `definition`

---

##### `slug`

can be provided in addition to a name, which will provide an URI slug independently from the name.

**Scope:** `definition`

---

##### `href`

the URI where the definition file should be retrieved from.

URIs must be **absolute**. If no host is provided the `X-Forwarded-For` or `Host` header of the request to the SCS-Dependency Visualizer is used.

**Scope:** `definition`

---

##### `secret`

The name of one of the `secrets` defined in the same definitions file. See "_Authorization / Secrets_" for more information.

**Scope:** `definition`

#### Example:

```
definitions:
  - name: local definition # served via --static
    slug: local-definition
    href: /sample/components.yml
    secret: my-basic-auth

    definitions:
      - name: remote definition
        href: http://localhost:5678/sample/components.yml
        secret: my-cookie-secret
```

### Authorization / Secrets

As the dependency viewer is fetching the resources from server side and those resources might be protected you can provide credentials to the component lookup.

At the moment only "_Basic Auth_" and providing a "_Cookie Secret_" is supported. A "_Cookie Secret_" is then send with across the component lookup request, and can be checked for existence. Both can be configured directly inside of the Definition file or referenced to an Environment Variable.

**And yes, those methods are not save. Please consider a VPN or similar access control for retrieving the documents.**

#### Properties:

##### `secrets`

Provides a map `[name, secretConfig]` of secrets that can be passed alongside to component requests. Basic Auth secrets are supported as well as just passing some arbitrary HTTP cookie alongside to the component lookup.

For example the existence of that cookie can then be checked by the component source. This is especially useful in situations where the same resources are protected via an Authorisation header, so that it cannot be used for Basic Authentication.

Each map entry consists of a name and a secret config.

**Scope:** `root`

---

##### `type`

The type is describing the Authentication method that should be used.

**Scope:** `secretConfig`

**Possible Values:**

- `basic-auth`
- `cookie-secret`

---

##### `config`

`config` can be used, when the secret should be put in plain text to the definitions config. The possible child properties are related to the `type` property.

For `basic-auth` it is:

- `user`
- `password`

For `cookie-secret` it is:

- `cookieName`
- `cookieValue`

**Scope:** `secretConfig`

---

##### `env-based`

`env-based` should be used when you are using secrets in production environments. It accepts the same child properties as config but expects the name of Environment Variables reflecting the values of the properties instead of putting plain text values in there.

**Scope:** `secretConfig`

---

##### `user`

defines the "_username_" used in basic authentication challenges

**Scope:** `config`, `env-based`

---

##### `password`

defines the "_password_" used in basic authentication challenges

**Scope:** `config`, `env-based`

---

##### `cookieName`

defines the "_cookieName_" used in cookie secret challenges. A cookie with this name will be attached to each request referencing the given secret. The value of that cookie is provided by the `cookieValue` property.

**Scope:** `config`, `env-based`

---

##### `cookieValue`

defines the "_cookieValue_" used in cookie secret challenges. A cookie with this value will be attached to each request referencing the given secret. The name of that cookie is provided by the `cookieName` property.

**Scope:** `config`, `env-based`

#### Example:

```
secrets:
  my-basic-auth:
    type: basic-auth
    # config:
    #   user: cleartext_user
    #   password: cleartext_password
    env-based:
      user: USER_ENV_VAR_NAME
      password: PASSWORD_ENV_VAR_NAME
  my-cookie-secret:
    type: cookie-secret
    # config:
    #   cookieName: cleartext_user
    #   cookieValue: cleartext_
    env-based:
      cookieName: COOKIE_NAME_ENV_VAR_NAME
      cookieValue: COOKIE_VALUE_ENV_VAR_NAME
```

## 3. definition syntax

Each definition provided in the `definitions` property list describes a system description. These documents are dedicated to describe a system dependency flow diagram and a dependency sequence diagram with a minimal configuration.

### Root Properties:

#### `clients`

List of available client-types. Those are represented in the filter bar as client filter. Those client-types can be assigned to a component to mark them as a client of this type. See `clientType`.

**Scope:** `root`

---

##### Example for `clients`:

```
clients:
  - browser
  - mobile
```

---

#### `connectionTypes`

Each component or resource dependency can be marked with a connection type. When a connection is marked as a certain connection type it can be toggled in the filter bar. See `type` property of a dependency.

**Scope:** `root`

---

##### Example for `connnectionTypes`:

```
connectionTypes:
  - client_request
  - pass_through
  - api
```

---

#### `components`

`components` is the main root entry and it is a required property.

It is a list of `component` entries.

**Scope:** `root`

### Component Properties:

#### `component`

`component` entries are the heart of this tool. A component is the main building block of the resulting diagrams. The core concept of components is that they might be linked directly via `dependencies`, may have resources, or might also have more `components` included. If a component has sub `components` it should be marked as `type` `group`.

**Scope:** `components`

---

#### `name`

component name

**Scope:** `component`

---

#### `type`

A component can be marked as a `group` by setting its `type` to `group`. Other types are yet not specified and for non group components the `type` property can be ommitted.

A group is encapsulating a bunch of other components.

**Scope:** `component`

---

#### `clientType`

E.g you may group an iOS and Android component as mobile clients.

**Scope:** `component`

---

#### `dependencies`

A list of `dependency` blocks. Dependencies are the simplest way to mark a connection between two components. It is a general statement that two systems are somehow connected. `resources` give you the ability to specify more detailed what resources make connections to other components.

For more information of dependency properties, see **"Dependency Properties"**.

**Scope:** `component`

##### Dependencies Example:

```
components:
  - name: my-component
    dependencies:
      - component: other-component
        type: api # one of connectionTypes
      - component: another-component
        type: ajax # one of connectionTypes

  - name: other-component
  - name: another-component
  ...
```

---

#### `resources`

A list of `resource` blocks. Resources build the heart of the sequence diagrams.

For more information of resource properties, see **"Resource Properties"**.

**Scope:** `component`

##### Resources Example:

```
components:
  - name: my-component
    resources:
      - relName: my-component:my-landing-page
        dependencies:
          - component: other-component
            relName: other-component:some-transclude
            type: api

  - name: other-component
    resources:
      - relName: other-component:some-transclude
        # when this link-relation is called, it also has dependencies
        dependencies:
          - component: another-component
            relName: another-component:some-ajax-include
            type: ajax # one of connectionTypes

  - name: another-component
    resources:
      - relName: another-component:some-ajax-include

  ...
```

### Dependency Properties:

#### `dependency`

Describes a direct connection to a `component`. A dependency can be assigned with a `type`.

**Scope:** `dependencies`

---

#### `component`

The name of the component this dependency should draw a connection to.

**Scope:** `dependency`

---

#### `type`

Marks a dependency as a specific connection type, which then can be represented in different styles and toggled in the filter bar.

The `type` value must be one of the given `connectionTypes`.

**Scope:** `dependency`

---

#### `relName`

A `resource` dependency should have a `relName` property, that explains which resources is called in the dependent component.

**Scope:** `dependency`

### Resource Properties:

#### `resource`

A `resource` block describes a direct _connection to a resource_ of another `component`.

**Scope:** `resources`

---

#### `relName`

A `resource` is identified by a link relation name, or short `relNAme`. Each HTTP resource of a service can be targeted.

**Scope:** `resource`

---

#### `dependencies`

A `resource` might have `dependencies` to other components. A `dependency` of a resource behaves like a dependency of a `component`,
but additionally it might also specify a `relName`.

**Scope:** `resource`

## TODOs

- [ ] Caching of Definitions
- [ ] Configuration of styles for connection Types
