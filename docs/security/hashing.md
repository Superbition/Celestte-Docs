---
id: hashing
title: Hashing
---

## Introduction

In Polyel you are provided with a hashing Facade called `Hash` which gives you access to hashing functions for storing user passwords, based on the PHP native functions and algorithms supported by PHP. Polyel works with three major hashing algorithms: Bcrypt, Argon2i and Argon2id.

The Polyel registration and authentication system will by default use ` argon2id` as the hashing algorithm to handle passwords, ` argon2id` is also the default set within the hashing configuration file.

<div class="warnMsg">As Polyel by default will use the Argon2id hashing algorithm, PHP 7.3.0 is required</div>

## Configuration

All the configuration and default settings for hashing is stored in `/config/hashing.php`, please visit this configuration file to see which options you can change based on your hardware setup, suitable defaults have been selected.

## Using the Hash functions

First you will want to make sure you include the Hash Facade: `Polyel\Hashing\Facade\Hash`

### Creating a Password Hash

```
$hashedPassword = Hash::create('secure_password');
```

This will return your hashed password, something like:

`$argon2id$v=19$m=1024,t=2,p=2$dEVDSG9aTWlWVjA3aW04cw$V7fauQWTYyxCMfmhXDihtpqpLQ9q0jcSHrhR6nLIml4`

### Checking Hash Info

```
$info = Hash::info($hash);
```

Will output something like:

```
array(3) {
  ["algo"]=>
  string(8) "argon2id"
  ["algoName"]=>
  string(8) "argon2id"
  ["options"]=>
  array(3) {
    ["memory_cost"]=>
    int(1024)
    ["time_cost"]=>
    int(2)
    ["threads"]=>
    int(2)
  
```

### Adding hash create options

If you need to adjust the options on the fly in place of the default values from your config you can:

```
$hashedPassword = Hash::create('secure_password', ['time' => 2, 'memory' => 1024, 'threads' => 2]);
```

Same goes for Bcrypt if you have it enabled:

```
$hashedPassword = Hash::create('secure_password', ['rounds' => 15]);
```

### Verifying a Password Hash

```
if(Hash::check('secure_password', $hash))
{
	echo "Passwords match!";
}
```

When creating a password hash you can use the `check` method to validate that the raw string can be matched against the stored password hash.

### Rehash Checking

```
if(Hash::needsRehash($hash))
{
	$newHash = Hash::create('secure_password');
}

if(Hash::needsRehash($hash, ['time' => 3, 'memory' => 1024, 'threads' => 2]))
{
	$newHash = Hash::create('secure_password');
}
```