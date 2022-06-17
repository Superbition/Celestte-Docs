---
title: Services
---

The Voltis framework is based around the MVC (Model-View-Controller) design pattern, where we write models that interact with our data from different sources, controllers that route requests throughout application and return a response and Views which are responsible for handling the presentation layer of an application.

But what about heavy logic or the core of your application that you want to build? – We know we shouldn’t write heavy application specific logic inside our controllers because that would give us bulky controllers and make our routing logic messy, the same goes for data Models, we shouldn’t place application logic there either and it would not make sense within the View layer as well. So where do we place core application logic?

That’s where services come in, a service is just a class or a set of classes which come together to form a single service, just like the Voltis `Request` or `Response` services, to you they seem like one class but within the framework they are using more than one class, but a service can only be a single class if it makes sense and is simple enough. A service is a good place to where you should write all your heavy business logic for your application, services are easier to maintain and separate, allowing you to write classes which respect standards like SRP (Single-Responsibility Principle) and SoC (Separation of Concerns) etc.

Inside the core of Voltis the framework uses the same approach, each feature like the `Mailer`, `Authentication`, `View System` and `Encryption` etc. are all defined as a service which are available to you, the developer at the application level.

Now that we have a general idea of what services are and why we should use them, to learn more we should learn how to define your own and use them.

## Creating a new service

When creating a new service there are a few things to consider, if the service is going to be very simple or only a few methods, it may be more appropriate to write that simple logic within a Controller or a Model, but if not or you know you want a service for heavy business logic, no doubt that a service is the right choice.

Voltis provides you with a `create:service` command to make it convenient when generating boilerplate code to start from. To create a new service run: 

```bash
php voltis create:service CarCheckerService
```

The command above will generate a new class called `CarCheckerService` at `app/Services/CarCheckerService.php`.

And the command will also generate a Service Supplier, what is that you ask? – Let’s learn about them next.

### Service Suppliers

If your service can not be resolved through the container normally, meaning your service has some form of non-object dependency or requires a complex configuration, you will need a Service Supplier to define that logic, to tell Voltis how your service is created. 

If you used the command above to create a service and don’t add the command option `--service-only`, it will go ahead and create the service supplier for you as well, this will be located at: `app/Services/Suppliers/CarCheckerServiceSupplier.php`.

Let’s have a look at what a Service Supplier looks like in the next heading.

### Supplier Registering

```php
namespace App\Services;

use Voltis\System\ServiceSupplier;

class CarCheckerServiceSupplier extends ServiceSupplier
{
	public function register()
	{
		$this->bind(CarCheckerService::class, function($container)
        {
           return new CarCheckerService('UK');
        });
	}
}
```

The main goal of the service supplier is to register your service into the Voltis container, which is what resolves classes and their dependencies for you. But sometimes a service might be too complicated or require additional startup configuration and the Voltis container cannot do this because, Voltis works by resolving classes via their namespaces. So a service supplier enables you to tell Voltis how to resolve certain classes and services.

For example, the above call to the `register` method is done during server boot up, all of the processing for these service suppliers is done before any requests can take place, improving performance for your application. Once the service supplier registers its methods, Voltis then knows how to resolve your services, the same happens inside the core of Voltis.

As you can see we have called a method named `bind`… What does that mean? – The register method allows you to register services in a few different ways and a `bind` is just one way, let’s explore the different methods…

:::caution
Within a service supplier, you must not perform any other actions, only service registering, a service supplier is processed early on in the server boot up, and so not everything is available to you at this time.
:::

### Supplier Binding Types

With Voltis you have two different binding method to choose from.

#### Binds

A bind will tell the Voltis container how to resolve a service but each time the service is requested, a new instance is declared every time, nothing is shared between each service that is created:

```php
public function register()
{
	$this->bind(CarCheckerService::class, function($container)
	{
		return new CarCheckerService('UK');
	});
}
```

#### Singletons

A singleton will tell Voltis that when the class is requested, the service is shared, meaning every time it is needed, it’s the same object being referred to, so the instance created is shared, by default across the request. Singletons by default are created/instantiated at the start of a request lifecycle but we have a few options to change that…

```php
public function register()
{
	$this->singleton(CarCheckerService::class, function($container)
	{
		return new CarCheckerService('UK');
	});
}
```

#### Deferred Singletons

Instead of letting Voltis define a new singleton instance at the start of every request, you can choose to defer the service until it is needed, requested from the container that is. This is done by using the `defer()` method:

```php
public function register()
{
	$this->singleton(CarCheckerService::class, function($container)
	{
		return new CarCheckerService('UK');
	})->defer();
}
```

Now, if we use `defer()` on the end of the `singleton` call, Voltis won’t create a new instance of this service until it is needed in your application, however, all the preprocessing and setup for singleton services is done during server boot up, so requests are not impacted by having to perform operations to process service suppliers during a request. But once the singleton service is needed and a new instance created, only that instance is used across the whole request.

#### Global Singletons

Up until now we have only spoke about singletons used only within the request scope. Whereas, Voltis gives you the ability to define singletons at a global scope or in other words, services which run at server level, across every request. Because Voltis controls the HTTP server instance, you can run services which operate across requests, this is done by using the `global()` method on the end:

```php
public function register()
{
	$this->singleton(CarCheckerService::class, function($container)
	{
		return new CarCheckerService('UK');
	})->global();
}
```

Global singletons cannot be deferred because they are defined at server boot up, so the request lifecycle is not affected by performance and these global singletons stay active across every request until the server is stopped.

:::caution
You must be careful with global singleton services not to share data across requests and leak data as it’s the same instance used every time.
:::

### Registering a Service Supplier

Once you have your service classes created and a service supplier to tell Voltis how to create this new service, you must make it known to Voltis that it should load your service during server boot up, this is done by listing your service within the main configuration file located at ` config/main.php`.

In there, under the configuration `servicesSuppliers`, you can list them like so:

```php
'servicesSuppliers' => [
        App\Services\CarCheckerServiceSupplier::class,
    ],
```

## Using the Container

Throughout the examples on service suppliers, you may have noticed the closure function used to define how a service can be resolved is passed a parameter `$container`. This parameter is the dependency injection container which is trying to resolve the service, this is useful because it gives you access to the container so you can resolve object dependencies as well as non-object dependencies, for example:

```php
public function register()
{
	$this->singleton(CarCheckerService::class, function($container)
	{
		return new CarCheckerService($container->get(PriceCheckerService::class), 'UK');
	});
}
```

The `CarCheckerService` now requires two types of dependencies, one is an object dependency and the other is a manual configuration, where Voltis cannot resolve this and that’s why we need a service to tell Voltis how this service is made. But by using the container within this closure, you can still take full advantage of Dependency Injection and not having to worry about a classes requirements, you may use the passed in container to resolve object dependencies mixed in with non-object dependencies.

:::note
Remember, if your service does not have any non-object dependencies, your service may not need a service supplier and you can just create the service class itself.
:::
