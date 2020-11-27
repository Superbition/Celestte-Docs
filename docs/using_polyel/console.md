---
id: console
title: Console
---

## Introduction

Polyel comes with a command-line interface built-in which allows you to use a range of included commands to make development easier and enable you to manage your application from the command line. You can even write your own commands and perform actions in a similar manner to how you write controllers or middleware.

Let's run our first command:

```text
php polyel welcome <your-name>
```

The `welcome` command will greet you and welcome you to the Polyel console and show you a range of useful links surrounding the project.

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

## Command IO

### Accessing Command Input

When your command is executed you can then gain access to all the arguments and options passed to your command, for example, to access a specific argument:

```php
$this->argument('user');
```

And to get all the arguments at once:

```php
$this->arguments();
```

The same goes for command options:

```php
$this->option('-o');
```

And to access all the given options:

```php
$this->options();
```

### Prompting for User Input

#### Normal Input

To make it easy to accept user input from the command line, you can use the `ask()` method:

```php
$input = $this->ask('How old are you?: ');
```

Once the user enters their age and hits enter, the result will be stored inside of `$input`.

#### Secret Input

Sometimes you may want to accept sensitive input such as a password and that is where you can use the `secret()` method to automatically hide what is typed:

```php
$secret = $this->askSecret('Your password?: ');
```

### Writing Console Output

When you are building your command, you will want to at some point output text to the console, Polyel provides you with a range of method to handle this output for you. Polyel will handle sending output to the right stream depending on the method you use, such as `STDOUT` or `STRERR`, also verbosity will be respected if it is set as well. Each method used to output text has its own colour and style depending on what it is supposed to be used for.

Let’s explore each method used for consoles output...

To output text to the console with no newline at the end:

```php
$this->writeLine('A line with no newline at the end');
```

And to output text with a newline at the end:

```php
$this->writeNewLine('A line with a newline at the end');
```

You can also control the amount of newlines:

```php
$this->writeNewLine('A line with a newline at the end', 2);
```

The above would output two newlines, you may increase it if you like.

#### Specific Output Methods

The following methods have their own style and colour to represent different information:

```php
$this->info('The user account key was used');
```

The `info` method can be used to output general information that may be helpful to the user.

```php
$this->notice('You can add multiple keys');
```

The `notice` method can be used to show information that may be of importance but nothing critical.

```php
$this->warning('This key will expire in 15 days');
```

The `warning` method can be used to alert a user about something during a command, this should not be an error but more of an alert about something.

```php
$this->error('You have to be a user for 2 weeks');
```

The `error` method can be used to show a message about something that failed but will not exit the command, execution will continue.

```php
$this->fatal('This library does not work with version 2 and above, please update!');
```

The `fatal` method can be used to output an error message which will exit the console application and not continue execution after a fatal error is shown.

#### Output Structuring

If you are writing a lot of text to the console, it may be beneficial to define sections and titles to help split up your output and make it easier for a user to figure out what information is being shown, Polyel provides you with two method to help you:

```php
$this->section('Configuration');
```

```php
$this->title('Database');
```

A section is used to define a larger block of text, like a main heading and a title is used to define a sub-heading within a section to help split sections up. However, you may use these methods wherever you like, in any order.

### Command Verbostity

Polyel also provides you with a special console output method called `debug()` which allows you to output information to the console at different verboseness by using verbosity levels.

For example to output at verbosity level 1:

```php
$this->debug("Debug 1111");
```

By default the verbosity is set to level 1 but you may increase up to how many levels you wish. However, it is usually best to only ever go up to level 3.

To set a higher verbosity level, pass the number as an integer to the `debug()` method:

```php
// Verbostity level 2
$this->debug('...', 2);

// Verbostity level 3
$this->debug('...', 3);
```

Each verbosity level is only output is its verbosity level is reached when it is set from the command line.

For example, to run a command at different verbosity levels:

```text
// Level 1
php polyel user:create luke 23 --group=admin -v

// Level 2
php polyel user:create luke 23 --group=admin -vv

// Level 3
php polyel user:create luke 23 --group=admin -vvv

// Level 1 using the long option format
php polyel user:create luke 23 --group=admin --verbostity=1

// Level 2 using the long option format
php polyel user:create luke 23 --group=admin --verbostity=2

// Level 3 using the long option format
php polyel user:create luke 23 --group=admin --verbostity=3
```

Lastly, if you want to run your command in quiet mode where output is limited and only fatal errors are shown, use `-q` or `--quiet`:

```text
// Short option
php polyel user:create luke 23 --group=admin -q

// Long option
php polyel user:create luke 23 --group=admin --quiet
```