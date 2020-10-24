---
id: middleware
title: Middleware
---

## Introduction

In Polyel there is a Middleware mechanism that allows you to filter incoming HTTP requests and act upon those requests during two stages in your application; the two stages being before and after.

A good example is you might create a Middleware to check that a user has permission to view a certain page and if not, you redirect them to the login screen or display an error message.

Middleware can be used for more than just authentication though, you might create a Middleware to store logs of user actions or add additional HTTP headers to your responses.

Polyel provides you with some default Middleware out of the box, such as CSRF protection or a Middleware to redirect users if trying to access a page only intended for guest users. All this Middleware can be found within the ` app\Http\Middleware` directory.

## Creating Middleware

To create a new Middleware, you can use the Polyel command `middleware`:

```text
php polyel middleware:create LogRequestMiddleware
```

You can use `middleware create` to define a new Middleware and this command will create a new class for you and place it in the appropriate directory for you, created from the default Middleware definition.

All Middleware is located in `app\Http\Middleware`.

When trying to mentally understand how Middleware works, think of it as “layers” your application has to pass through in order for the request to continue deeper into your application. With each layer that the HTTP request goes through, the more that request is closure to the core action and with each layer, the request can be altered and rejected early on.

<div class="noteMsg">When Middleware is executed during a request it is all resolved through the dependency injection container from the HTTP Kernel, meaning you can type-hint any extra dependencies you may need within your middleware’s class constructor to access other services.</div>

## Before and After Middleware

There are two types of Middleware that you can create, the first being a “before” and "after" Middleware and it depends on how you structure the Middleware class in order to define a “before” or "after" Middleware. 

### Before

Taking a look at the example below, Polyel will execute the `process()` function before an application request takes place, allowing you to perform actions before a request is processed further.

When calling `$nextMiddleware()` this will pass the `$request` object onto the next Middleware in the stack, if there is none left and no early response has been returned, the core action will be executed.

```php
namespace App\Http\Middleware;

use Closure;

class BeforeMiddleware
{
    public function process($request, Closure $nextMiddleware)
    {
        // Perform any actions before a request has its core action executed...

        return $nextMiddleware($request);
    }
}
```

### After

To define a Middleware which executes after a request has been processed, you get the response from the core action first, checkout the example below to see how this is done:

```php
namespace App\Http\Middleware;

use Closure;

class AfterMiddleware
{
    public function process($request, Closure $nextMiddleware)
    {
        $response = $nextMiddleware($request);

        // Perform any actions after the core action has formed a response...

        return $response;
    }
}
```

When you want to perform operations after the application has handled the request, you have to get that response by calling `$nextMiddleware()` which will return either a response from another Middleware if it has returned early or it will be the response from the core action. By performing any operations after the call to `$nextMiddleware` we are operating after the request has been handled by your application.

## Registering Middleware

Before you can attach Middleware to a specified route you must assign a Middleware alias inside the HTTP Kernel class which will be located at `app\Http\Kernel.php`, for example the route aliases could look like:

```
protected array $routeMiddlewareAliases = [

    'RedirectIfAuthenticated' => \App\Http\Middleware\RedirectIfAuthenticatedMiddleware::class,
    'Auth' => \App\Http\Middleware\AuthenticateMiddleware::class,
    'IsVerified' => \App\Http\Middleware\UserVerificationMiddleware::class,
    'ConfirmPassword' => \App\Http\Middleware\ConfirmPasswordMiddleware::class,

];
```

<div class="noteMsg">All Middleware that you create within your application are preloaded and defined during the server boot process, making them available straight away, and speeding up requests.</div>

### Attaching Middleware to a Route

Once you have defined your Middleware you will want to attach them to a Route request. This can be easily done by defining a route using `middleware()`:

```php
Route::get("/", "Index@home")
        ->middleware("LogRequestMiddleware");
```

This attaches the Middleware called ` LogRequestMiddleware` to the `/` Route and will be executed every time this Route is called. It is best to always add “Middleware” to the end of your class names so that you know it is a Middleware class.

### Attaching multiple Middleware

Sometimes a route may be required to have more than one Middleware attached to it, this can be easily done by sending an array to the `middleware()` function:

```php
Route::get("/", "Index@home")
        ->middleware(["LogRequestMiddleware", "UserAuthMiddleware"]);
```

Same goes for any other HTTP Request Method:

```php
Route::post("/", "Index@home")
        ->middleware(["LogRequestMiddleware", "UserAuthMiddleware"]);
```

You can pass in as many as you like but take note that each Middleware will be executed by the framework in the order they sit from the array that is passed in. If you want a Middleware to be executed in a different order, just rearrange the order of the array.

## Returning a Response from Middleware

If you need to return a response early within a middleware, both through before and after middleware types, you can easily by performing a normal return just like you would do inside a Controller. For example:

```php
class BeforeExampleMiddleware extends Middleware
{
    public $middlewareType = "before";

    public function process($request)
    {
        // Halts further execution early
        return "Early Response";
    }
}
```

This will return a response early and send the string back to the client, meaning execution for any other Middleware will not happen, nor will the Controller be executed. You can still use all the same response types inside Middleware as well:

```php
class AfterExampleMiddleware extends Middleware
{
    public $middlewareType = "after";

    public function process($request, $response)
    {
        $json = ["user"=>"joe", "age" => 33, "location" => "uk"];

        return Response($json);
    }
}
```

Here just like in a Controller Response, a JSON object will be sent back to the client, the PHP array will automatically be converted to JSON and the JSON header content type included.

If you don’t want a Middleware to halt execution early, don’t send back a return and the application will continue to execute further. But if you want to just add something to the Response like a header, you can do this:

```php
class AfterExampleMiddleware extends Middleware
{
    public $middlewareType = "after";

    public function process($request, $response)
    {
        $response->queueHeader("key", "value");
    }
}
```

Here this middleware will queue a header to be added to the Response and the final Response won't be affected because nothing was returned by the middleware

For more documentation on sending back a Response, checkout the [Response Documentation](/docs/using_polyel/response)

<div class="warnMsg">If you return a response in an after middleware, this return will take priority over the Controller Response, because it means the middleware gives you the ability to change the response just before the final response is sent to the client.</div>

### Setting the HTTP status code

You may want to use a middleware to specifically set the HTTP status code but not want to force an early response, you can do this by using an after middleware and using the response service.

```php
class AfterExampleMiddleware extends Middleware
{
    public $middlewareType = "after";

    public function process($request, $response)
    {
        // Server Error
        $response->setStatusCode(500);
    }
}
```

### Returning a View

It is possible to return a view from your middleware, for example:

```php
class BeforeExampleMiddleware extends Middleware
{
    public $middlewareType = "before";

    public function process($request)
    {
        // Halts further execution early and returns a rendered view
        return response(view('InvalidRequest:error'));
    }
}
```

This is a very simple example and there is much more to the view system, visit its full documentation [here.](/docs/using_polyel/views)

## Middleware Parameters

Your Middleware can also accept optional parameters, making it easy to adjust what the Middleware can respond to. For example, you might have a Middleware which checks if the user was active on a certain device but want to keep all the functionality in the same place, take a look at this example:

```
<?php

namespace App\Middleware;

use Polyel\Middleware\Middleware;

class CheckLastActiveMiddleware extends Middleware
{
    public $middlewareType = "before";

    public function process($request, $device)
    {
        if($device === 'ios)
        {
            // ...
        }

        // ...
    }
}
```

You can use the parameter to alter the way a Middleware response to your request. Middleware parameters are always pass into the `handle` method last.

To define the above Middleware example using parameters you can assign this to a route like so:

```
Route::get('active/check', function () {
    // ...
})->middleware('CheckLastActiveMiddleware:ios');
```

Parameters are set after the `:`, multiple parameters can be passed by using a comma to separate them apart:

```
Route::get('active/check', function () {
    // ...
})->middleware('CheckLastActiveMiddleware:ios,android,pc');
```

## Middleware Configuration

When you create new Middleware, you are setting a key to be used, this is because Polyel works by matching this key to a fully qualified class name. During the boot process of the Polyel server, all Middleware is preloaded to save time and have them ready for requests straight away. It is also easier and quicker to attach Middleware to a route using a key instead of a fully qualified class name.

Middleware has its own configuration inside ` /config/middleware.php` and the first thing you will see is where all the keys are set:

```php
/*
* Used to shorten Middleware class names for use when
* attaching a Middleware to a Route.
*/
"keys" =>
[
	"BeforeMiddlewareExample" => \App\Middleware\BeforeExampleMiddleware::class,

	"AfterMiddlewareExample" => \App\Middleware\AfterExampleMiddleware::class,
]
```

<div class="warnMsg">You will need to make sure your Middleware has its own key and full class name here, otherwise Polyel won't know which class to use when the time comes.</div>

### Global Middleware

You can configure global Middleware to run on every request either before or after, meaning you don’t need to attach this kind of Middleware to each route, you just configure it inside of `middleware.php` like so:

```php
/*
* Middleware which runs globally either before or after a request.
* The order of execution is respected from this configuration on both before
* and after lists below.
*/
"global" =>
[
	"before" => [
		"BeforeMiddlewareExample",
	],

	"after" => [
		"AfterMiddlewareExample",
	],
]
```

Polyel will execute any Middleware keys which are configured here on each request on every route.

<div class="warnMsg">Global Middleware will be executed first before any manually configurated Middleware</div>