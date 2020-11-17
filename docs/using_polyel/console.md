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