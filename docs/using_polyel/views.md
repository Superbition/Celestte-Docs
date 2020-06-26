---
id: views
title: Views
---

## Introduction

Polyel comes with its own View system which you can use to manage rendering a resource back to the user. The View system can help you combine HTML and CSS together to create a presentation suitable for a user/client.

Polyel's View layer does work a little differently compared to other frameworks, the main difference being, Polyel expects you to have your data ready before you pass data to a View. Polyel completely separates your logic away from your presentation layer. Meaning you will have to get your data ready and in the right state before passing it to a View.

However, Polyel does provide you with different functions and services which will help you follow this structure, the main thing to keep in mind is that PHP code (logic) and presentation (HTML or CSS) are separated apart, strictly following the MVC design pattern.

## What is a View?

A View is where you define your HTML that you use to structure your application, a View is what is served to the browser. The idea is to separate your application logic away from your HTML presentation.

All normal Views are stored within `/app/resources/views`, where you store a normal HTML page or HTML section: a sidebar or a footer for example.

We also have errors, they are stored within `/app/resources/errors`, where you can store any error pages for a 404 or 500 HTTP response but you can also use the errors directory to store any error pages, messages or sections you may build; the idea is to split up a normal view away from errors.

Let's take a look at what a normal View may look like:

```html
<!-- /app/resources/views/welcome.view.html -->
<html>

    <body>
        
        <h1>Hello, welcome to Polyel</h1>
    
        <h2>This is a normal HTML View</h2>
    
    </body>

</html>
```

And an error view could look something like:

```html
<!-- /app/resources/errors/warning.view.html -->
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

The `view()` helper will return an instance of `Polyel\View\ViewBuilder` which is then passed to the normal `response()` helper which uses the View Builder instance to form a response to send back to the browser, building and constructing a view.

### Returning an error

```php
return response(view('warning:error'));
```

Changing the resource type to an error (`:error`) will tell the View service to use the error templates stored in `/app/resources/errors`.

A good example is the included 404 error response page, which you can find at `/app/resources/errors/404.error.html`. The 404 error page is returned whever Polyel cannot find a route, so you are free to edit the default error page to your liking.

## Checking if a view exists

```php
use Polyel\View\Facade\View;

View::exists("common.sidebar:view")
```

Above, will return true when the `sidebar.view.html` file is found within `/app/resources/views/common/sidebar.view.html`. This example uses dot notation to access nested views. The same can be done for errors.

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

You may be wondering how can I pass data to my HTML view? Well, Polyel allows you to simply pass over a key value array which gets injected into the view.

Consider the following view:

```html
<html>
    <body>
        <p>Hello, welcome to Polyel, {{ name }}</p>
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

The view helper accepts a second argument for passing data that will in the end be injected into a view based on key value pairs. Polyel uses the `{{ }}` syntax to define a tag, a tag is used to interact with the view system, anything between `{{ }}` is processed by Polyel.

So when we set `{{ name }}` in our HTML view, that tells Polyel that we should replace that tag with the name `Luke!` when rendering that template. You may have any number of these `{{ }}` tags in your views, just make sure you pass data to them.

## Extending a view

When designing a web application it’s very common to have a master template or a common layout, for example you may reuse a certain header or footer style but you won’t want to write these elements every time you create a new view. So that’s why Polyel allows you to extend a view.

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

First, the welcome view is rendered and its data is injected, in this case the name. Then Polyel realises you want to extend a view called master, so this view is then rendered with its data, in this case we set the page title and then the main welcome view content is injected into the master view, using the `{{ @content }}` tag.

<div class="warnMsg">When extending views, you must make sure you include the <code>{{ @content }}</code> tag so that Polyel knows where to place the main rendered view.</div>

<br/>
So if your application uses a common layout or style, you can extend a view so you don’t have to repeat yourself all the time. Then you only have to pass in your requested page content like our welcome view example.

## Cross-site scripting prevention

Cross-site scripting, also known as XSS is an attack that allows someone to execute code by saving data to your application and then having that data displayed without being filtered, allowing them to run JavaScript code for example. To prevent this attack, Polyel automatically filters any data supplied to views by default and encodes data so that nothing is executed on the client side.

However, sometimes you may want JavaScript ot HTML to actually be rendered on the client side if you trust the data supplied. If you wish to display data without it being filtered for XSS attacks, you can do so by defining your data tags like `{{ !name! }}`.

```html
<h1>Welcome, {{ !name! }}</h1>
```

The mini view above uses the `!` to declare that any data passed to this tag should not be filtered for XSS attacks. Always be careful as you don't want to allow user supplied data to a view ithout being filtered!

## Nested Views

You may have already noticed that some views are defined using dot notation, this allows you to access nested views in multiple directories, so `common.sidebar.view.html` is actually leading to `/app/resources/views/common/sidebar.view.html`. This is automatically converted by Polyel.

## View Functions

View functions allow you to manipulate the view layer even more and give you that bridge between logic and presentation.

### @include

Before data is injected into the main view, Polyel gives you the ability to include other sub-views, meaning you can include another view and then add any data to the included data tags as well.

```html
<div id="profile">
	{{ @include(profile.image:view) }}
	{{ @include(profile.description:view) }}
</div>
```

This is a typical use case for includes, it allows you to bring in sub-views and have them rendered inside a main view. Includes allow you to split up your different sections of templates and bring them in when you need them.

<div class="noteMsg">Remember, because includes are processed before the main view is rendered, you can safely pass data as if those data tags are already there in your view.</div>

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

### @includeCSS

Most of the time you will just end up putting all your CSS links into your head element in your master view, but sometimes you may have a certain page which requires a lot of extra styling with CSS, it’s best to only include certain CSS files for different pages, that’s why Polyel allows you to use `@includeCSS` to require certain CSS files on different views.

```html
{{ @includeCSS(profile.common) }}
{{ @includeCSS(buttons) }}

<div id="profileBox">

	<p>Your Profile</p>
	...
</div>
```

In the example above, we have two CSS includes, each will tell Polyel we want to link the following files inside the HTML head:

- `/public/css/profile/common.css`
- `/public/css/buttons.css`

You will notice the includes are relative to the servers public folder, this is where your CSS files should be stored so Polyel can allow the client to retrieve them. The `.css` file extension is added automatically. If you like you can change the CSS folder relative to the public directory by visiting `/config/view.php`.

Finally, to get Polyel to insert these CSS links into the HTML head, you must use the `{{ @CSS }}` tag, which should be inside your master view like so:

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

<div class="noteMsg">You can place CSS includes in any view or element, they all get processed at the end before the final render.</div>

### @includeJS

When building web applications you will end up having different Java Script files for different logic and pages, but you won’t want to load Java Script files on pages where they won’t get used. So Polyel allows you to also `@includeJS` files dynamically between different views or elements.

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

Finally, you will also need to include the `@JS` tag to let Polyel know where you want all your JS includes to be placed, for example:

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

## Dynamic Elements

Dynamic elements are Polyel’s answer to control structures not being allowed inside a view as we believe that logic should stay inside your code. But with Polyel elements, it makes it easy to include and render multiple elements on different views, you prepare your data in plain PHP and then use the provided Polyel element functions to build and render your elements, no need for mixing HTML and control structures together.

### Element Templates

Elements are rendered from templates, basically small views used to render different sections of a web page like a sidebar, profile list or search result for example. The first thing to know about elements is that you define all your templates inside `/app/resources/elements`. This is your storage area for all your elements you make, you are free to organise elements in directories as well.

An example of an element used to render a list:

```html
<!-- From /app/resources/elements/list.html -->
<div class="list dark-ui">
	<p>{{ listTitle }}</p>
	<ul>
		{{ @elementContent }}
	</ul>
</div>
```

### Element Logic

When using elements, all logic for preparing data or adding content to an element should be done in the elements class, these are stored in `/app/View/Elements`. You interact with your element templates from these classes.

```php
namespace App\View\Elements;

// Each Element should extend the base Element
class ExampleElement extends Element
{
    // Set the element template relative to /app/resources/elements/
    public $element = 'list';

	// Use the constructor to pass in any Polyel services
    public function __construct()
    {

    }

	// The main function used to build up an element
    public function build()
    {
		$this->setElementData('listTitle', 'My First Element List');

		$name1 = 'Joe';
		$this->appendHtmlTag('<li>', $name1, '</li>');

		$name2 = 'Dan';
		$this->appendHtmlTag('<li>', $name2, '</li>');

		$name3 = 'Luke';
		$this->appendHtmlTag('<li>', $name3, '</li>');

		return $this->renderElement();
    }
}
```

All your logic for building up an element happens in the `build()` function, this gets called when you include elements in your HTML views.

The list example uses the element template called `list` set with `$element`, that file would be located at ` /app/resources/elements/list.html`.

When the `build()` function is called, the first thing that happens is the `listTitle` data tag is set, then there are 3 appends that add list items with 3 different names. Finally, this all gets rendered by returning `$this->renderElement()`; in the list element template you may have noticed the `{{ @elementContent }}` which is used to let Polyel know where to place all the appended names, the element content.

#### Append HTML Blocks

You can also use `appendHtmlBlock()` to add content to the element, allowing you to append a full HTML block instead of just a single line:

```php
$htmlBlock = <<<HTML
            <h1>{{ name }}</h1>
            <h2>{{ age }}</h2>
        HTML;
		
$this->appendHtmlBlock($htmlBlock, ["name" => "Luke", "age" => 22]);
```

And when you append HTML blocks, you can also pass in any data like you would normally with any data tag, this also gets filtered for XSS attacks. You may use the standard `!name!` syntax to escape the filtering process.

### Including Elements

After setting up your element template and logic, you will want to use your new element inside a view, like a main view or an extending view.

```html
<div id="container">
	<div class="list">
		{{ @addElement(UserList) }}
	</div>
</div>
```

That is how you tell Polyel to include your element inside a view, by adding ` {{ @addElement(UserList) }}`, it will let the view system know you want that element to be rendered and injected here, the elements logic class will be resolved from the service container and its `build()` function will be called and its final return will be replaced wherever  `{{ @addElement(UserList) }}` is located.

When including an element, if it is nested inside directories, you only need to pass the class name as all element logic classes are under the namespace ` App\View\Elements` and are automatically loaded from the service container, so you are to organize your directories as you want, relative to `/app/View/Elements`.

### Multi Elements

Polyel offers single dynamic elements as the default way of rendering a single element and being able to add content to that element. However, what if you need to render multiple elements or sections with different data? Well, Polyel has the ability to render multiple elements from a single template, it just requires a few different function calls.

#### Defining a multi element template

First, you will need to create a new element template at `/app/resources/elements`, for this example we will create a `profile_box.html` file. That file looks like this:

```html
<!-- /app/resources/elements/profile_box.html -->
<div class="profileBox">
    <p>{{ profileName }}</p>
    <img src="{{ profileImg }}">
</div>
```

That is our profile box example, we will use this template to render multiple elements at once instead of a single element only.

The template above requires a profile name and the source to the profile image. We will now move onto the element logic…

#### Rendering multiple elements

```php
// app/View/Elements/ProfileBoxElement.php
namespace App\View\Elements;

class ProfileBoxElement extends Element
{
    // Set the element template relative to /app/resources/elements/
    public $element = 'profile_box';

    public function __construct()
    {

    }

    public function build()
    {
		$profile1 = [
          "profileName" => "Luke",
          "profileImg" => "/images/profile/default.png"
		];
		
        $profile2 = [
            "profileName" => "James",
            "profileImg" => "/images/profile/default.png"
		];
		
		$this->newElement($profile1);
		$this->newElement($profile2);

		return $this->renderElements();
    }
}
```

When rendering multiple elements, the difference is you still prepare your data ready to inject into the template but you call ` newElement()` instead, which creates a new element based on the data you pass in.

You can keep calling ` newElement()` as many times as you need it, to keep creating new elements and appends them together upon render. That’s another difference, when you want to finally render all your new elements, you have to return `$this->renderElements()` notice the plural difference.

In out profile box example above, we are creating two new elements from the data we pass in, once rendered these are appended to eachother and returned back to our view where we set `{{ @addElement(profileBoxElement) }}`.

#### Using Multi Elements

Just like you would with a normal single use element, you only need to include the add element function in your view, so for our profile example, it would be: `{{ @addElement(profileBoxElement) }}`. Remember the add element view function expects the element class name and not the name of the HTML element template. All element classes are resolved from the service container.

### Not using an Element

Just like in many other frameworks, they use control structures within HTML to decide when to include certain content or not, especially when rendering multiple elements or HTML content. With Polyel, if you decide based on the request that you don’t want to render an element but you still have the ` {{ @addElement(elementName) }}` tag in your views, you can choose to not render this element and Polyel will automatically just remove the tag for you. All you have to do is return `false` inside your element’s `build()` method, this tells Polyel you won’t be rendering this element, so Polyel will remove the element tag for you.

### Resetting Elements

If you need to, you can reset elements when you are building them, this must be done within the build function, you can call `reset()`:

```php
public function build()
{
	// Reset an elements content, data, template and block data
	$this->reset();
}
```