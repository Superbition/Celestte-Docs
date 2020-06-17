---
id: controllers
title: Controller
---

## Introduction

Up and until now if you’ve been following the documentation, you will have seen that it’s useful to define quick actions for routes using PHP Closures, but when things get a little more complicated for your routes and for better organization of your application, we can use a Controller. A Controller is a class which processing the incoming request from your defined routes, it is responsible for routing the request further into the application and returning a response.

### Controller Loading

All Controllers defined in `/app/Controllers` are automatically loaded during server boot time, so they are available and ready to be used in requests.

## Defining a Controller

Application Controllers are stored in `/app/Controllers`. Here is an example of a basic Controlled used to return a welcome view back to the user:

```
namespace App\Controllers;

class WelcomeController extends Controller
{
    public function welcome($name)
    {
        return response(view('welcome:view'), ['name' => $name]);
    }
}
```

To make use of the Controller above, you would define it inside your web Routes file like so:

```
Route::get("/welcome/{name}", "WelcomeController@welcome");
```

When that route is defined and your application recevies a request that matches the route URL, the controller will process the request using the `welcome()` method, passing in the name from the URL, it will be the main entry point your that URL.

<div class="noteMsg">Note how the Controller is extending the base Controller class. All your Controllers should extend the base Controller but it is not required.</div>

## Controler Location and Namespaces

You may have noticed when we defined a Controller as a Route action, we only defined its name and not the full namespace. All Controllers should be defined in `/app/Controllers` but if you wish, you can nest your Controllers deeper, just be sure to pass the rest of the namespace when using them as a Route action, relative to `/app/Controllers`.

So for example if you have a Controller called `/app/Controllers/Admin/PermissionController`, you register the route as an action by doing:

```
Route::get('/admin/permissions', 'Admin\PermissionController@method');
```

## Dependency Injection & Controllers

The Polyel Dependency Injection Container used to resolve services can be used to resolve dependencies for your Controllers, making it easy to use services across the framework and not have to worry about how they are defined. This works by type-hinting the dependency you want inside the Controllers constructor or via the route action method.

### Controller Constructor Injection

```
namespace App\Controllers;

use Polyel\Session\Session;

class WelcomeController extends Controller
{
	protected $session;

    public function __construct(Session $session)
    {
        $this->session = $session;
    }
}
```

The Session system instance used to access the session data for the request will be injected into the Controller constructor for you, you don't need to worry about how you access it, just type-hint it and Polyel will resolve it for you from the service container.

### Controller Method Injection

```
namespace App\Controllers;

use Polyel\Http\Request;

class WelcomeController extends Controller
{
    public function welcome(Request $request)
    {
        $username = $request->data("username");

		// ...
    }
}
```

Sometimes it may be cleaner and easier to only use a dependency once within a Controller method, so when you use a Controller action method you can type-hint services here as well and they will be resolved and injected for you. 

### Method Injection & Route Parameters

If your Controller method is using a type-hinting dependency and route parameters from the URL/request, list all of the route parameters after as all method dependencies are injected first, then route parameters.

For example, if you have a route defined like so:

```
Route::get('/cars/{category}', 'CarController@showCarCat');
```

The Controller would look like:

```
namespace App\Controllers;

use Polyel\Http\Request;

class CarController extends Controller
{
    public function showCarCat(Request $request, $category)
    {
        // ...
    }
}
```

## Controller & Closure Caching

Both type of route actions can be cached; Controllers and Closure based actions are automatically cached because Polyel runs the Router service persistently in memory, so there is no need to worry about running any commands to cache routes.