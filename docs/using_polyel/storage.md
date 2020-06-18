---
id: storage
title: Storage
---

## Introduction

Polyel provides you with a Storage service which gives you the ability to interact with a filesystem in order to work with files and directories. Right now only a local storage driver is supported but it is planned to support filesystems such as S3, FTP and external storage like Dropbox and Google drive.

## Accessing the Storage service

When you need to interact with a file-system, you can use the Storage service Facade:

```
use Polyel\Storage\Facade\Storage;

Storage::drive("local")->read("/logs/access.log");
```

By calling `Storage::drive("local")` the Storage service will send back an instance of the filesystem drive you have specified, in this example we have selected to use the local drive which uses the local filesystem driver.

> Currently, the only supported file-system is local storage, the filesystem where your application is located. We are working to implement storage drivers for S3, FTP and external storage like Dropbox and Google Drive etc.

## Storage Configuration

To configure your filesystems, all the options are located in `/config/filesystem.php` and in there you can change your root directory for each of your configured drives.

```
"default" => "local",

"drives" => [

	"local" => [
		"driver" => "local",
		"root" => ROOT_DIR . "/storage/app",
	],

	"public" => [
		"driver" => "local",
		"root" => ROOT_DIR . "/storage/app/public",
	]

]
```

When you interact with files using the local "drive" the root set in the config will be used when you interact using that "drive".

You may add as many "drives" as you need, you may use as many drivers as you need as well, just make sure each "drive" has a unique name.

## Using the default drive

By default you would usually access a filesystem via the `drive()` function to select a filesystem to interact with but in your configuration, if you have set the `default` drive, you don’t need to select a drive using the `drive()` function. Just start using like so:

```
Storage::read("/logs/error.log");
```

## Reading Files

```
Storage::drive("local")->read("/logs/error.log");
```

Calling `read()` with the file path will return the contents of the file you wish to read. The enitre file is read and returned with the file handle being closed once done.

## Writing to Files

```
Storage::drive("local")->write("/error/last_error/error.txt", "[10:29 21/04/2020] - ...");
```

The file will be created if it does not exist. By default the second parameter is set to `null` so you are not required to pass in file contents to write to the file.

### Prepending

```
Storage::drive("local")->prepend("/error/last_error/error.txt", "[10:28 21/04/2020] - ...");
```

This will prepend the file with the contents passed as the second parameter. The `prepend()` function uses `php:://temp` to make it possible to prepend to a file.

<div class="warnMsg">Be careful when appending, using this function uses memory to achieve a file prepend operation and will use a lot of memory with a large file</div>

### Appending

```
Storage::drive("local")->append("/error/last_error/error.txt", "[10:34 21/04/2020] - ...");
```

This will append the contents you want to write to the end of a file using the `a+` write mode.

## Copying

```
Storage::drive("local")->copy("/log/error.log", "/backups/logs/error.log.bak");
```

The `copy()` function requires a source and destination and will copy the file with the destination file name as well.

## Moving a file

```
Storage::drive("local")->move("", "");
```

The `move()` function accepts an old file path, new file path.

This function will return the file path that was used to save the moved file.

## Deleting a file

To delete a file called `user_profile_image_292827.png` we would do:

```php
Storage::drive("local")->delete("/images/profile/user_profile_image_292827.png");
```

### Deleting multiple files at once

The `delete()` function also allows you to pass in an array of files to delete:

```php
$filesToDel = [
	"/images/profile/user_profile_image_292827.png",
	"/images/profile/user_profile_image_998740.png",
];

Storage::drive("local")->delete($filesToDel);
```

## Creating a directory

```php
Storage::drive("local")->makeDir("/logs/user/activity", $mode = 0777);
```

Creates a new directory `/logs/user/activity` using the default mode `0777`.

## Deleting a directory

```php
Storage::drive("local")->removeDir("/logs/user/activity");
```

Will delete the directory `/activity` only, will not delete the full path of directories. The directory also has to be empty first.