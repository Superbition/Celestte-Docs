---
id: validation
title: Validation
---

## Introduction

When building an application with Polyel, you will at some point accept data from client requests, it is good practice to make sure this data coming from requests is in the correct format your application expects. That’s why Polyel provides you with a simple validate service that is included with the request class. Giving you a wide range of validation rules and flexibility to validate incoming data.

## Validation Walkthrough

The best way to explain and teach you about the validation system Polyel uses is to walk you through a full example, from setting up the route to getting the controller implemented and directly showing the use of validation in an example. Along the way we will also go over key points and hints to help you better understand how Polyel validates request data.

### Setting up routes

For our example, we’ll need to setup a few routes inside our ` app\routing\web.php` file. One route to display a page with a form, so we can send data to our application for validation, and another route that will accept the incoming request:

```
Route::get("/blog/post/new", "PostController@new");
Route::post("/blog/post/create", "PostController@create");
```

We now have a `GET` route to show a potential user a form which they can use to create a new blog post, then we have the `POST` route to actually create and store the new post in a database, where also the data validating will take place.

### Setting up the controller

The next step is to build out our controller to handle the incoming requests for our routes we setup:

```
<?php

namespace App\Controllers;

use Polyel\Http\Request;

class PostController extends Controller
{
    public function new()
    {
        return response(view('post:view'));
    }

    public function create(Request $request)
    {
		// Validate incoming data and proceed if validation passes
        $request->validate([
            'heading' => ['Required', 'Max:64'],
            'content' => ['Required', 'Between:100, 2500'],
        ]);
    }
}
```

And that’s mostly it, Polyel will use the `create` method to store a new blog post but will run the validation rules against the data from the request, if validation passes, execution will continue but if validation fails, Polyel will automatically redirect back to the previous URL and store the errors inside the session for you to display in your view.

### Validation Logic & Process

From setting up a quick and simple example, you can see the workflow from how the validation process works in Polyel. All your validation is done within your different Controllers, where you use the ‘Request` service to access the validator and get back an instance which will automatically run the validation rules against the request data for you.

```
public function create(Request $request)
{

	$request->validate([
		'heading' => ['Required', 'Max:64'],
		'content' => ['Required', 'Between:100, 2500'],
	]);

}
```

When validation is executed like in the example above, if all validation rules pass, your code will continue to execute, but if any rules fail validation then, your code will stop executing because a validation exception will be thrown and control will be given to Polyel, where an automatic response will be created for you. That automatic response will detect a normal browser based HTTP request and redirect back to the previous page, with the proper error messages stored in the session, allowing you to inject these errors to be displayed. But if a Ajax request was sent over, Polyel will just return a JSON response with the error messages and nothing will be placed into the session.

From the example above, you can see the argument passed in is an array of request data names and their rules in a list array. The Validator expects the names from your forms or API requests and then a list all of the rules for each element of data.

#### Breaking out on the first failure

The validator will execute these rules against the data one at a time and keep collecting error messages as each rule if processed, unless you `Break` out of the first failure, which you can do by assigning the `Break` rule to a field: 

```
$request->validate([
		'heading' => ['Break', 'Required', 'Max:64'],
		'content' => ['Required', 'Between:100, 2500'],
	]);
```

When breaking out on first rule to fail, it means the rest of the rules for that field are not checked as rules are executed on the data in order from the array. However, the rest of the fields and their rules will be checked unless they also use the `Break` rule.

#### Assigning rules to nested fields

When sending requests which contain parameters and field inside arrays, you may access them and assign rules to them using dot syntax:

```
$request->validate([
		'heading' => ['Break', 'Required', 'Max:64'],
		'content' => ['Required', 'Between:100, 2500'],
		'post.delay' => ['Required', 'Between:1, 100'],
		'post.tags' => ['Required', 'Array', 'Between:0, 5'],
	]);
```

## Using Validation Groups

If you have a page which contains multiple forms on it, you will want to define a validation group for it, so that you don’t run into issues when displaying errors, which we discuss later on. To define a validation group for a specific form, we pass in our name as the second argument:

```
// Validation using a defined group for a specific form
$request->validate([
		'heading' => ['Break', 'Required', 'Max:64'],
		'content' => ['Required', 'Between:100, 2500'],
	], 'newPost');
```

By doing this it tells Polyel that if any rules fail during validation, the error messages will be stored within a group called `newPost` so we can differentiate them later on when displaying them on a view.

## Showing Validation Error Messages

### Displaying all errors

Now, you should have your validation rules setup for incoming request data but how can we show failed rules and their error messages back to the user? Polyel again will automatically collect error messages from failed rules and store them into the user’s session and generate the appropriate response back to the previously page, all you have to do to display errors is place the error directives into your views. You have a number of error directives to help you easily show errors in a view. The first and most common one we should discuss is `@errors`:

```
<form action="/blog/post/create" method="POST" enctype="multipart/form-data">
	
	{{ @errors(list) }}
	
	...

</form>
```

From our example above that is all we have to do inside our views in order to get errors to display when they exist, no condition statements are needed, just a directive used to display errors, Polyel will handle the rest for you, you can think of this directive more of a placeholder if any errors exist, if no errors exist then the whole `@errors` tag is removed for you automatically.

<br/>

<div class="noteMsg">Note: You can place this <code>{{ @errors(list) }}</code> directive anywhere in a view, you don’t need to put it inside the actual form itself, you are free to place it where it makes sense for your application.</div>

<br/>

You may have noticed the `list` argument above, what is that you ask? It will display all errors from the session and use the error template called `list` to display the error messages. So, the parameter you are passing into `@errors` is a template used to format and structure your error messages, saving you having to do this every time you want to display errors on a view. This `list` template is provided by Polyel as an example for you and can be found at `app\resources\errors\list.error.html`, let’s have a look at it to see what it does:

```
<div class="listError">

    <ul>

        {{ @error(<li>@message</li>) }}

    </ul>

</div>
```

If errors exist in the session you don’t need to worry about checking if they are there, Polyel will automatically do this for you, as long as the `@errors` directive is set inside your view, Polyel will grab the name of the template you have passed, like our `list` template above and inject all the errors using the error replacement line. In our example above you can see this is `{{ @error(<li>@message</li>) }}`, if we have 5 errors to display, each error will be replaced using this line and the error is replaced where `@message` is, so they will all come out as a `<li>` list. You don’t need to worry about any if statements or conditional loops, Polyel does this all for you and if you need to make a change to the way errors are displayed, you only need to make one change inside your error templates. It is best to store different types of error templates used for this purpose inside ` app\resources\errors`.

If you have multiple forms on a single page and want to use `@errors` for a certain form, you may pass a second argument for the group name (which should match the group set when validating the data at the Controller level):

```
{{ @errors(list, login) }}
```

And if you want to only display all the errors for a specific field you can use the second argument to select that field:

```
{{ @errors(list, login.email) }}
```

The above would only display all the errors for the group called `login` and the field within that group called `email`.

### Displaying only certain errors

Sometimes you may want to have more control over which errors you show, this is useful for when you only want to display a certain error or a certain error in a specific place on your view. Polyel provides you with another directive for just that, let’s take a look at an example:

```
<div id='error'>

	{{ @error(title) }}

</div>
```

Above will tell render the first error only for the field from the request data called `title`, the `@error` will get replaced with the actual error message, if any exist in the first place, if no errors exist, then `@error` is removed from the view.

What if you don’t want to display an error message for one specific field but output something if errors exist for a specific field, well with the `@error` directive you can pass in a second argument to achieve that functionality:

```
<div id='error'>

	<p id='title' class='{{ @error(title, invalid-field) }}'>My Title</p>

</div>
```

So now whenever any errors exist for the `title` field Polyel will output the string `invalid-field`, which in this case relates to a CSS class, used to make an error more visible by applying an error style to a HTML element.

You are free to also include any HTML along with this second argument as well, for example:

```
{{ @error(password, <strong>Woah! - There has been an error</strong>) }}
```

You can also use the actual error message within this second argument as well:

```
{{ @error(password, <strong>Woah! - There has been an error: @message</strong>) }}
```

Wherever you place `@message` will be where the actual error message is placed.

If no errors exist, then the tags are just removed and nothing is output, only when errors exist for the given field, is when something is processed using `@error`.

For when you have errors which are part of a group or nested array, you may use dot syntax to access them:

```
{{ @error(login.email) }}
{{ @error(login.password) }}
```

The first element `login` would be the group name in this case but if this array was deeper you could do `login.details.email` for example.

### Displaying the error count

If you wish to display the number of errors a given field has after validation onto a view, you can do this by using `@errorCount`:

```
<div id='errors'>{{ @errorCount(content) }}</div>
```

Expecting you to pass in the name of the field from the request data. If no errors are found then 0 will be shown. If your error is part of a group you may use dot syntax to access it, for example:

```
{{ @errorCount(post.content) }}
```

## Showing Old Request Data

When validating data from the request, if errors exist, Polyel redirects to the previous URL and the errors are supposed to be displayed there but, what if you want to make it easier for your users to change invalid data without having to completely reenter it again? – Polyel offers you a view directive called `@old` which is used to display old/previous data from a request, stored in the session, whenever the validator fails and redirects to display errors.

```
<form action="/" method="POST" enctype="multipart/form-data">

	<input type="text" class="{{ @error(name, invalid) }}" name="name" value="{{ @old(name) }}">
	<input type="text" class="{{ @error(email, invalid) }}" name="email" value="{{ @old(name) }}">
	
	<input type="submit">

</form>
```

Each time data is found with the request, Polyel will store this in the session so you can inject it back into the view using `@old` when redirecting back and so data does not have to be reentered again after failing validation.

If your data is part of a group or nested you may use dot syntax to access the data. For example:

```
{{ @old(blog.post.name) }
```

You may also give a default value if no old request data can be found within the session:

```
{{ @old(name, John Doe) }
```

## Working with Arrays

Most of the time request data is not nested but if you have to nest your data, you can access nested elements by using dot notation where applicable. For example, to access nested values during validation:

```
$request->validate([
		'blog.post.heading' => ['Required', 'Max:64'],
		'blog.post.content' => ['Required', 'Between:100, 2500'],
	]);
```

If your array has multiple elements you can validate those by using `*` as a wildcard:

```
$request->validate([
		'user.*.email' => ['Required', 'Email'],
		'user.*.bio' => ['Required', 'Max:500],
	]);
```

You can also validate array elements at the start or end as well, like `*.user.email` or `post.tags.*`.

## Redirecting with Errors

Sometimes your data may pass validation and be completely correct in the format your applications expects, but there may be a time where you need to perform more complex checks and actions once your data is valid. So, that is why Polyel allows you to redirect with errors which in the end you can treat them the same as if they were errors coming from the validator.

```
return redirect('/payment/trading')->withErrors([
	'card' => 'This card will not work with this type of account',
	]);
```

From the Controller level you can return this type of redirect and Polyel will include this error into the session or as a JSON response if that is what the request expects. These redirect errors will work normally with the way you display errors from the validator as well.

If you want to attach these redirect errors into a group because you have multiple forms on a page, pass in a second argument:

```
return redirect('/payment/trading')->withErrors([
	'card' => 'This card will not work with this type of account',
	], 'payment');
```

This way all the errors from this redirect are part of the `payment` group and will only display when you use this group name when displaying errors on a view.

If you use a group, remember `@old` will require you to define the group name as well if you wish to inject old session data.

## Validation Rules

A list of the provided validation rules you can use and their meaning:

[Accepted](#accepted),
[ActiveURL](#activeurl),
[After](#after),
[AfterOrEqual](#afterorequal),
[Alpha](#alpha),
[Alpha Dash](#alpha-dash),
[Alpha Numeric Dash](#alpha-numeric-dash),
[Alpha Numeric](#alpha-numeric),

#### Accepted
---

Used for checking a field’s value equates to a true state like a checkbox for example, this rule deems the following values as true and anything else as false: yes, on, true, 1.

#### ActiveURL
---

Validate that a URL is active by checking it can return a hostname, works for both IPv4 and IPv6 addresses.

#### After
---

`After:date`

Validate that the field is a date and that the date is after the given value.

For example:

```
'end_date' => ['Required', 'After:tomorrow']
```

Or you can pass in a formatted date:

```
'end_date' => ['Required', 'After:2021-08-28']
```

You may pass other date formats in but it is best to stick to `yyy-mm-dd` as all the dates are processed through the `strtotime` PHP function.

You can also use another field's value:

```
'end_date' => ['Required', 'After:start_date']
```

#### AfterOrEqual
---

`AfterOrEqual:date`

Validate that the field is either after or equal to the given date, operates the same as the [After](#after) rule but also checks if dates are equal.

#### Alpha
---

Validate that a field’s value is only alphabetical characters. Supports any language and Unicode.

#### Alpha Dash
---

Validate that a field’s value is only alphabetical characters with either using dashes or underscores, but no numbers. Supports any language and Unicode.

#### Alpha Numeric Dash
---

Validate that a field’s value is only alpha-numeric characters with either using dashes or underscores. Supports any language and Unicode.

#### Alpha Numeric
---

Validate that a field’s value is only alpha-numeric characters. Supports any language and Unicode.