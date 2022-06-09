---
id: response
title: Response
---

At some point you will want to return a response to the client with data, this can be done by returning from Controllers or Middleware.

## Sending Simple Responses

### Strings

To send a simple string back from a Controller:

```php
namespace App\Controllers;

class WelcomeController extends Controller
{
    public function helloWorld()
    {
        return "Hello World!";
    }
}
```

This is the most basic type of response you can send. By default sending back a normal string will use the `Content-Type: text/html; charset=utf-8` header automatically, unless you change it. You should always aim to return a response from a Controller.

### Arrays

```php
namespace App\Controllers;

class jsonController extends Controller
{
    public function jsonResponse()
    {
        return ["user"=>"joe", "age" => 33, "location" => "uk"];
    }
}
```

When sending back any PHP array, Voltis will automatically convert the array into a JSON object and attach the  `Content-Type: application/json` header.

## Object Responses

While sending a simple response back is quick and efficient you will at some point want more control over the response being sent, Voltis provides you with a Response Builder which can be used to form a response to send to the client using an object to create a more complex return.

### Using the response object

You can access the Response Builder by calling the `response()` helper which will return a new instance of ` Polyel\Http\ ResponseBuilder` which you can then use to create a new response. The response object expects the first argument as the response content.

```php
return response("Hello World!");
```

Currently this response is just a normal string return just like before, but now we can alter the response with more control by calling the response helper...

### Setting the HTTP status

The second parameter for the response object is the HTTP status code. By default this is always set to `200`. But if you need to, you can change it.

```php
return response("Sorry, page not found!", 404);
```

However, you can also set the status like this:

```php
return response("Sorry, page not found!")->status(404);
```

Allowing you to keep on chaining methods.

### Attaching headers

You can attach headers to the Response Builder which are then later added to the response being sent out.

```php
return response("Hello World!")->header("h-key", "h-value");

// or

return response("Hello World!")->usingHeaders([
		"h-1" => "v-1",
		"h-2" => "v-2",
		"h-3" => "v-3",
	]);
```

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

This is a very simple example and there is much more to the view system, visit its full documentation [here.](/docs/using_voltis/views)

## Global Headers

With Voltis it is possible to set headers using the response object or through using a middleware to attach headers to a response. But if you want a set a header for every request, you can use global headers. These global headers can be set inside of `/config/response.php`, an example of this is:

```php
"headers" => [
        "global" => [
			"Header-Key1" => "Header-Value1",
			"Header-Key2" => "Header-Value2",
        ],
    ]
```

Saving you the extra code being used to setup a middleware for only headers or having to set certain headers every time using `response()`.

## Content Types

Most of the time Voltis will set the correct content type for you, like when you return a string or an array but it is best to explicitly define what content you are sending back, to do this, you either set the header yourself or use one of the common provided content types by Voltis.

```php
return response("Hello World!")
			->setContentType("xml");
```

`setContentType()` accepts a lower case string of a supported content type, the most common are:

`json`, `xml`, `text`, `pdf`, `zip`, `jpeg`, `png`, `gif`, `ico`, `svg`

The content type is set within the Response Builder under `$contentType` and by using the appropriate header.

## Adding Cookies

When you want to attach a cookie to an outgoing response, use the response builder to add a cookie.

```php
return response("Hello World!")
			->withCookie("cookie-name", "cookie-value");
```

When setting a cookie the only required arguments are the name and value, Voltis uses the following defaults when they are not set using the cookie functions:

- Name: required
- Value: required
- Expiration (seconds): 86400
- Path: `"/"`
- Domain: `""`
- Secure Cookie (HTTPS Only): `false`
- HTTP Cookie: `true`
- Same Site Setting: `None`

The Expiration is set using the native `time()` function in PHP and expects its value in seconds.

### Queuing Cookies

Sometimes you may want to add a cookie but not return a response right away, that's where you can use the `queueCookie` method:

```php
$response->queueCookie("cookie-name", "cookie-value");
```

This method of adding a cookie uses the same defaults as using the response object.

## Response Redirects

Just like the Response Builder, sending a redirect also has its own object which is used to form a redirect which you can then use to send to the client.

```php
return redirect("/profile/dashboard/main");
```

This will redirect inside the application. If you need to redirect away from a Voltis application, just use a complete URL:

```php
return redirect("https://google.co.uk");
```

By default the status of a redirect is set to `302` and this may be changed by providing a second argument.

```php
return redirect("/profile/dashboard/main", 301);

return redirect("https://google.co.uk", 301);
```

You can also send a redirect and flash data to the session in one line:

```
return redirect('/')->withFlash('type', 'message');
```

## Sending a File

To send a file using Voltis to the browser, you can use the `sendFile()` method which is a part of the response builder class.

```php
return response()
		->sendFile($filePath, $fileName = null, $type = null);
```

This accepts a local file path using `/storage` as the root. The file name is used to display a more friendly name to the client when they download the file, if the default is used where `$fileName` is null, the file name and extension from the file path will be used.

The last argument `$type`, is used to set the file content type so that the client understands better what kind of file it is downloading. Setting the type uses the same function as `setContentType()`. If the file does not exist, a blank response will be returned, so check before that the file exists.

By sending a file like this:

```php
return response()
		->sendFile("/uploads/pictures/82u2j2-2i2j73.png", "Profile Picture", "png");
```

It will automatically add the `Content-Disposition` header which will force a download but it is also better to include your file type to help the client better understand what they are downloading.

<div class="warnMsg">When sending a file you must not set any content inside of response(), it must be left blank as the content being sent is the file. If content is passed in, the file will not be sent and the content will be returned instead.</div>

### Displaying a File

Sometimes instead of sending a file and forcing the client to download it, you may want to just display a file like an image or PDF, you can do this by using `showFile()` which is also a part of the response builder class.

```php
return response()
		->showFile("/uploads/pictures/82u2j2-2i2j73.png", "png");
```

The `showFile()` function takes two arguments, the filePath and is handled the same way `sendFile()` uses it and the content type of the file being shown/displayed. This will send for example display the image on the browser instead of forcing the client to download it. When setting a content type, remember it uses the same function as `setContentType()`.