# scs-dependency-visualizer

## 1. usage

```
mkdir my-project
touch components.yml # put in some stuff there, see 2. component definition

npm i scs-dependency-visualizer
npx scs-dependency-visualizer -c components.yml
```

## 2. definition config

### System Definitions

#### Properties:

##### `definitions`

A list of definitions that are reflecting the core documents that then describe the different systems. The `definitions` property describes the order of appearance in the main menu.

Each definition describes one definition-file that is loaded from the provided source defined with the `href` property.

By default the first definition is loaded and displayed.

**Scope:** root, `definitions`

##### `name`

describes the name of a definition, which is used as navigation label.
By default the URI slug is generated from the name, see RFC 3986

**Scope:** `definitions`

##### `slug`

can be provided in addition to a name, which will provide an URI slug independently from the name.

**Scope:** `definitions`

##### `href`

the URI where the definition file should be retrieved from.

URIs must be **absolute**. If no host is provided the `X-Forwarded-For` or `Host` header of the request to the SCS-Dependency Visualizer is used.

**Scope:** `definitions`

##### `secret`

The name of one of the `secrets` defined in the same definitions file. See "_Authorization / Secrets_" for more information.

**Scope:** `definitions`

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

##### `type`

The type is describing the Authentication method that should be used.

**Scope:** `secretConfig`

**Possible Values:**

- `basic-auth`
- `cookie-secret`

##### `config`

`config` can be used, when the secret should be put in plain text to the definitions config. The possible child properties are related to the `type` property.

For `basic-auth` it is:

- `user`
- `password`

For `cookie-secret` it is:

- `cookieName`
- `cookieValue`

**Scope:** `secretConfig`

##### `env-based`

`env-based` should be used when you are using secrets in production environments. It accepts the same child properties as config but expects the name of Environment Variables reflecting the values of the properties instead of putting plain text values in there.

**Scope:** `secretConfig`

##### `user`

defines the "_username_" used in basic authentication challenges

**Scope:** `config`, `env-based`

##### `password`

defines the "_password_" used in basic authentication challenges

**Scope:** `config`, `env-based`

##### `cookieName`

defines the "_cookieName_" used in cookie secret challenges. A cookie with this name will be attached to each request referencing the given secret. The value of that cookie is provided by the `cookieValue` property.

**Scope:** `config`, `env-based`

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

## TODOs

- [ ] Caching of Definitions
