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

To define a Middleware which executes after a request has been processed, you simply define the property ` $middlewareType` to equal “after”, the class definition is the same though:

```php
namespace App\Middleware;

use Polyel\Middleware\Middleware;

class AfterExampleMiddleware extends Middleware
{
    public $middlewareType = "after";

    public function process($request, $response)
    {

    }
}
```

After Middleware gets access to both the `$request` and `$response` as the framework has already handled the request from the client and will be ready to send the response but this gives you the chance to edit the response before it's sent off.

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