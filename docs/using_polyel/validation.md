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

If you have a page which contains multiple forms on it, you will want to define a validation group for it, so that you don’t run into issues when displaying errors, which we discuss later on. To define a validation group for a specific form, we can use the `validateAsGroup` method:

```
// Validation using a defined group for a specific form
$request->validateAsGroup('newPost', [
		'heading' => ['Break', 'Required', 'Max:64'],
		'content' => ['Required', 'Between:100, 2500'],
	]);
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
{{ @errors(list, email) }}
```

And with a field inside a group:

```
{{ @errors(list, login:email) }}
```

The above would only display all the errors for the group called `login` and the field within that group called `email`.

And with a wildcard when wanting to display all error messages from nested elements:

```
{{ @errors(list, login:name.*.email) }}

{{ @errors(list, login:name.luke.email) }}
```

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

For when you have errors which are part of a group `group:field` or nested array, you may use dot syntax to access them:

```
// Shows the email error for the login group
{{ @error(login:email) }}

// Shows the password error for the login group
{{ @error(login:password) }}

// shows the error for Luke's email
{{ @error(login:name.luke.email) }}

// Displays Dan's email error using the given output
{{ @error(login:name.dan.email, <h1>@message</h1>) }}

// Shows the first error in the login group for someones email
{{ @error(login:name.*.email) }}

// Displays the first error in the login group for someones email but using the give output
{{ @error(login:name.*.email, <h1>@message</h1>) }}
```

<div class="noteMsg">Remember <code>@error()</code> will only ever display the first error for the given field, use <code>@errors()</code> to display multiple errors for a field. When using an <code>*</code> wildcard with <code>@error()</code>, it will only display the first error found and not all of them.</div>

### Displaying the error count

If you wish to display the number of errors a given field has after validation onto a view, you can do this by using `@errorCount`:

```
<div id='errors'>{{ @errorCount(email) }}</div>
```

If your field is part of a group `group:field` or an array you may use dot syntax to access it, for example:

```
// Shows the error count for a group named login
{{ @errorCount(login) }}

// Shows an error count for the post content field which is nested
{{ @errorCount(post.content) }}

// Shows an error count for email inside the login group
{{ @errorCount(login:email) }}

// Shows the error count for all the emails
{{ @errorCount(login:person.*.email) }}
```

If no errors are found then 0 will be shown.

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
{{ @old(blog:post.name) }
```

Where the above example shows `blog` being the group and `post.name` being the nested array. A group and nested field is split up by using `:` as the delimiter.

Without a group but for when the field is still nested, you can use dot syntax:

```
{{ @old(post.name) }
```

You may also give a default value if no old request data can be found within the session:

```
{{ @old(name, John Doe) }
```

<div class="warnMsg">If the field you have given to <code>@old</code> is not a string or a number, it will not be output to the view, a blank string will be instead as array to string conversion is not possible</div>

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

<div id="validationLinkContainer">

<div class="validationLinkGroup">

[Accepted](#accepted)
[ActiveURL](#activeurl)
[After](#after)
[AfterOrEqual](#afterorequal)
[Alpha](#alpha)
[Alpha Dash](#alpha-dash)
[Alpha Numeric Dash](#alpha-numeric-dash)
[Alpha Numeric](#alpha-numeric)
[Array](#array)
[Break](#break)
[Before](#before)
[BeforeOrEqual](#beforeorequal)
[Between](#between)
[Bool](#bool)
[Confirmed](#confirmed)
[Match](#match)
[Date](#date)
[DateFormat](#dateformat)
[Image](#image)
[Within](#within)
[WithinArray](#withinarray)
[Integer](#integer)

</div>

<div class="validationLinkGroup">

[IP](#ip)
[IPv4](#ipv4)
[IPv6](#ipv6)
[DateEquals](#dateequals)
[DistinctFrom](#distinctfrom)
[Digits](#digits)
[DigitsBetween](#digitsbetween)
[Dimensions](#dimensions)
[UniqueArray](#uniquearray)
[StartsWith](#startswith)
[EndsWith](#endswith)
[RemoveIf](#removeif)
[RemoveUnless](#removeunless)
[Exists](#exists)
[Unique](#unique)
[File](#file)
[Populated](#populated)
[GreaterThan](#greaterthan)
[GreaterThanOrEqual](#greaterthanorequal)
[LessThan](#lessthan)
[LessThanOrEqual](#lessthanorequal)
[IPNotPriv](#ipnotpriv)

</div>

<div class="validationLinkGroup">

[IPNotRes](#ipnotres)
[JSON](#json)
[Max](#max)
[MimesAllowed](#mimesallowed)
[Min](#min)
[NotWithin](#notwithin)
[Regex](#regex)
[RegexNot](#regexnot)
[Optional](#optional)
[PasswordAuth](#passwordauth)
[RequiredIf](#requiredif)
[RequiredUnless](#requiredunless)
[RequiredWithAny](#requiredwithany)
[RequiredWithAll](#requiredwithall)
[RequiredWithoutAny](#requiredwithoutany)
[RequiredWithoutAll](#requiredwithoutall)
[Size](#size)
[String](#string)
[ValidTimezone](#validtimezone)
[ValidURL](#validurl)
[ValidUUID](#validuuid)

</div>

</div>

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

#### Array
---

The field being validated must be a PHP array.

#### Break
---

`Break:rule|field` - Default is `rule`

When a field has the `Break` rule applied, if it is using the `rule` argument then validation will stop if it fails on an error but continue onto the next field to validate. If the field is using the `Break:field` argument, then validation stops completely on the first error for any field.

You may just use `Break` and the validator will default to the `rule` argument.

#### Before
---

`Before:date`

The field being validated must be before the given date. All dates will be passed into the `strtotime` PHP function. This rule like the [After](#after) rule allows you to use another fields value as the date, for example: 'Before:start_date'. Be careful when validating dates, make sure you are using the correct date formats.

#### BeforeOrEqual
---

`BeforeOrEqual:date`

The field being validated must be a date before or equal to the given date. All dates will be passed into the `strtotime` PHP function. This rule like the [After](#after) rule allows you to use another fields value as the date, for example: BeforeOrEqual:start_date'. Be careful when validating dates, make sure you are using the correct date formats.

#### Between
---

`Between:min,max`

The field being validated must be a size between the given min and max values. As this is a size related rule, it works with numbers, arrays, files and strings. This rule works the same way as any other size rule.

#### Bool
---

The field being validated must be of a boolean type: `true, false, 'true', 'false', 0, 1, '0', '1'`.

#### Confirmed
---

The field being validated must have a field which confirms the fields value, this confirmation field must be called `{field}_confirmed` and must match with the field under validation. This is useful for password confirmations.

#### Match
---

`Match:field`

Validate that two field’s values match and are of the same type.

#### Date
---

The field being validated must be a valid date which is not relative (no timestamp) and work with the `strtotime` PHP function.

#### DateFormat
---

`DateFormat:format`

The field being validated must match the given format, this rule uses the PHP `DateTime` class to parse formats and validate them, so you may use any date format supported by the `DateTime` class. You should either use this rule or `date` when validating dates, not both at the same time.

#### DateEquals
---

`DateEquals:date|field`

The field under validation must match the given date, you may use another field's name as the date value. All dates are processed through the PHP `strtotime` function.

#### DistinctFrom
---

`DistinctFrom:field|value1,value2,...`

The field being validated must be different from the given fields value or different from the given value. Note that you can pass multiple fields or values.

#### Digits
---

`Digits:length`

The field being validated must be numeric and match the exact length defined by the `length` parameter.

#### DigitsBetween
---

`Digits:min,max`

The field being validated must be numeric and between the `min` and `max` parameters in length.

#### Dimensions
---

Allows you to validate an image and its dimensions based on the parameters you pass to the validator. For example:

```
'profileImage' => 'Dimensions:minWidth=400,maxHeight=400'
```

The above will only allow an image to be 400 x 400 and will result in a failure if the uploaded image does not meet these constraints.

The parameters which you can use are: minWidth, maxWidth, minHeight, maxHeight, width and height.

#### UniqueArray
---

If you are working with arrays, you can validate that a field must not have any duplicate values:

```
'person.*.name' => 'UniqueArray'
```

You can also ignore case differences by passing the parameter:

```
'person.*.name' => 'UniqueArray:IgnoreCase'
```

#### StartsWith
---

`StartsWith:value1,value2,value3,...`

Validate that a field starts with one of the provided values in the parameters.

#### EndsWith
---

`EndsWith:value1,value2,value3,...`

Validate that a field ends with one of the provided values in the parameters.

#### RemoveIf
---

`RemoveIf:foo,bar`

The field being validated will have its data and rule removed from the validator if the other field is equal to the given value. So if the other field called `foo` is equal to the value of `bar`, then the field being validated will be removed from the request data returned by the validator.

If you have multiple values you want to validate against you can just keep adding them as parameters like `RemoveIf:foo,bar1,bar2,bar3,…` and `foo` will be checked against all `bar` values.

<div class="noteMsg">If a field is removed because it fails its removal rule validation and the field has other rules to validate against, they won’t be processed because the field has already been removed.</div>

#### RemoveUnless
---

`RemoveUnless:foo,bar`

The field being validated will have its data and rule removed from the validator unless the other field is equal to the given value. So if the other field called `foo` is not equal to the value of `bar`, then the field being validated will be removed from the request data returned by the validator.

If you have multiple values you want to validate against you can just keep adding them as parameters like `RemoveUnless:foo,bar1,bar2,bar3,…` and `foo` will be checked against all `bar` values.

<div class="noteMsg">If a field is removed because it fails its removal rule validation and the field has other rules to validate against, they won’t be processed because the field has already been removed.</div>

#### Exists
---

`Exists:table,column`

The field being validated must exist within the given database table and column.

The Exists rule expects you to pass in the table name and the column name where the validator should check for existing values in the database. However, if you omit the column, the validator will assume the column name is the same as the field name.

```
'tag' => `Exists:post_tags'

'tag' => `Exists:post_tags,tag'
```

With the Exists rule you can also pass in an array and check if multiple values exist within the database, the validator will check all values from the array and pass if they all exist.

#### Unique
---

`Unique:table,column,ignoreId,idColumn`

The field being validated must not exist within the given database table and column.

```
'email' => 'Unique:users,email'
```

With the Unique rule you can ignore a specific ID and this is useful for when a user updates their profile and only changes their username, we don't want to fail on their unchanged email as already existing, as they already own it. So we can specify an ID to ignore and the ID column that we want to ignore; if the ID column is not given, the validator will use the default of `id` as the column name. The Unique rule does not work with arrays.

Ignoring the current logged in user:

```
// $auth is from Polyel\Auth\AuthManager
$userId = $auth->userId();

// Only providing the ID
'email' => "Unique:users,email,$userId"

// Providing the ID column to ignore
'email' => "Unique:users,email,$userId,user_id"
```

<div class="warnMsg">You should never let the user provide the actual ID to ignore otherwise you will be vulnerable to SQL injection attacks, always use an ID which is generated from the server side, like in our example, we use the currently logged in user’s ID from the AuthManager</div>

#### File
---

The field being validated must be a successfully uploaded file and have a reachable file path.

#### Populated
---

The field being validated must be populated and not empty when it is present in the request, this rule will not fail if the field is not sent.

#### GreaterThan
---

`GreaterThan:anotherField`

The field being validated must be greater than the given field’s value and both values from each field must be of the same type. Types of strings, numerics, arrays and files are evaluated on the same basis as the [Size](#size) rule. You must add a type rule like `Integer` or `File` etc… If you want to guarantee type comparison.

#### GreaterThanOrEqual
---

`GreaterThanOrEqual:anotherField`

The field being validated must be greater than or equal to the given field’s value and both values from each field must be of the same type. Types of strings, numerics, arrays and files are evaluated on the same basis as the [Size](#size) rule. You must add a type rule like `Integer` or `File` etc… If you want to guarantee type comparison.

#### LessThan
---

`LessThan:anotherField`

The field being validated must be less than the given field’s value and both values from each field must be of the same type. Types of strings, numerics, arrays and files are evaluated on the same basis as the [Size](#size) rule. You must add a type rule like `Integer` or `File` etc… If you want to guarantee type comparison.

#### LessThanOrEqual
---

`LessThanOrEqual:anotherField`

The field being validated must be less than or equal to the given field’s value and both values from each field must be of the same type. Types of strings, numerics, arrays and files are evaluated on the same basis as the [Size](#size) rule. You must add a type rule like `Integer` or `File` etc… If you want to guarantee type comparison.

#### Image
---

Validates that the file uploaded is an image, valid image types are: jpeg, png, bmp, gif, svg or webp.

#### Within
---

`Within:foo,bar,baz,...`

The field under validation must be found within the list of values set within the rule.

#### WithinArray
---

`WithinArray:anotherFieldArray.*`

The field being validated must exist within the other array defined in the rules parameters. If you only include the array name like `Within:names` and no wildcard, Polyel will assume you mean `names.*` for you.

#### Integer
---

The field being validated must be a valid Integer, even if it is a string containing a valid Integer or numeric value.

#### IP
----

The field being validated must be an IP address.

#### IPv4
---

The field being validated must be an IPv4 address only.

#### IPv6
---

The field being validated must be an IPv6 address only.

#### IPNotPriv
---

The field being validated must not be a private IP address.

#### IPNotRes
---

The field being validated must not be a reserved IP address.

#### JSON
---

The field being validated must be a valid JSON string.

#### Max
---

`Max:64`

The field being validated must not be more than the given max value. Types of strings, numerics, arrays and files are evaluated on the same basis as the [Size](#size) rule.

#### MimesAllowed
---

`MimesAllowed:application/json,text/plain,...`

The file being validated must match one of the given MIME types.

For example, if you want to make sure a file is a `png` image only:

```
'profile_image' => 'MimesAllowed:image/png'
```

Or if you want to only accept a selection of image types:

```
'profile_image' => 'MimesAllowed:image/png,image/jpeg,image/gif,image/bmp'
```

You just need to use the full MIME type standard for the type of file you want to validate.

This rule is the preferred way if you need a reliable method to check the actual file type for an uploaded file, it gets the MIME type from 3 different sources, compares they all match and then checks to see if the detected MIME type matches any of the given types from the parameter list. This rule does not check the file extension, it relies on checking the files content to detect the correct MIME type.

For a list of different MIME types, please visit: https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types

#### Min
---

`Min:3`

The field being validated must not be less than the given min value. Types of strings, numerics, arrays and files are evaluated on the same basis as the [Size](#size) rule.

#### NotWithin
---

`NotWithin:foo,bar,baz,...`

The field under validation must not be found within the list of values set within the rule.

#### Regex
---

`Regex:pattern`

The field being validated must match the given regular expression.

Within the framework, the PHP function `preg_match` is used to execute the given regular expression. The pattern you give needs to follow how `preg_match` expects its pattern to be formatted along with valid delimiters.

An example use:

```
'username' => 'Regex:/^[a-z0-9_-]{3,16}$/'
```

#### RegexNot
---

`RegexNot:pattern`

The field being validated must not match the given regular expression.

Within the framework, the PHP function `preg_match` is used to execute the given regular expression. The pattern you give needs to follow how `preg_match` expects its pattern to be formatted along with valid delimiters.

An example use:

```
'email' => 'RegexNot:/(\W|^)[\w.\-]{0,25}@(yahoo|hotmail|gmail)\.com(\W|$)/'
```

#### Optional
---

The field being validated is allowed to be `null`. When using the `Optional` rule it allows the field to be present in the request data but still pass if it is deemed as `null`.

For example, here is a date input but it is also allowed to be `null` or not present in the request data at all:

```
'date' => ['Optional', 'Date']
```

If the date is left empty or is `null` then the date rule will not be executed against the fields empty value in this case, but if `Optional` was omitted the date rule would fail. If the `date` was not sent at all, there would be no errors because the validator would class the `date` as `null`.

#### PasswordAuth
---

`PasswordAuth:web|api`

The field being validated must pass the authentication from the chosen protector defined as the first parameter, either `web` or `api`.

##### Web Auth

For example:

```
'password' => ['PasswordAuth:web']
```

The above would validate the current authenticated user’s password against the given fields value, so the user must already be logged in for this to not fail.

##### API Auth

```
'api' => ['PasswordAuth:api']
```

The above would validate the given API token against the user based upon the given API client ID. For the API protector to work with this rule, you must pass an array which contains the Client ID and then the actual API token. 

For example, to send the client ID and token using a form you can do this like so:

```
<form action="/" method="POST" enctype="multipart/form-data">
	<input id="api_client_id" name="api[0]">
	<input id="api_token" name="api[1]">
</form>
```

Or if you are using JSON:

```
{
	"api": ["de480d78-a958...", "Bearer 54de0f90e2e4d875741a..."]
}
```

#### RequiredIf
---

`RequiredIf:anotherField,value1,value2,...`

The field being validated must be present and not empty if the specified field is equal to any of the given values from the parameters.

You may list as many parameters as you like as long as the first parameter is the name of the other field.

#### RequiredUnless
---

`RequiredUnless:anotherField,value1,value2,...`

The field being validated must be present and not empty unless the other field is equal to any of the given values from the parameters.

You may list as many parameters as you like as long as the first parameter is the name of the other field.

#### RequiredWithAny
---

`RequiredWithAny:field1,field2,...`

The field being validated must be present and not empty only if any the other given fields are present, the ones defined in the rules parameters.

#### RequiredWithAll
---

`RequiredWithAll:field1,field2,...`

The field being validated must be present and not empty only if all of the other given fields are present, the ones defined in the rules parameters.

#### RequiredWithoutAny
---

`RequiredWithoutAny:field1,field2,...`

The field being validated must be present and not empty only when any of the other given fields are not present, the ones defined in the rules parameters.

#### RequiredWithoutAll
---

`RequiredWithoutAllfield1,field2,...`

The field being validated must be present and not empty only when all of the other given fields are not present, the ones defined in the rules parameters.

#### Size
---

`Size:value`

The field being validated must be equal to the given size value from the rules parameter. The size rule works differently for all the different size types supported by the validator, to change the behavior of how the size rule validates a value, you may need to include a type rule, see the following examples:

```php
// Validate that a string is equal to 6 characters in length
'name' => ['size:6'],

// Validate that a numerical value (integer) is equal to 23, using either numeric or integer rules
'cars' => ['numeric|integer', 'size:23'],

// Validate that an array is only equal to 15 items
'parts' => ['Array', 'size:15'],

// Validate that an uploaded file is only equal to exactly 1024 kilobytes
'image' => ['File', 'size:1024'],
```

#### String
---

The field being validated must be a valid string. Remember to use the `Optional` rule if you want the string to be null also.

#### ValidTimezone
---

The field being validated must be a valid timezone identifier according to the list returned by the `timezone_identifiers_list` PHP function.

#### ValidURL
---

The field being validated must be a valid URL. This rule supports a wide range of URL protocols and many different formats of how a URL is formed, not just a basic `http` web address.

#### ValidUUID
---

The field being validated must be a valid RFC 4122 universally unique identifier (UUID).

This rule supports checking the validity of all versions 1, 3, 4 and 5. For more information please see the RFC [here.](https://tools.ietf.org/html/rfc4122)