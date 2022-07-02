---
title: Email Verification
---

## Introduction

When building web applications it is good practice to make sure a user verifies their email address before being able to access certain pages or perform certain actions, this helps reduce spam and makes sure your users have a valid email address. Voltis provides you with a built in solution so you don’t have to implement this logic for each project you build.

## Verification Routes

By default you should find `Route::addAuthRoutes()` inside your `web` routes file, by calling this method it will include all of the required email verification routes for you.

## Model Considerations

By default Voltis already provides you with a starting User Model for you and it should already implement an interface to provide a few email verification features, it should look similar to this:

```php
namespace App\Models;

use Voltis\Database\Facade\DB;
use Voltis\Model\User as Model;
use Voltis\Auth\Contracts\EmailVerification;

class User extends Model implements EmailVerification
{
    // ...
}
```

The User Model is special because it extends a different core Model to any other, it uses the core Voltis User Model, which provides different features for interacting with users but for the scope of email verification, you can see we extend the `Voltis\Model\User` Model as ‘User’.

## Database Considerations

For verifying emails, Voltis doesn’t use any additional database tables, just one column within your users table called `email_verified_at` to store the date and time when a user confirmed their email, making them a verified user. Make sure this column can store a `datetime`.

## Protecting Routes

To protect a route that requires a user to have their email verified before accessing a page, Voltis provides you with a Middleware called `IsVerified` which is registered and defined as ` \App\Middleware\UserVerification::class` inside your Middleware configuration.

All you need to do is add this as a Middleware to your desired route:

```php
Route::get("/admin", "Admin@showDashboard")->middleware(['IsVerified']);
```

When a user tries to access the `/admin` page they will need to have verified their email before they can gain access. If they have not verified their email, they will be redirected to a page which displays an error message about email verification.

For more control you can utilise the User Verification Middleware to perform additional tasks or return a custom response:

```php
public function verificationFailed(Request $request)
{
	// ...
}
```

The `verificationFailed` method is called when the user has not verified their email address yet and allows you to perform any actions if this happens, you can return a custom response if you like or leave empty and use the default Voltis response.

## Verification Views

Voltis provides you with a starting view for displaying email verification errors and messages, you can find this view at ` app\resources\views\auth\verification.view.html`, you may edit this to your liking.

## Verification Process

The first thing to know about email verification is that one is sent after a user successfully registers with your application. If you don’t want this behaviour then remove the call to `sendVerificationEmail` inside `registered` from your Register Controller.

Once a verification email has been sent, the user can open up their email and click on the button to verify their email, verification is implemented in a way which it requires the user to be logged in. So if they are accessing the verification email from a device where they are not logged in, they will need to authenticate first, before they can verify their email.

During email verification, it is all handled by the provided `VerificationController` as it uses the included `AuthVerifyEmail` trait to provide the functionality. By default this controller ships with ` $redirectTo` which is used to redirect the user after they successfully complete email verification, the default redirection is `/`. You may change this to whatever you like.

If for some reason email verification fails from using the provided link, that being an expired verification link or incorrect formatting or invalid verification data, the user will be presented the verification view. You can see this view which is located at `app\resources\views\auth\verification.view.html` and you may edit it to however you like, it’s just a starting point. However, this verification view is used to allow the user to request a new verification email if for some reason they didn’t receive one or have lost it. Upon any errors the user will be notified via this verification view where they can react to it from there.

The special URL which is sent to the user to use for email verification is a signed URL with a timestamp, meaning the URL cannot be edited or tampered with. The verification is complete when the signature from the URL is compared with the hashed and signed URL using the encryption key from your application and that the expiration timestamp is still valid.

Finally, the verification controller provides you with a method called `verified` which is called once a user has passed verification, this gives you the opportunity to perform additional actions when this event is triggered. You can find this method inside `app\Controllers\Auth\VerificationController.php`.