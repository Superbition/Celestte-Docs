---
id: session
title: Session
---

## Introduction

HTTP applications and requests are by default stateless, meaning they don’t hold data between requests, as far as the HTTP server is concerned, each request is separate from another. To enable us to store data between requests, we use a session and Polyel provides a session system ready for you to use. By default the session system uses the file system to store sessions as JSON objects, support for other session systems like database or Redis are supported.

## Setup

The default session driver is file based storage and a session is created no matter what, even if you are not authenticated, a client will have its own session. You can review the session system configuration by opening `/config/session.php`. File based session storage will work for most application loads.

#### Session System Drivers

- `file`: File based session storage, located in `/storage/polyel/sessions/`

> Support for more session drivers are in development, like database and Redis etc.

Let's review some of the session options in `/config/session.php`:

- `driver`: The session system storage being used, default is file based
- `lifetime`: The cookie and session lifetime, session is removed if this lifetime is expired
- `cookieName`: The name of the session cookie sent to the client
- `prefix`: Session ID prefix, placed in front of the session ID given to a client
- `cookiePath`: Standard cookie settings for the Path option
- `domain`: Cookie option for the domain
- `secure`: If the cookie should only be allowed on HTTPS connections
- `httpOnly`: If the cookie should only be accessible via HTTP

More details are in the actual configuration file for the session.

## Interacting with a Session

A session is automatically created for you by the session manager, you don’t have to worry about when a session is invalid or not, the session manager checks the session on each request. If a session is invalid, one will be regenerated for the client. Each request, the session manager will also update session data like IP, user agent and the last active timestamp.

### Getting session data

There are two ways to access the session, either through type hinting the session service and letting the service container inject it into a controller method or by using the session facade.

#### Using the service container to access the session

To access the session service inside a controller, take this example:

```php
<?php

namespace App\Controllers;

use Polyel\Session\Session;

class SessionDataController extends Controller
{
    public function getFavColour(Session $session)
    {
		// Using type hinting to access the session service
        $favColour = $session->get('favs.colour');

        return $favColour;
    }
}
```

As controller method action dependencies are automatically resolved by the service container (DIC), we can type hint that we want the session service, then that gives us access to the session, in this example we are getting the users favorite colour and sending it back.

#### Using the Facade to access the session

To access the session via its Facade, include the namespace and access it like a normal static class:

```php
<?php

namespace App\Controllers;

use Polyel\Session\Facade\Session;

class AgeController extends Controller
{
    public function getAge(Session $session)
    {
		// Using the Session Facade
        $age = Session::get('age');

        return $age;
    }
}
```

Remember the Facade is interacting with an instance of the session service, not a static version of the class.

#### Setting a default using get() and dot syntax

When using `get()` to access session data, it accepts a key, which can as you've seen from above, can also accept array keys using dot syntax. But you can also set a default value if the key is not matched.

```php
return $session->get('key', 'default');

return $session->get('key1.key2.key3', 'default');
```

By default the return value if no match is found is `null`.

#### Returning all session data

```php
$session->all();
```

Returns the whole session data, in the format of a PHP array, converted from a JSON object.

#### Returning just the session data

```php
$session->data();
```

Only returns the session data part of the JSON object. The format is a PHP array.

### Checking if certain data exists

#### Using `has()` to check for non-null and non-empty values

```php
if($session->has('age'))
{
	return $session->get('age');
}
```

#### Using `exists()` to check for null and empty values

```php
if($session->exists('age'))
{
	return $session->get('age');
}
```

### Storing session data

Because sessions are started and handled automatically for us by Polyel, we have access to the session right away, there is no starting session configuration to worry about. So we can store data right away.

A simple data store example:

```php
$session->store('age', 34);
```

Remember you can use dot notation here as well:

```php
$session->store('info.person.age', 34);
```

When storing data, if the key or array key does not exist yet, it will be created for you.

Values will be overwritten if you call `store()` with the same key again. You need to push data instead...

#### Adding a new array to the session

You can add an array to a session key by doing:

```php
$session->store('user.teams', ['dev team 1']);
```

#### Pushing data to the session

When you want to keep adding data to the end of an array in your session and not overwrite your key, you can push to the session.

For example, push onto the teams array:

```php
$session->push('user.teams', 'team 1');
$session->push('user.teams', 'team 2');
$session->push('user.teams', 'team 3');
```

<div class="noteMsg">Make sure the key you are pushing to is already an array or else you will lose the original value</div>

### Deleting session data

To remove data from a session, we can use the `remove()` function.

```php
$session->remove('counter');
```

This removes the data key `counter` from the session.

You can also remove multiple by sending in an array to `remove()`.

```php
$session->remove(['data.one', 'data.two']);
```

This will remove `data.one` and `data.two` but only the last element gets removed, `data` will still exist. If you want to remove an entire array element, we would just do:

```php
$session->remove('data');
```

You can also remove indexed elements by passing in the index number:

```php
$session->remove('test1.test2.test3.0');
```

The index `0` will only be removed here.

#### Pulling data from the session

When you call `pull()` it will grab the data you requested but then remove the same value from the session in one statement.

```php
$session->pull('remove.me', 'Cannot pull data');
```

The second parameter is the default value which is returned if no match is found. If a match is found `remove.me` will be removed, but remember it will be the last element that is removed.

### Clearing the Session

Sometimes you may want to clear the session data without having to totally destroy the session completely, Polyel allows you to use `clear()` in order to just wipe out the session data.

```php
$session->clear();
```

Clears out only the session data and sets it to `null`.

## Regenerating the session

Default behavior is Polyel will handle creating and managing the session cookie and data, a session is created no matter what, even if you are not authenticated. But you should regenerate the session at certain stages, so Polyel gives you the ability to regenerate the session ID but still keep the data from the old session.

```php
$session->regenerate();
```

Does not require any parameters, just call the function and the session will be regenerated and the session cookie will be queued.

<div class="warnMsg">Be careful not to regenerate the session too frequently as it may cause unexpected results and multiple sessions may be created if old session IDs are constantly being rechecked. Only regenerate the session at suitable times. </div>

## Session Garbage Collection

Polyel automatically runs a session garbage collection process every 30 minutes to remove old sessions, this happens asynchronously and does not affect server performance with requests, the process runs in the background in a non-blocking manner. You can set the session lifetime in the config at `/config/session.php`.