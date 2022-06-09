---
id: api_authentication
title: API Authentication
---

## Introduction

Along with user authentication for the browser, Voltis also provides you with API Authentication and implements this in a very simple and secure manner. As user authentication uses the `SessionProtector`, Voltis uses the `TokenProtector` for API authentication.

The token driver is responsible for inspecting the API token sent with a request to a protected API route and will validate the request and allow further execution if the API token is deemed valid and has not expired, it will match this data within the database against a user.

## Defining API Routes

For protected API routes, you must define all your API endpoints inside the `api.php` routes file at `app/routing/api.php`. In there you can define new API only routes and by default a route group is already setup to use the Voltis Authentication System and the API protector. When you send API requests you need to send a valid client ID and API token to pass authentication.

If your application uses API routes which don’t require authentication, you can just define these routes outside the default provided route group inside `api.php`.

### Protecting API Routes

As mentioned earlier a routing group is already setup for you and it uses the Voltis authentication service and API tokens to validate API endpoints that you define within the group.

```
Route::group(['prefix' => '/api', 'middleware' => 'Auth:api'], function()
{
    // ...
});
```

A prefix is also defined within the API group as well but you may change this if you like. The authentication middleware is passed the `api` parameter which relates to your configured protectors in `config\auth.php`. By default the `Auth` Middleware does not require a parameter as the default setup is to use the `session` protector but for an API, we need to define that we want to use the `api` protector which uses the `token` driver to authenticate your API requests, you can see this configuration inside `auth.php`.

The `Auth` Middleware is defined for you already inside `config\middleware.php` as `\App\Middleware\Authenticate::class` which extends `Polyel\Auth\Middleware\Authenticate`.


### API Authentication Outcomes

After you have assigned the `Auth:api` Middleware to one of your API endpoints, you can perform certain actions based on when a user is unauthorized or authorized by using the App level Middleware located at: `app/Http/Middleware/AuthenticateMiddleware.php`, which contains two methods for interacting with API authentication:

```
public function unauthorized()
{
	return response([
		'error' => [
			'status' => 401,
			'message' => 'Authorization failed'
		]
	], 401);
}

public function authorized()
{
	// ...
}
```

Using the unauthorized method, you can perform actions when an API request is deemed invalid due to either the client ID or API token being incorrect. By default a 401 Unauthorized response is sent back with a JSON body, giving an error code and message.

The second method, `authorized`, allows you to perform actions when a user is deemed valid and their client ID and API token has passed authentication, most of the time you probably don’t need to do anything here, so the default is to do nothing but you are free to use this method how you like.


## Database Consideration

For API authentication, the table name must be called `api_tokens` and contain the following columns and data types:

- `id varchar(36)`
- `token_hashed varchar(128)`
- `user_id int(11)`
- `token_last_active datetime` 
- `token_expires_at datetime`

You may change the `api_tokens` table name by altering the configuration for `api_database_token_table` in your `auth.php` configuration file.

## Configuration

All API configuration options can be found within ` config\auth.php`. You can find the options for how the API protector is setup, where the token driver is set and a few API related settings, which all have detailed comments to explain what they do.

## Generating Tokens

After you have your `api_tokens` table setup and configured, you are now ready to start using the provided methods to generate API tokens for your users. Voltis provides you with a method called `generateApiToken` which will render an API token along with a client ID. When calling this method, after generating the token and client ID it will by default save this to the database but return the `clientId`, `token` and `hash` as an array so you can process this further if you wish. The token returned is the raw API token but the token stored in `api_tokens` is a `sha512` signed hash, using the encryption key you have in your `env` file.

If you want to only generate API tokens and not have them automatically stored in `api_tokens` you can pass false to the `generateApiToken` method like so:

```
use Polyel\Auth\AuthManager;

$this->auth->generateApiToken($saveToDatabase = true, $userId = null);
```

As you can see from the example above we can also pass in a custom user ID to generate a API token for a specific user, by default if the user ID is not defined, Voltis will use the ID from the current authenticated user. The token created is generated using PHPs cryptographically secure method `random_bytes` and the token is returned using `bin2hex` at 160 characters, stored in the database as a hashed `sha512` value.

A collision check will be performed to make sure of the unlikely event where a Client ID already exists. When you generate API tokens, the array returned gives you the chance to show the raw API token to your users, you only really want to show this once for security reasons as the stored token is hashed.

The client ID that gets generated will look something like `d9c73454-f693-ce6b-45bc-400e8e80dca5` and is used so you are able to create more than one API token per user, giving you the ability to generate tokens per device etc. The client ID is not generally something you need to keep secure but is probably best to keep safe, the actual API token is what is used for final authentication and is what needs to be kept a secret.

To make it easy to generate API tokens for refreshing them, you can use the `refreshApiToken` method which will return the hashed value of the new token and the plain-text token for you to display to the user as a refreshed token. The new hashed value is updated in the database but the client ID will stay the same, the token expiration time is also updated.

```
use Polyel\Auth\AuthManager;

$token = $this->auth->refreshApiToken($clientId);
```

If you only want to generate a unique client ID and not create or save an actual API token, you are free to call the internal method used to create client IDs which is called `generateApiClientId`.

You may also quickly generate API tokens only by calling the `generateApiTokenOnly` method.

<div class="noteMsg">Voltis gives you the easy ability to generate secure API tokens and as they are stored as a hashed value, you will need to use the provided methods to generate tokens but also implement an API token management interface for your users and web frontend for your application. When tokens are created you should store the hashed value and show the plain-text token to the user for them to keep and as a one-time display.</div>

## Revoking API Tokens

#### Removing a token

To revoke an API token using the actual raw unhashed token itself, you may use:

```
use Polyel\Auth\AuthManager;

$this->auth->revokeApiToken($token);
```

#### Removing a token by Client ID

To revoke an API token by using the client ID, you may use:

```
use Polyel\Auth\AuthManager;

$this->auth->revokeApiTokenUsingClientId($clientId);
```

#### Removing all tokens by the user ID

To revoke all API tokens for a user, based on the user ID, you may use:

```
use Polyel\Auth\AuthManager;

// Use the current authenicated user ID to remove all tokens
$this->auth->revokeAllApiTokens($userId = null);
```

## Token Expiration

When you generate new API tokens for a user they are assigned a token lifetime, by default this lifetime is 1 year, giving the token a long life, meaning the user does not have to keep creating new tokens frequently. You may change this lifetime by changing `api_token_lifetime` located at `config\auth.php`. Whenever you generate a new token with `generateApiToken` or refresh a token with `refreshApiToken`, they will use the configured token lifetime value to create the `token_expires_at` value that gets stored inside `api_tokens`.

Along with the `token_expires_at`, Voltis will automatically update the `token_last_active` every time it successfully authenticates, allowing you to track when API tokens were last used.

If the token lifetime expires then Voltis will treat any requests sent with an expired lifetime as invalid and not allow the request to process any further. Either a user needs to create a new token, refresh their token or you can extend the expiration using the `extendApiTokenLifetime` method and pass over how much you want to add to the lifetime of the token, for example:

```
use Polyel\Auth\AuthManager;

$this->auth->extendApiTokenLifetime($clientId, '+1 month');
```

## Using the Client ID & API Token

Voltis supports a number of ways that you can attach the client ID and API token to your requests, the client ID allows Voltis to figure out which API token and user to validate against and the API token from your request is validated against the hash stored in the database. Let’s take a look at how we can provide these credentials during a request...

### Query Parameters

When sending a `GET` request to your API you may include the client ID and API token as query strings within your URL:

```
$url = "https://example/api/user/books?client_id=$clientId&api_token=$token";
```

### Request Body

When dealing with `POST`, `PUT`, `PATCH` or `DELETE` API requests you can use the request body to send the client ID and API token.

JSON Example:

```
{
    "client_id": $clientId,
    "api_token": $token
}
```

The request body can be either form parameters or JSON data. Make sure you set the correct content type header of either `application/json` or `application/x-www-form-urlencoded`.

### Headers & Bearer Token

A Voltis API application can perform API authentication through the use of Bearer API tokens, all you need to do is pass the client ID and the token using HTTP headers:

```
ClientID: <your-client-id>
Authorization: Bearer <your-api-token>
```

These headers are case sensitive and the API token requires the Bearer authentication type to be in front of the token.

While you may use headers to fully interact with your API, you can mix and match how you provide the client ID and token, for example, you could pass the client ID inside the request body and the API token as a header etc. But remember this mixing must respect the request verb types.