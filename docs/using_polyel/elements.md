---
id: elements
title: Elements
---

## Introduction

Elements are Polyel’s answer to control structures not being allowed inside a view as we believe that logic should stay inside your code. But with Polyel elements, it makes it easy to include and render multiple elements on different views, you prepare your data in plain PHP and then use the provided Polyel element functions to build and render your elements, no need for mixing HTML and control structures together.

## Element Templates

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

## Element Logic

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

### Append HTML Blocks

You can also use `appendHtmlBlock()` to add content to the element, allowing you to append a full HTML block instead of just a single line:

```php
$htmlBlock = <<<HTML
            <h1>{{ name }}</h1>
            <h2>{{ age }}</h2>
        HTML;
		
$this->appendHtmlBlock($htmlBlock, ["name" => "Luke", "age" => 22]);
```

And when you append HTML blocks, you can also pass in any data like you would normally with any data tag, this also gets filtered for XSS attacks. You may use the standard `!name!` syntax to escape the filtering process.

## Including Elements

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

## Multi Elements

Polyel offers single dynamic elements as the default way of rendering a single element and being able to add content to that element. However, what if you need to render multiple elements or sections with different data? Well, Polyel has the ability to render multiple elements from a single template, it just requires a few different function calls.

### Defining a multi element template

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

### Rendering multiple elements

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

### Using Multi Elements

Just like you would with a normal single use element, you only need to include the add element function in your view, so for our profile example, it would be: `{{ @addElement(profileBoxElement) }}`. Remember the add element view function expects the element class name and not the name of the HTML element template. All element classes are resolved from the service container.

## Not using an Element

Just like in many other frameworks, they use control structures within HTML to decide when to include certain content or not, especially when rendering multiple elements or HTML content. With Polyel, if you decide based on the request that you don’t want to render an element but you still have the ` {{ @addElement(elementName) }}` tag in your views, you can choose to not render this element and Polyel will automatically just remove the tag for you. All you have to do is return `false` inside your element’s `build()` method, this tells Polyel you won’t be rendering this element, so Polyel will remove the element tag for you.

## Resetting Elements

If you need to, you can reset elements when you are building them, this must be done within the build function, you can call `reset()`:

```php
public function build()
{
	// Reset an elements content, data, template and block data
	$this->reset();
}
```