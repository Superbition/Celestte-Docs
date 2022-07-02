---
title: Request
---

## Getting access to a request

The quickest way to access the request service is to type-hint it using the Voltis container service which will use dependency injection, by type-hinting inside a controller method you can get access to the current request data as shown above. However, type-hinted services must come first before any route parameters.

Take this route for example:

```php
Route::get("/user/profile/{id}", "ProfileController@showProfile");
```

And it's controller defined like so:

```php
namespace App\Controllers;

use Voltis\Http\Request;

class ProfileController extends Controller
{
    public function showProfile(Request $request, $userID)
    {
        $blogPost = $request->data("blogContent");

        echo $userID;
    }
}
```

You can see how the Request service is passed in along with route parameters afterwards, this is because the Voltis dependency injection container passes in services first and then route parameters second.

## Request Capture data

Voltis automatically captures data about the request for you, most of the common request data you can access via class properties.

Below is a list of all the public properties you can use:

`$hostIP`, `$clientIP`, `$userAgent`, `$serverPort`, `$serverProtocol`, `$uri`, `$path`, `$method`.

## Getting input data from a request

You can retrieve data from a request by using `data()` and passing in the inputs name.

```php
$username = $request->data("username");
```

The `data()` function also has a second parameter used to pass in a default if the input does not exist:

```php
$username = $request->data("username", "Anonymous");
```

False will be returned if the input is not present.

### Getting all the data

To receive all the data from a request, simply just call `data()` without any parameters:

```php
$data = $request->data();
```

If no POST data exists or if no raw content is in the body of the request, it will return `false`.

### Accessing data arrays

When receiving requests that are sending arrays in normal forms, you can access the array using dot syntax, for example:

```php
$array = $request->data("cars.type.name");
```

False is returned if no data is found.

### Accessing JSON values

You can also access JSON arrays from the raw body of a request but the header `content-type: application/json` must be set to detect and decode JSON requests.

Again, using dot syntax, access JSON arrays like so:

```
$json = $request->data("web.lang.php");
```

False is returned if no data is found.

:::info
Please note, Voltis uses json_decode() to convert the JSON object to a PHP array which is what is returned
:::

## Max data size for HTTP requests

Currently when getting data from HTTP requests, a default size of 5Mb is set and because HTTP data or file uploads are processed in memory, many requests or large requests could start to take up and use too much memory, so be careful. It is possible to increase the upload size by changing the `maxUploadSize` in `config/server.php` but this will have an increase in memory usage.

More support for larger uploads is coming by utilising streams or chunking uploads with websockets...

## Checking data is present

You may want to check if a request has data present before you do something, you can do this by using `has()`.

This example returns `true` if `email` is present in the request data.

```php
if($request->has("email"))
{
    // ...
}
```

You can also send in an array:

```php
$request->has(["email", "username", "password"])
```

This will return true if the request has all three inputs present.

### Checking for certain data

It is possible to only check for certain inputs using `hasAny()` which will return `true` when any input is found in the request.

```php
if($request->hasAny(["age", "firstName", "lastName"]))
{
    // ...
}
```

You must send an array to `hasAny()`.

## Seeing if an input is filled

```php
if($request->isFilled("email"))
{
    // ...
}
```

Returns true when the `email` input is not `null` and not empty.

## Seeing if an input is missing

```php
if($request->isMissing("username"))
{
    // ...
}
```

Checking if the `username` input is missing from the request, returns `true` if it is not missing.

## Getting URL query parameters

In order to access query parameters from the URL, for example `https://example.com/users/profile?post=209`, you can access the `post` parameter by doing:

```php
$postID = $request->query("post");
```

You can also pass an optional default if no query was found:

```php
$postID = $request->query("post", 1);
```

If no query parameter name is passed, you can return all the query data:

```php
$queries = $request->query();
```

## Request Functions

### path()

```php
$path = $request->path();
```

Returns the path of the request, so a URL of `https://example.com/user/posts` will return `/user/posts`.

### url()

```php
$fullURL = $request->url();
```

Returns the path and any GET queries on the end: `/user/posts?level=55`.

### method()

```php
$requestMethod = $request->method();
```

Returns the request HTTP method, `POST`, `GET`, `PUT` etc.

You can also use `isMethod()` to check the method type:

```php
if($request->isMethod("GET"))
{
    // ...
}
```

### headers()

```php
$reqHeaders = $request->headers();
```

Returns all the headers part of the request.

You can also ask for a certain header:

```php
$reqHeaders = $request->headers("content-type");
```

And you can use `hasHeader()` to check it exists:

```php
if($request->hasHeader("content-type", "application/json"))
{
    // ...
}
```

### bool()

```php
if($request->bool("sendEmails"))
{
    // ...
}
```

Checks if a checkbox called `sendEmails` is checked. Values deemed to be true: `1, "1", true, "true", "on", "yes"`

Everything else will return `false`.

### expectsJson()

```php
if($request->expectsJson())
{
    // ...
}
```

Returns true if the request wants to accept a JSON response from the `Accept` header or when the request sets the content type of `application/json`.

## Request cookie access

To access a cookie value using its name, you can do so by doing:

```php
$cookie = $request->cookie("cookieName");
```

Sends back the cookie value. Will return false if no cookie is found.

## File uploads

To handle file uploads, Voltis using a built in file handler to process uploaded file. We can accept these uploaded files using the request service.

```php
$profilePicture = $request->file("profilePicUpdate");
```

By calling `->file()` it will return an instance of an `UploadedFile` and you can then use this to interact with the uploaded file from a client.

The `UploadedFile` service is based on the `SplFileInfo` PHP class so you have access automatically to its functions and features on each file.

You can also use `files` to retrieve an array of all uploaded files:

```php
$files = $request->files();
```

The `files` method will return null if no files exist for the request.

### Checking for a file

You can use `hasFile` to see if a file is present on the request:

```php
if($request->hasFile("profilePicUpdate"))
{
    // ...
}
```

### Checking for any files

The method `hasFiles` can be used to detect if any files have been uploaded at all, it will return true if any files exist and false if no files have been sent at all.

```php
if($request->hasFiles())
{
    // ...
}
```

It will return true if the file is found and false when no file exists on the request.

### Making sure a file is valid

```php
if($request->file("profilePicUpdate")->isValid())
{
    // ...
}
```

This ensures that the file is valid and uploaded with no issues, returns true when valid and false when there was an error.

### Max file size with uploads

A default setting of 5Mb for the max file size is set because uploads are processed in memory, please read more about it [here](#max-data-size-for-http-requests) on how to change it and when larger file sizes are supported.

### Checking upload errors

To view all upload errors and problems with a uploade file:

```php
$fileProblems = $request->file("profilePicUpdate")->errors();
```

Returns an `array` of errors with messages of what went wrong during upload.

### Saving the uploaded file

To save an uploaded file to a file-system, for example local storage:

```php
$request->file("image")->save("/images/upload", "local");
```

Expects the file path to the directory with where to save the new file and the disk you want to use.

Do not pass in a file name here as Voltis will automatically generate a unique file name for you in, for example:

`49-5ea05a13c33423-73204971-70` 

You should not (hopefully) run into any collision issues with Voltis automatic name generation, it uses PHP’s ` uniqid()` with more entropy set and generates random integers from `1-100` which get prefixed and suffixed onto the final file name.

#### Saving with without a unique name

If you want to, you can save a file with a name you choose.

```php
$request->file("image")->saveAs("/images/upload", "profile_img_83937261.png", "local");
```

Expecting the file directory path, the actual file name you want to use and the disk to save to.

:::caution
Currently only local storage is supported, cloud storage and other drives are in development
:::

### File Functions

#### path()

```php
$request->file("image")->path();
```

Returns the file path without the file name.

#### fullPath()

```php
$request->file("image")->fullPath();
```

File path with the file name as well.

#### extension()

```php
$request->file("image")->extension();
```

Returns the uploaded file extension. In the future this function will be updated to support guessing the file extension based on its contents instead of just returing the uploaded one.

### File Upload Properties

Once an uploaded file is processed, you have access to multiple public class properties for file information:

```php
$request->file("image")->realName;     // The client file name
$request->file("image")->type;         // Type of file, based on contents
$request->file("image")->extension;    // File extension
$request->file("image")->tmpName;      // Temp file name
$request->file("image")->errorCode;    // Error code from PHP's upload codes
$request->file("image")->size;         // File size in bytes
```
