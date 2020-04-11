---
id: middleware
title: Middleware
---

In Polyel there is a Middleware mechanism that allows you to filter incoming HTTP requests and act upon those requests during two stages in your application; the two stages being before and after.

A good example is you might create a Middleware to check that a user has permission to view a certain page and if not, you redirect them to the login screen or display an error message.

Middleware can be used for more than just authentication though, you might create a Middleware to store logs of user actions or add additional HTTP headers to your responses.

## Creating Middleware

To create a new Middleware, you can use the Polyel command `middleware`:

```text
php polyel middleware create LogRequestMiddleware
```

You can use `middleware create` to define a new Middleware and this command will create a new class for you and place it in the appropriate directory for you, created from the default Middleware definition. All Middleware is stored in `/app/Middleware/`.

## Before and After Middleware

### Before
```php
namespace App\Middleware;

use Polyel\Middleware\Middleware;

class BeforeExampleMiddleware extends Middleware
{
    public $middlewareType = "before";

    public function process($request)
    {

    }
}
```

Above is what a standard before Middleware class looks like, Polyel will execute the `process()` function before an application request takes place, allowing you to perform actions before a request is processed further.

You define a Middleware as “before” by setting the class property ` $middlewareType` to “before” and by doing this it tells Polyel that this Middleware should be executed before a HTTP request.

### After

To define a Middleware which executes after a request has been processed, you simple define the property ` $middlewareType` to equal “after”, the class definition is the same though:

```php
namespace App\Middleware;

use Polyel\Middleware\Middleware;

class AfterExampleMiddleware extends Middleware
{
    public $middlewareType = "after";

    public function process($response)
    {

    }
}
```

## Attaching Middleware to a Route

Once you have defined your Middleware you will want to attach them to a Route request. This can be easily done by defining a route using `middleware()`:

```php
Route::get("/", "Index@home")
        ->middleware("LogRequestMiddleware");
```

This attaches the Middleware called ` LogRequestMiddleware` to the `/` Route and will be executed every time this Route is called. It is best to always add “Middleware” to the end of your class names so that you know it is a Middleware class.

### Attaching multiple Middleware

Sometimes a route may be required to have more than one Middleware attached to it, this can be easily done by sending an array to the `middleware()` function:

```php
Route::get("/", "Indexr@home")
        ->middleware(["LogRequestMiddleware", "UserAuthMiddleware"]);
```

Same goes for any other HTTP Request Method:

```php
Route::post("/", "Indexr@home")
        ->middleware(["LogRequestMiddleware", "UserAuthMiddleware"]);
```

You can pass in as many as you like but take note that each Middleware will be executed by the framework in the order they sit from the array that is passed in. If you want a Middleware to be executed in a different order, just rearrange the order of the array.

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
<div class="warnMsg"></div>
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