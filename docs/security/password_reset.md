---
title: Password Reset
---

## Introduction

When building a web application it is good practice to provide a way for your users to reset their passwords, that being because they forgotten their password and need to regain access to their account. Voltis implements this functionality for you so you don’t have to implement this for every project that you do.

## Reset Routes

By default you should find `Route::addAuthRoutes()` inside your web routes file, by calling this method it will include all of the required password reset routes for you.

## Reset Controller

All of the reset routes will be directed to either the `ForgotPasswordController` or `ResetPasswordController` which are provided with Voltis, they handled all the logic which implements the password reset functionality. You can find them at `app\Controllers\Auth`. You will notice they use a trait, one called `AuthForgotPassword` and another `AuthResetPassword` and this is how they gain their logic to perform the actions needed to reset a user’s password, these traits are part of Voltis.

## Configuration

You have a configuration for password resets inside your `auth.php` configuration file, located at `config\auth.php`, by default it is setup to use the `users` source (your users table in the database), a password reset table called `password_resets`, a timeout of 20 minutes that is the used for how long a user has to wait before sending another password reset email and lastly, an expiration in minutes for how long a reset link can last for, the default is 1 hour.

Here is what the default configuration looks like:

```php
'resets' => [

	'passwords' => [

		'users' => [
			'source' => 'users',
			'table' => 'password_resets',
			'timeout' => 20,
			'expire' => 60,
		],

	],

],
```

## Database Considerations

For password resets to work Voltis needs to store a reset token in the database thus, requiring a table called `password_resets` with the following columns and data types:

- `email varchar(64) -- primary key`
- `token varchar(128)`
- `created_at datetime`

## Reset Views

Voltis provides you with a set of views that are used for password verification, these can be found within your `app\resources\views\auth` directory, specifically `forgotPassword.view.html` and `resetPassword.view.html`. You can change them to however you like, they are just a starting point. The user will be presented with the forgotten password view that requires their email to request a reset link and after clicking the reset link, they will be shown the password reset view.

## Password Reset Process

It all starts with a user navigating to `/password/reset` which will display the reset view where they can type their email to request a reset link, the email will be sent and they will receive a link to perform a password reset.

Upon opening this reset link they will be directed to `/password/reset/{token}` where they will need a valid token to perform a password reset. If the token is valid and not expired they will be able to enter a new password for their account.

After submitting the new password, the token is validated and if correct, the password will be changed, a new hash will be stored in the database and the user will be redirected to the login page where they can login using the new password that they set. Any errors will be displayed on either the forgotten password view or the reset password view.

## Customisation

Pretty much all of the core functionality for password resets is provided to you within the core of Voltis, most of the customisation is done by configuring settings within the `auth.php` file but you can also change how input data is validated from the `ResetPasswordController` but a default setup for data validation is provided.