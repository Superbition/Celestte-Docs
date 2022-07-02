---
title: Views
---

Voltis comes with its own View system which you can use to manage rendering a resource back to the user. The View system can help you combine HTML and CSS together to create a presentation suitable for a user/client.

Voltis's View layer does work a little differently compared to other frameworks, the main difference being, Voltis expects you to have your data ready before you pass data to a View. Voltis completely separates your logic away from your presentation layer. Meaning you will have to get your data ready and in the right state before passing it to a View.

However, Voltis does provide you with different directives and services which will help you follow this structure, the main thing to keep in mind is that PHP code (logic) and presentation (HTML or CSS) are separated apart, strictly following the MVC design pattern.

## What is a View?

A View is where you define your HTML that you use to structure your application, a View is what is served to the browser. The idea is to separate your application logic away from your HTML presentation.

All normal Views are stored within `/resources/views`, where you store a normal HTML page or HTML section: a sidebar or a footer for example.

We also have errors, they are stored within `/resources/errors`, where you can store any error pages for a 404 or 500 HTTP response but you can also use the errors directory to store any error pages, messages or sections you may build; the idea is to split up a normal view away from errors.

Let's take a look at what a normal View may look like:

```html
<!-- /resources/views/welcome.view.html -->
<html>

    <body>
        
        <h1>Hello, welcome to Voltis</h1>
    
        <h2>This is a normal HTML View</h2>
    
    </body>

</html>
```

And an error view could look something like:

```html
<!-- /resources/errors/warning.view.html -->
<div class="errorMsg">

	<img src="/images/error/warn-icon.png">

	<p>Error - You have come to the wrong place!</p>

</div>
```

### View file names

As you may have seen, we have views and errors, even though they are stored in different directories, a view is saved in the format `<filename>.view.html` and errors are saved in the format `<filename>.error.html`. The reason being, it makes it easier to distinguish them when using them in your application logic which you will see later on. 

## Returning a View

You can return a View from a Controller or Middleware but the most common way is most likely from a Controller, for example:

```php
class WelcomeController extends Controller
{
    public function welcome()
    {
        return response(view('welcome:view'));
    }
}
```

Calling the global helper function `view()`, expecting the resource name and type (`name:type`) and any data you wish to pass to the view.

The `view()` helper will return an instance of `Voltis\View\ViewBuilder` which is then passed to the normal `response()` helper which uses the View Builder instance to form a response to send back to the browser, building and constructing a view.

### Returning an error

```php
return response(view('warning:error'));
```

Changing the resource type to an error (`:error`) will tell the View service to use the error templates stored in `/resources/errors`.

A good example is the included 404 error response page, which you can find at `/resources/errors/404.error.html`. The 404 error page is returned whenever Voltis cannot find a route, so you are free to edit the default error page to your liking.

## Checking if a view exists

```php
use Voltis\View\Facade\View;

View::exists("common.sidebar:view")
```

Above, will return true when the `sidebar.view.html` file is found within `/resources/views/common/sidebar.view.html`. This example uses dot notation to access nested views. The same can be done for errors.

## Checking if a view is valid

```php
$view = view("age:view", ["age" => 22]);

if($view->isValid())
{
	return response($view);
}
```

If you want to, you can check if a view file is valid by doing what is shown above. A view is deemed valid if the `:type` is matched and that the view file exists. This check is used each time the view is rendered.

## Passing data to a view

You may be wondering how can I pass data to my HTML view? Well, Voltis allows you to simply pass over a key value array which gets injected into the view.

Consider the following view:

```html
<html>
    <body>
        <p>Hello, welcome to Voltis, {{ name }}</p>
    </body>
</html>
```

And the following Controller response:

```php
class WelcomeController extends Controller
{
    public function welcome()
    {
        return response(view('welcome:view', ['name' => 'Luke!']));
    }
}
```

The view helper accepts a second argument for passing data that will in the end be injected into a view based on key value pairs. Voltis uses the `{{ }}` syntax to define a tag, a tag is used to interact with the view system, anything between `{{ }}` is processed by Voltis.

So when we set `{{ name }}` in our HTML view, that tells Voltis that we should replace that tag with the name `Luke!` when rendering that template. You may have any number of these `{{ }}` tags in your views, just make sure you pass data to them.

## Flash Messages

If you have flashed data to the session and want to render a flash message within your view, you may use the `@flash` directive. For example:

```
{{ @flash(success) }}
```

This would render a flash message where the data in the session is using a key called `success` and where the file name of the flash message template is also named `success.flash.html` and they must be stored within `app\resources\flashes`.

You may use dot syntax to store flash message templates in nested directives within `app\resources\flashes`.

## Extending a view

When designing a web application it’s very common to have a master template or a common layout, for example you may reuse a certain header or footer style but you won’t want to write these elements every time you create a new view. So that’s why Voltis allows you to extend a view.

```php
return response(
            view('welcome:view', ['name' => 'Luke!'])
            ->extending('master:view', ['title' => 'Welcome Page'])
		);
```

Here we are using two separate views, the welcome view and the master view. The master view looks like this:

```html
<html>
	<head>
		<title>{{ title }}</title>
	</head>
	<body>
	    {{ @content }}
	</body>
</html>
```

And the welcome view looks like:

```html
<h1>Welcome, {{ name }}</h1>
```

First, the welcome view is rendered and its data is injected, in this case the name. Then Voltis realises you want to extend a view called master, so this view is then rendered with its data, in this case we set the page title and then the main welcome view content is injected into the master view, using the `{{ @content }}` tag.

:::caution
When extending views, you must make sure you include the `{{ @content }}` tag so that Voltis knows where to place the main rendered view.
:::

So if your application uses a common layout or style, you can extend a view so you don’t have to repeat yourself all the time. Then you only have to pass in your requested page content like our welcome view example.

## Cross-site scripting prevention

Cross-site scripting, also known as XSS is an attack that allows someone to execute code by saving data to your application and then having that data displayed without being filtered, allowing them to run JavaScript code for example. To prevent this attack, Voltis automatically filters any data supplied to views by default and encodes data so that nothing is executed on the client side.

However, sometimes you may want JavaScript ot HTML to actually be rendered on the client side if you trust the data supplied. If you wish to display data without it being filtered for XSS attacks, you can do so by defining your data tags like `{{ !name! }}`.

```html
<h1>Welcome, {{ !name! }}</h1>
```

The mini view above uses the `!` to declare that any data passed to this tag should not be filtered for XSS attacks. Always be careful as you don't want to allow user supplied data to a view ithout being filtered!

## Nested Views

You may have already noticed that some views are defined using dot notation, this allows you to access nested views in multiple directories, so `common.sidebar.view.html` is actually leading to `/resources/views/common/sidebar.view.html`. This is automatically converted by Voltis.

## View Directives

View directives allow you to manipulate the view layer even more and give you that bridge between logic and presentation.

### include

Before data is injected into the main view, Voltis gives you the ability to include other sub-views, meaning you can include another view and then add any data to the included data tags as well.

```html
<div id="profile">
	{{ @include(profile.image:view) }}
	{{ @include(profile.description:view) }}
</div>
```

This is a typical use case for includes, it allows you to bring in sub-views and have them rendered inside a main view. Includes allow you to split up your different sections of templates and bring them in when you need them.

:::info
Remember, because includes are processed before the main view is rendered, you can safely pass data as if those data tags are already there in your view.
:::

#### Extending view includes

```html
<html>
	<head>
		<title>{{ title }}</title>
	</head>
	<body>
		{{ @include(header:view) }}

		{{ @include(common.sidebar:view) }}

		{{ @content }}

		{{ @include(footer:view) }}
	</body>
</html>
```

Another example of using includes is for including common HTML sections like a header or footer, it may be easier to split these sections into different files and then pull them in using the `@include` function. Giving you the ability to manage complex templates in separate files.

### includeCSS

Most of the time you will just end up putting all your CSS links into your head element in your master view, but sometimes you may have a certain page which requires a lot of extra styling with CSS, it’s best to only include certain CSS files for different pages, that’s why Voltis allows you to use `@includeCSS` to require certain CSS files on different views.

```html
{{ @includeCSS(profile.common) }}
{{ @includeCSS(buttons) }}

<div id="profileBox">

	<p>Your Profile</p>
	...
</div>
```

In the example above, we have two CSS includes, each will tell Voltis we want to link the following files inside the HTML head:

- `/public/css/profile/common.css`
- `/public/css/buttons.css`

You will notice the includes are relative to the servers public folder, this is where your CSS files should be stored so Voltis can allow the client to retrieve them. The `.css` file extension is added automatically. If you like you can change the CSS folder relative to the public directory by visiting `/config/view.php`.

Finally, to get Voltis to insert these CSS links into the HTML head, you must use the `{{ @CSS }}` tag, which should be inside your master view like so:

```html
<html>
	<head>
		<title>{{ title }}</title>
		{{ @CSS }}
	</head>
	<body>
		...
	</body>
</html>
```

:::info
You can place CSS includes in any view or element, they all get processed at the end before the final render.
:::

### includeJS

When building web applications you will end up having different Java Script files for different logic and pages, but you won’t want to load Java Script files on pages where they won’t get used. So Voltis allows you to also `@includeJS` files dynamically between different views or elements.

```html
{{ @includeJS(profile.profile) }}
{{ @includeJS(buttons) }}

<div id="profileBox">

	<p>Your Profile</p>
	...
</div>
```

By rendering the above view, two Java Script files will be included inside your final HTML view:

- `/public/js/profile/profile.js`
- `/public/js/buttons.js`

By default all Java Script includes are relative to the servers public directory and `.js` is added automatically. If you would like, you can change the default JS directory by visiting `/config/view.php`.

Finally, you will also need to include the `@JS` tag to let Voltis know where you want all your JS includes to be placed, for example:

```html
<html>
	<head>
		<title>{{ title }}</title>
		{{ @JS }}
	</head>
	<body>
		...
	</body>
</html>
```

### method

As HTML forms cannot send `PUT`, `PATCH` or `DELETE` requests, you must add a special hidden field called `http_method` with the intended HTTP verb. Voltis provides you with the `@method` view directive to make this easy and quick:

```html
<form action="/profile/update" method="POST">
    {{ @method(DELETE) }}
    {{ @csrfToken }}
</form>
```

This would generate `<input type="hidden" name="http_method" value="DELETE">` for you.

## Dynamic Content

Voltis works a bit differently compared to some frameworks which use control structures and logic that are mixed in with HTML templates, by design Voltis does not allow any logic or control structures inside a HTML template, we believe all your logic should stay within your PHP code and templates should be kept as `.html` files. 

So if Voltis does not allow logic inside a template, how does Voltis handle dynamic content? – Simply put, we use what we call Elements that have a template `.html` file and an Element class where all the logic will go, where you can perform all your if, for, switch and loop statements, just like you would in a normal PHP script.

The idea is simple, we are just removing logic from our templates and performing it inside a PHP class instead, keeping the HTML templates clean!

To see the documentation for Elements, visit the specific page for [Voltis Elements]( /docs/using_voltis/elements).
