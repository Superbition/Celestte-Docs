---
id: intro
title: Introduction
---

**Another framework you ask?** Well, this project originally started as a set of classes to test the features of the Swoole networking library for PHP. Overtime as more services were built which were used to try out the ability of Swoole, the project formed into a fully featured web framework based on a new async/coroutine programming model that has not really been seen before with PHP.

Compared to other frameworks or adaptors based around Swoole, Polyel is built from the ground up, supporting the event-driven, asynchronous, non-blocking I/O nature of Swooles programming model. Polyel aims to be a fully featured option for when you want to build a modern PHP web application with Swoole, Polyel is designed to have minimal dependencies other than Swoole, making it easy and flexible to adapt and move forward with the async/coroutine paradigm that Swoole provides, also following mature standards and best practices, so you may find Polyel very similar to other frameworks, helping adoption and enabling developers to get started quickly.

## What is Polyel?
Polyel is a full-stack web framework for PHP designed to be highly opinionated and follow a lot of established conventions, based on the Swoole networking library provided as a PHP extension. Polyel follows a coroutine based async model to achieve higher performance in server requests, it is very different from the traditional PHP stateless request lifecycle but still allows you to write synchronous or asynchronous code with the freedom of coroutines.

## What can Polyel be used for?
Just like any other web framework, you can use Polyel to create a fully featured website or backend API service. However, Polyel has its own built-in HTTP server that runs from the command line, all based on the Swoole HTTP Server, everything runs directly from PHP, no Apache mod or PHP-FPM.

The Polyel framework has many built-in components to make web development easier and less stressful, for example, Polyel can handle the authentication processes, frontend rendering, database connection pools and security practices like XSS filtering or CSRF (Cross-site Request Forgery) prevention. Polyel is designed to be easy to install and develop with, focusing on web applications, you can build your next microservice, API, website or real time app with Polyel.

## What does Polyel mean?
Polyel, coming from the meaning of two words.

The first word being "Poly":
> A combining form with the meanings “much, many” and, in chemistry, “polymeric,” used in the formation of compound words.

and the second word being "Element":
> A component or constituent of a whole or one of the parts into which a whole may be resolved by analysis.

Poly-Element creates Polyel because there are many different elements and phases within web development.