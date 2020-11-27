---
id: console
title: Console
---

## Introduction

Polyel comes with a command-line interface built-in which allows you to use a range of included commands to make development easier and enable you to manage your application from the command line. You can even write your own commands and perform actions in a similar manner to how you write controllers or middleware.

A good way to start is to see which commands are available to run:

```
php polyel list
```

You may also use the `help` command or options to display information about a particular command, its description and usage:

```
php polyel help create:middleware

php polyel create:middleware -h

php polyel create:middleware --help
```

## Creating Commands

Polyel comes with a range of built in commands for you to use but what if you want to create your own command for your application? Well, it is possible to write your own commands by running `php polyel create:command CheckStatusCommand`. This will generate and setup a new command for you, the first argument will be the name of the command, you are free to name it as you wish but the standard is to usually follow `<Category:Command-Name>Command`. This will create a new command in `app\Console\Commands`.

Where you use the colon to form a namespace of commands, for example, `create:command` is part of the `create` namespace but it is its own command class. You are not required to use command namespaces in your names, it just helps when listing them with the `list` command.

### Command Architecture

Once a command has been generated with `php polyel create:comman <command-name>` you will see a new command class file inside ` app\Console\Commands` this is where all of your application commands are located.

Let’s take a look as how a command class is formatted and what you need to change:

```
<?php

namespace Polyel\Console\Commands;

use Polyel\Console\Command;

class CheckStatusCommand extends Command
{
    protected string $description = 'Outputs the status of the...';

    public function execute()
    {
		// ...
    }
}
```

The first thing you will want to do is set your commands description, briefly state what the command does and its purpose. Then you can start to write your command using the `execute()` method which is called whenever your command is run. You are free to add other methods to implement your command logic but the main method is `execute()`.

### Command Dependencies

When writing commands, it is best to keep them light and let the heavy work be carried out by other services and Models which you can access through dependency injection from the Polyel IoC Container. Either the constructor can be used for dependency injection or method injection for dependencies are supported for the `execute()` method, for example:

```
public function execute(Encryption $crypt, User $user)
{
	// ...
}
```

This allows you to access services from Polyel that are available to you or services that you have created, which are pulled from the IoC Container.

### Command Definition

After you have generated a command and its class, you must then define the definition within the `routing/console.php` file. Similar to how you define routes for web requests, you use this file to define the command name, arguments and its options.

For example, a definition may look like:

```
Console::command('CheckStatus');
```

The first part of the definition string is always the command name, so if you want to define a command like ` CheckStatus` where it doesn’t require any arguments or options, you can just enter the actual command name and nothing else.

You then need to define the command inside your console kernel, this file is located at `app/Console/Kernel.php`. We define our command in here to let Polyel know the action of the command and which class it should use, for example:

```
namespace App\Console;

use Polyel\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected array $commandActions = [

        'CheckStatus' => \App\Console\Commands\CheckStatusCommand::class,

    ];
}
```

You have now completed the entry point for a command and registered it within the console kernel.

#### Defining Definition Input

At some point you will want your commands to accept input, that being either arguments or via options. Let us now explore how we can define a command definition to require arguments and options.

All these definitions are defined with your `routing/console.php` file.

As an example, lets say we are still using:

```
Console::command('CheckStatus');
```

##### Arguments

Arguments are inputs passed to a command that are not prefixed with a hyphen, these can be used to give data to your command, for example if you want to add an argument which allows us to check a status of a job:

```
Console::command('CheckStatus {job}');
```
The above example means the job argument is required, but to make it optional we can define it like:
```
Console::command('CheckStatus {?job}');
```
Prefixing the argument name with a `?` will make the argument optional.

#### Argument Default Values

Sometimes you may want to define an argument that can use a default value if it is not passed:

```
Console::command('CheckStatus {?job=main}');
```

The argument must be already defined as optional, then you can define the default value using a `=` sign. You may not specify a value like `{?job=}` which means the default value would be an empty string.

##### Argument Array Input

Most of the time arguments are used as single inputs to arguments defined in your command definition but, you may want to define an argument which takes an array. For example, let’s say you want an array of users:

```php
Console::command('CheckAge {user=*}');
```

The definition `{user=*}` means this argument called `user` expects an array of input. Everything after this argument will be seen as the arguments array input so something like:

```
php polyel CheckAge user tom harry james luke dan
```

The output of the above command would make `user` equal:

```php
['tom', 'harry', 'james', 'luke', 'dan']
```

Arguments that expect an array of input are best positioned at the end of the argument list, otherwise you will have conflicting argument inputs. For example consider:

```
Console::command('CheckAge {user=*} {country}');
```

The above command definition would fail and you would never be able to input a country argument as its ambiguous when the array input for users finishes. To combat this problem, when entering such a command you can use the `--` argument separator to indicate that the array input has finished:

```
php polyel CheckAge user tom harry james luke dan -- UK
```

This command would then give us:

```php
[
	'user' => ['tom', 'harry', 'james', 'luke', 'dan'],
	'country' => 'UK',
]
```

However, to avoid this requirement of having to use the argument separator, you can define the `user` argument at the end:

```
Console::command('CheckAge {country} {user=*}');
```

##### Options

Another form of user input from a command, are options, they allow a user to set specific flags to alter how the command program will operate. Options are like arguments but they are prefixed with `-` or `--` which define short and long options.

For example, to define a option called “all”:

```
Console::command('CheckStatus {job} {--all}');
```

The `{--all}` option above doesn’t accept a value, it is used as a Boolean switch, so when it is not given its value will be set to `false` and when it is present, its value will be `true`.

#### Options that are required

By default all options are considered optional but you may declare an option as required if you wish, just prefix your option with a `!` like so:

```
Console::command('CheckStatus {job} {!--type}');
```

Required options cannot use default values as they are required and expect a value from the command line input.

##### Options and Default Values

You may give an option a default value so that if it’s not given a value from the command line, the default value is used:

```
Console::command('CheckStatus {job} {--status=all}');
```

You may also not assign a value after the equal sign and the default value will be an empty `string`:

```
Console::command('CheckStatus {job} {--status=}');
```

##### Option Short Notations

There are two ways to define an option, a short syntax and a long syntax:

```php
Console::command('CheckStatus {job} {-s|status=all}');
```

Defining a short and long notation for an option, it means they are linked and classed as the same option, so if you access the option using `-s`, the long option will still contain the same value. Also in this example the default value of `all` is used for both notations.

You may also define short and long options and make them required but without the default value:

```php
Console::command('CheckStatus {job} {!--s|status}');
```

Either `-s` or `--status` can be used to fulfil the requirement of the option.

##### Option Array Input

For options to accept array input such as `-d=3 -d=6` you must define the option with the `=*` wildcard which indicates that an option is allowed to accept array inputs.

For example:

```
CheckStatus {job} {--id=*}

php polyel CheckAge --id=23 --id=43 --id=21
```

The above would give the array:

```php
[
	'--id' => [23, 43, 21],
]
```

If you don’t specific that an option accepts an array, you will be given an error when the command is run. You are allowed to set `=*` on required options as it’s a wildcard.

##### Command Input Descriptions

To aid with the auto help text generation whenever you run the help command or a command using the `-h or --help` option, you can include descriptions for each argument and option within the command definition. Take a look at the example below, you are free to space out your descriptions as much as you like, as long as you split each component up with the correct separator.

```php
Console::command('user:create
                          {username            : The username of the user you want to create.}
                          {email               : The email of the new user.}
                          {?group=student      : The default group to place the user in.}'
);
```

You should keep your argument and option input descriptions short and concise, they only need to describe what the input is for when you use auto help text generation.

Because of how option descriptions are processed, each option that has a default value loses all of its right hand whitespace, if this whitespace is important and you don’t want it to be trimmed, then define your default value between `" "` like so:

```text
{--desc="Hello, my name is " : A default starting description}
```