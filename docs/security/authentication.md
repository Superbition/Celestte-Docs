---
id: authentication
title: Authentication
---

## Introduction

Polyel offers an authentication system which is already setup and ready to go, taking the hassle of you having to implement your own authentication for logging in and registration. API token based authentication is also offered out of the box for you as well, allowing you to quickly start building a web or API based application and giving you a decent level of customisation to alter the authentication system to suit your needs.

The authentication system provided with Polyel uses the database to access and store users, it integrates with your users table to provide authentication and registration. Each user table is defined as a `source`, for example, you may have a normal user `source` and a admin `source`, which at the basic level are just database tables but, for most applications you will only need a user table and won’t need to bother splitting up different users like admins or moderators, they can just simply use the same table but you are free to use multiple if you like.

For performing authentication and authorisation, Polyel uses what we call `Protectors`, which are used to authenticate different types requests. Polyel comes with two `Protectors` one for session and cookie based authentication, for your browser web requests and one for API authentication, where it uses a client ID and token to validate users.

After installing Polyel the authentication system is mostly already ready to work for you, it just requires some minor configuration to fully utilise it. Also, you are free to implement your own and not use the provided authentication system with Polyel but it is very easy to alter to adapt to most requirements for any authentication system.


## Configuration

All of the configuration for the authentication system can be found inside `config/auth.php` and in there is where you can adapt most of the auth system to how you want it setup.

The default configuration settings are set so you should not have to change anything in order to get it working straight away but you may tweak anything to your liking.

Please visit the actual configuration file to read the more detailed comments for what everything does.

## Database Setup

For the authentication system to work, you need to consider how your database is setup.

- Make sure your users table is in sync with what is configured in the `auth` configuration file where your source table is set. Most applications will just require a table called `users`.

- Your password reset table should use the same name set inside your `auth` configuration.

- In your users table, it is best to set the `password` field to a max of 255 to enable secure password hashes to be stored there.

By default Polyel provides you with a User Model which you can use to create new users who register with your application, we will discuss that later.

## Routes

Out of the box Polyel has already setup the authentication routes for you and they are provided in the web routes file by default. These routes are added by the call to ` Route::addAuthRoutes()` and this registers all the endpoints for login, registration, forgot password, reset password, logout, password confirmation, email verification and validation.

## Controllers

Because authentication is very common when building web applications, Polyel provides you with all the logic for routing these types of requests out of the box, you don’t need to install anything else. So Polyel already has all the controllers necessary to perform what you need for a full authentication system, navigate to `app/Controllers/Auth` to see the provided logic.

Each controller uses a trait from the core of Polyel to provide most if not all of the functionality needed, depending on your application, some controllers give you extra methods to perform additional logic for when a decision needs to be make, giving you the ability to customise certain logic. 

For example, the login controller uses the `AuthLogin` trait to provide the authenication logic and gives you:

```
private function username(Request $request)
{
	return 'email';
}

public function additionalConditions(Request $request)
{
	return ['banned' => [0, 'Your account has been banned and you cannot login']];
}

private function success(Request $request, $user)
{
	if($this->session->exists('intendedUrlAfterLogin'))
	{
		return redirect($this->session->pull('intendedUrlAfterLogin'));
	}

	return redirect('/');
}

private function failed(Request $request)
{
	// ...
}

public function loggedOff(Request $request)
{
	return redirect('/');
}
```

As you can see from the example above, at certain points these methods are called to give you the ability to change what happens from the default outcomes, the `username` method is used to tell Polyel what is required as an Identity when logging in. The `additionalConditions` method is run when trying to log in a user, these key values must match columns in the users table form the database, the example here is making sure the user is not banned along with a message to display if this comparison fails. The ` success` method is called when a user successfully validates against the authentication system and tells Polyel what to do when a login is successful, by default the user is redirected to their intended URL or to the home page. The `failed` method is called when a login attempt fails for some reason. Finally, ` loggedOff` is called when the user logs themselves off, they get redirected to the home page.

Each method is designed to be very self-explanatory, so please check out the other controllers to see which methods are available.

## Views

Polyel also provides you with a set of starting views for each authentication route, like the login and registration pages etc. You can find these inside ` app/resources/views/auth`. You may customize each view to your liking, be sure to check out how each view is constructed, each view is a starting point and comes with basic structure and styling.

## User Registration

The provided `RegisterController` is used to route all new user registrations to your application, you can use this controller to manage these requests. By default it uses a trait called `AuthRegister` to provide the core functionality of user registration and a method called `create` to let you handle what happens when a new user is created, you may use this method to alter this process; the `create` method calls the `User` model which is already created by default, the idea is that this method is used for creating new users in the database.

If you require different or more fields other than a username, email and password for creating a new user, please alter this controller to suit your needs and update the `validation` method which will make sure your request data is the correct format before being entered into the database.

## Protecting a Route

To protect a specific route that requires a valid authenticated user, you must use the route middleware called `Auth` which is already defined for you in ` config\middleware.php` as `\App\Middleware\Authenticate::class`.

Let’s say we want to protect `/admin/dashboard` we would need to do:

```
Route::get("admin/dashboard", "AdminController@welcome")
	   ->middleware(['Auth', 'IsVerified', 'ConfirmPassword']);
```

By default if you don’t pass any middleware parameter to `Auth` it will use your configured default protector located in ` config\auth.php`. You can also see we have `IsVerified` and `ConfirmPassword` - They make sure the users email is verified and that their password has been confirmed, kind of like a sudo mode. Please check the middleware configuration to see which classes are being used from the Polyel core.

### Auth Middleware Outcomes

When using the provided `Auth` middleware, it extends the core ` Authenticate` middleware provided by Polyel to perform authentication for your requests, it is defined as `Polyel\Auth\Middleware\Authenticate` and your `Auth` middleware is located at ` app\Middleware\Authenticate.php`. Inside your app `Authenticate` middleware it comes with a set of authentication outcomes, allowing you to decide what happens when a user is authenticated or unauthenticated.

For example, you can alter what happens when the user tries to access a protected route and is unauthenticated or what happens when a user is authenticated:

```
public function unauthenticated()
{
	return redirect('/login');
}

public function authenticated()
{
	// ...
}
```

## Checking if a User is Authenticated

To check if the user is currently logged in and authenticated, you can use the `AuthManager` to `check` if they are:

```
use Polyel\Auth\AuthManager;

if($this->auth->check())
{
	// The user is logged in...
}
```

The check method will return either `true` or `false` and use the session system to decide if a user is currently logged in.

## Accessing the Authenticated User

Once a user is authenticated and valid, during a request you have quick access to that use via the Authentication Manager, you can use `user` and userId` to gain quick access to the current logged in user.

```
use Polyel\Auth\AuthManager;

// Returns an instance of GenericUser
$user = $this->auth->user();

// Obtaining user information
$user = $this->auth->user()->get('email');

// The user ID from the users table
$userId = $this->auth->userId();
```

## Password Confirmation

You may have specific routes and pages that are more sensitive than others, like a settings page or an admin panel, so Polyel provides you with a Middleware to force a user to confirm their password again, once already authenticated, meaning the user will enter a `sudo` type of mode and the password won’t be asked again for a few hours. This kind of protection allows you to add an extra layer of security to important and powerful pages to your application.

The Middleware which implements this feature is called `ConfirmPassword` and to use it, all you need to do is apply it to a route:

```
Route::get("/user/billing", "Billing@index")->middleware(['ConfirmPassword']);
```

The Middleware is already defined for you in your `middleware.php` configuration file and is defined as `\App\Middleware\ConfirmPassword::class`.

Now if a user has not recently logged in and tries to access the billing page, they will be asked to confirm their password before gaining access. This password confirmation by default lasts for 2 hours, you can alter this within your `auth.php` configuration file and change `password_confirmation_timeout`.

When the user successfully confirms their password, they are redirected to the intended URL they tried to access. Checkout the provided Middleware at ` app\Middleware\ConfirmPassword.php` to see the two methods that you can use when password confirmation is triggered and when it is not required.

You may change the `ConfirmsPassword` view and controller however you like as Polyel provides you with a default view and controller for password confirmation. The controller can be found at ` app\Controllers\Auth\ConfirmPasswordController.php` and the view at ` app\resources\views\auth\confirmPassword.view.html`. Inside the controller you can setup the validation for the password input, a default is set for you but you may change this however you wish.

## Logging Out

Polyel also handles logging out users for you as well, the defined route for performing a log out is `/logout` and uses the `LoginController` to perform this action. If you look inside ` app\Controllers\Auth\LoginController.php` you will see a method called ` loggedOff` which you can use to decide what happens when a logout happens, by default the user is redirected to the index route.

```
public function loggedOff(Request $request)
{
	return redirect('/');
}
```

You may alter this however you like, just remember that a logout action should only work with `POST` requests, so when creating a logout button on a HTML page, it won’t work with `GET` requests. 

However, you can also manually logout a user by calling `logout` with the Authentication Manager:

```
use Polyel\Auth\AuthManager;

// Logout the currently authenticated user
$user = $this->auth->logout();
```

