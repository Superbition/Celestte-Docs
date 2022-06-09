---
id: routing
title: Routing
---

## Creating New Routes

A request to your application is filtered through using routes that you define. A basic route can be defined by using the route files located in `routing/web.php`:

```
Route::get("/", function() {
    return 'Hello World!';
});
```

This defines what happens when the index route is called by a request to the application, the result will be that the Closure function will be called and `Hello World!` will be displayed.

By defining a web route, you can use a browser to access the route and see your `Hello World!` result.

<div class="warnMsg">A fatal error will be thrown upon server boot if a route already exists when trying to add another which is already registered</div>

<br/>

<div class="noteMsg">All routes are automatically loaded when the HTTP server is booted up, all routes are saved in memory thus, already cached. You will need to restart your server for new routes to take affect.</div>

## Routing Parameters

We’ve only gone through how to define static routes but eventually you might want to accept parameters and process them from the URL. Polyel has the ability to accept route parameters which let you take in data from the request and URL. They are defined by using `{ }`:

```
Route::get("/user/profile/{id}", function ($id) {
    echo $id;
});
```

This route defines a dynamic URL where `{id}` will be passed to the Closure function.

Route parameter names should consist of alphanumeric characters and not contain `-`, instead use camelCase or underscores `_` to seperate words.

<div class="noteMsg">The parameter name you choose does not matter, it is purely to make development easier, route parameters are passed into the Closure function in the order they sit in the URL you define.</div>

<br/>

<div class="warnMsg">Any type-hinted services should come first before any Route parameters in controller methods.</div>

### Multiple Route Parameters

It’s possible to have as many route parameters as you need, for example:

```
Route::get("/user/{name}/age/{age}", function($name, $age) {
    return $name . ' ' . $age;
});
```

### Parameter Tag Configuration

By default route parameters are detected by Polyel using the `{ }` tag. This can be changed if you wish but it is not recommended to use other characters. However, this can be changed by altering the config inside `/config/router.php` and changing ` routeParameterTag`.

## Routing HTTP Methods

Polyel allows you to register routes based on the HTTP method and makes the following available to you:

```
Route::get($url, $controller);
Route::post($url, $controller);
Route::put($url, $controller);
Route::patch($url, $controller);
Route::delete($url, $controller);
```

## Spoofing HTTP Methods

Because HTML forms can only send `GET` or `POST` requests, you can use a special hidden `http_method` input to spoof the type of request you want to send from a HTML form. So whenever you want to send a `PUT`, `PATCH` or `DELETE` request inside a HTML form, you must spoof the method using `http_method` from a hidden field:

```
<form action="/profile/update" method="POST">
    <input type="hidden" name="http_method" value="DELETE">
    {{ @csrfToken }}
</form>
```

The form above will send a `POST` request but it will be converted and be treated just like a `DELETE` request because it is sending the `http_method` field.

To make things easier, you can use the `@method` view directive to include the `http_method` field for you:

```
<form action="/profile/update" method="POST">
    {{ @method(DELETE) }}
    {{ @csrfToken }}
</form>
```

## CSRF Protection

When making `POST`, `PUT`, `PATCH`and `DELETE` routes where you intend to use HTML forms or AJAX requests to interact with your server, you need to include the CSRF token to protect your application from CSRF attacks, please visit the [CSRF documentation](/docs/using_polyel/csrf_protection) for more details.

```
<form method="POST" action="/update/profile">
    
    {{ @csrfToken }}

</form>
```

## Route Redirecting

If you need to redirect a URL to another destination you can use `Route::redirect()`:

```
Route::redirect("/blog", "/blog/posts", $statusCode = 302);
```

By default the HTTP redirect status code is set to 302 but you can pass in your own code if you need to but it is not required when using redirection like this.

These redirect routes are defined inside your `web.php` file, just like any `Route::get()` or `Route::post()` for example.

### Redirecting Away

Very simple, all you need to do is set a full URL like so:

```
Route::redirect("/direct/away", "https://www.google.co.uk", 301);
```

## Optional Routes

If you require a route which has optional parameters, you should define those routes separately. One route with the optional parameter and one without.

```
Route::get("/events/{eventName}", function($eventName) {});

Route::get("/events", function() {});
```

Notice the difference between the two controller actions. This way both routes are supported and seperated into their own directions.

## Routing Groups

You can use routing groups for when you need to attach a prefix or middleware to multiple routes but don't want to perform this action for every route that shares the same attributes.

<div class="noteMsg">Routing groups are especially helpful for when you are building API routes inside <code>/app/routing/api.php</code> as you can attach prefixes and middleware across the whole API defined routes, but you can still use groups in your normal web routes as well.</div>

<br/>

For example, here is a group which shares the same prefix:

```
Route::group(['prefix' => '/api'], function()
{

    Route::get("/create", function()
    {
        // ...
    });

    Route::group(['prefix' => '/data'], function()
    {
        Route::get("/get", function()
        {
            // ...
        });

        Route::get("/set", function()
        {
            // ...
        });

        // ...
    });

});
```

The example above demonstrates a range of functionality by the Polyel Router, you can nest Routing Groups with different attributes. Each route being defined will always use the attributes from the parent first, so the `/api` prefix gets applied first and then the `/data` prefix for routes within that group.

As you have seen, we can apply prefixes to our routing groups but we can also apply middleware as well. This is useful for when you want multiple routes to share the same middleware but don’t want to define that middleware manually for every route, so we can set it as an attribute:

```
Route::group(['prefix' => '/api', 'middleware' => 'auth:api'], function()
{

    Route::get("/create", function()
    {
        // ...
    });

    Route::group(['prefix' => '/data', 'middleware' => 'ApiCounterMiddleware'], function()
    {
        Route::get("/get", function()
        {
            // ...
        });

        Route::get("/set", function()
        {
            // ...
        });

        // ...
    });

});
```

From the example above, the `auth` middleware is applied to all routes but only the second routing group uses the second middleware ` ApiCounterMiddleware`.

You can also define multiple Middleware in a single group by using an array:


```
Route::group(['prefix' => '/api', 'middleware' => ['auth:api', 'ApiCounterMiddleware']], function()
{
    // ...
});
```