---
id: routing
title: Routing
---

## Creating New Routes

A request to your application is filtered through using routes that you define. A basic route can be defined by using the route files located in `/app/routing`, the most common being `web.php`:

```
// Inside /app/routing/web.php

Route::get("/", "HomeController@Index");
```

This defines what happens when the index route is called by a request to the application, the result will be that the `Home` controller will be used and the `Index()` function will be called.

<div class="warnMsg">A fatal error will be thrown upon server boot if a route already exists when trying to add another which is already registered</div>

Another route example:

```
Route::get("/pets/dog", "PetController@dog");
```

Above is another example how you can route requests to different controllers and organise them.

It’s best to keep your routes expressive and short so your application is maintainable and easy to navigate when writing Controllers or Models, discussed later.

By defining a web route, you can use a browser to access this page.

<div class="noteMsg">All routes are automatically loaded when the HTTP server is booted up, all routes are saved in memory thus, already cached. You will need to restart your server for new routes to take affect.</div>

## Routing Parameters

We’ve only gone through how to define static routes but eventually you might want to accept parameters and process them from the URL. Polyel has the ability to accept route parameters which let you take in data from the request and URL. They are defined by default using `{ }`:

```
Route::get("/user/profile/{id}", "UserController@showProfile");
```

This route defines a dynamic URL where `{id}` will be passed along to the `showProfile()` function inside a Controller called `User`. You can be expressive with how you accept data in URLs by using this feature and accessing the parameters inside the Controller.

```php
namespace App\Controllers;

class UserController extends Controller
{
    public function showProfile($id)
    {
        echo $id;
    }
}
```

Route parameter names should consist of alphanumeric characters and not contain `-`, instead using camelCase or underscores `_` to seperate words.

<div class="noteMsg">The parameter name you choose does not matter, it is purely to make development easier, route parameters are passed into the Controller function in the order they sit in the URL you define.</div>

Note: Any type-hinted services should come first before any Route parameters in controller methods.

### Multiple Route Parameters

It’s possible to have as many route parameters as you need, for example:

```
Route::get("/blog/posts/{postID}/comment/{commentID}", "Post@showPost");
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

## Route Redirecting

If you need to redirect a URL to another destination you can use `Route::redirect()`:

```
Route::redirect("/blog", "/blog/posts", $statusCode = 302);
```

By default the HTTP redirect status code is set to 302 but you can pass in your own code if you need to but it is not required when using redirection like this.

These redirect routes are defined inside your `web.php` file, just like any `Route::get()` or `Route::post()` for example.

### Redirecting Outside

Very simple, all you need to do is set a full URL like so:

```
Route::redirect("/direct/away", "https://www.google.co.uk", 301);
```

## Optional Routes

If you require a route which has optional parameters, you should define those routes separately. One route with the optional parameter and one without.

```
Route::get("/events/{eventName}", "EventController@showEvent");

Route::get("/events", "EventController@showEvents");
```

Notice the difference between the two controller actions. This way both routes are supported and seperated into their own directions.