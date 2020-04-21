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

Storage::access("local")->read("/logs/access.log");
```

By calling `Storage::access("local")` the Storage service will send back an instance to the file system driver you have specified, in this example we have selected to use the local file-system.

<div class="noteMsg">Currently, the only supported file-system is local storage, the file-system where your application is located. We are working to implement storage drivers for S3, FTP and external storage like Dropbox and Google Drive etc.</div>

## Storage Configuration

To configure your file-systems all the options are located in `/config/filesystem.php` and in there you can change your root directory for each file-system.
For example, the local file-system default root directory is:

```
"local" => [
    "root" => ROOT_DIR . "/storage/app",
]
```
Meaning when you interact with files using the local "disk" this path will be used as the file-system root directory.

## Reading Files

A normal read will look like this:

```
Storage::access("local")->read("/logs/error.log");
```

Calling `read()` with the file path will return the contents of the file you wish to read. The enitre file is read and returned with the file handle being closed once done.

## Writing to Files

A normal write using the Storage service looks like:

```
Storage::access("local")->write("/error/last_error/error.txt", "[10:29 21/04/2020] - ...");
```

The file will be created if it does not exist. By default the second parameter is set to `null` so you are not required to pass in file contents to write to the file.

### Prepending

```
Storage::access("local")->prepend("/error/last_error/error.txt", "[10:28 21/04/2020] - ...");
```

This will prepend the file with the contents passed as the second parameter. The `prepend()` function uses `php:://temp` to make it possible to prepend to a file.

<div class="warnMsg">Be careful when appending, using this function uses memory to achieve a file prepend operation and will use a lot of memory with a large file</div>

### Appending

```
Storage::access("local")->append("/error/last_error/error.txt", "[10:34 21/04/2020] - ...");
```

This will append the contents you want to write to the end of a file using the `a+` write mode.

## Copying

File copying is done by using the `copy()` function, here is an example:

```
Storage::access("local")->copy("/log/error.log", "/backups/logs/error.log.bak");
```

The `copy()` function requires a source and destination and will copy the file with the destination file name as well.

## Moving a file

```
Storage::access("local")->move("", "", $absoluteOldPath = false);
```

The `move()` function accepts an old file path, new file path and an optional parameter to use an absolute file path for the file you want to move, allowing you to move a file from outside of your root directory if you need to.

This function will return the file path that was used to save the moved file.

## Deleting a file

To delete a file called `user_profile_image_292827.png` we would do:

```php
Storage::access("local")->delete("/images/profile/user_profile_image_292827.png");
```

### Deleting many files

The `delete()` function also allows you to pass in an array of files to delete:

```php
$filesToDel = [
	"/images/profile/user_profile_image_292827.png",
	"/images/profile/user_profile_image_998740.png",
];

Storage::access("local")->delete($filesToDel);
```

## Creating a directory

```php
Storage::access("local")->makeDir("/logs/user/activity", $mode = 0777);
```

Creates a new directory `/logs/user/activity` using the default mode `0777`.

## Deleting a directory

```php
Storage::access("local")->removeDir("/logs/user/activity");
```

Will delete the directory `/activity` only, will not delete the full path of directories. The directory also has to be empty first.