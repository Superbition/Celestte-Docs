---
id: csrf_protection
title: CSRF Protection
---

## What is CSRF Protection?

CSRF (Cross-Site Request Forgery) is an attack where a malicious user could perform a request on your behalf, making unauthorized requests using a fully authenticated user. This works because HTML forms using the `POST` method or AJAX requests can be sent on behalf of a authenticated user, making it look like the users intent was legitimate but it was actually sent by a third party.

Polyel prevents this attack by using CSRF tokens which are generated on the server as cryptographically secure strings, stored in the users session and injected into HTML forms as a hidden input, then when the form under a `POST` request is sent and if the two CSRF tokens match up, the request is deemed valid. However, if the tokens don’t match the request is rejected and a `401` response is returned.

All this happens using a Polyel Middleware which will execute before the request can go further into your application. This Middleware is included by default and is enabled globally for all `POST`, `PUT`, `PATCH` and `DELETE` requests.

The basic requirement for this protection to work is to make sure to include the CSRF token on all HTML forms, Polyel makes this an easy task as you only have to include the CSRF view tag:

```
<form method="POST" action="/update/profile">

	<label>First name:</label><br>
	<input type="text" name="fname" value="John"><br>

	<label>Last name:</label><br>
	<input type="text" name="lname" value="Doe"><br><br>

	{{ @csrfToken }}

	<input type="submit" value="Submit">

</form>
```

By including the CSRF view tag, the token from the server, which gets the token from the users session data is injected into your form and protections this form from CSRF attacks, Polyel will now automatically validate `POST` requests for you.

## URI Exceptions from CSRF Protection

Depending on your purpose, you may want to turn off CSRF protection for certain URIs as some services won’t have access to your CSRF tokens, meaning it would make a request invalid. Polyel allows you to add an array of URIs which will be excluded from CSRF protection in the provided Middleware:

```
<?php

namespace App\Middleware;

use Polyel\Middleware\CsrfTokenVerifier;

class ValidateCsrfToken extends CsrfTokenVerifier
{
    /*
     * URIs that shall be excluded from CSRF Token verification.
     */
    protected array $except = [

        // For example:
        '/api/*',
        '/payment',

    ];
}
```

<div class="warnMsg">By default <code>/api/*</code> is added to the exceptions array, you may remove it but API routes should be authenicated with API tokens instead</div>

## CSRF Header & JavaScript

You may have realised that HTML forms are protected from CSRF attacks but what about JavaScript AJAX requests if you are building a JavaScript driven application? – Polyel recommends you either get the token from a valid HTML form or store the CSRF token inside a HTML `meta` tag:

```
<meta name="csrf_token" content="{{ @csrfToken }}">
```

By using the CSRF view tag to inject the token into this `meta` tag you can use that to add the valid token into all your JavaScript AJAX requests for example. When using JavaScript to send HTTP requests, you can either include the CSRF token in the POST data or as a HTTP header called ` X-CSRF-TOKEN` as Polyel will check for both locations.

```
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf_token"]').attr('content')
    }
});
```