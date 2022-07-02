---
title: Introduction
---

## Getting started

Voltis makes it effortless connecting to databases and executing queries, utilizing read and write connection pools to enable database connection reuse and speed up SQL execution time by not having to reconnect on each request. Voltis allows you to run raw SQL or by using the Voltis Query Builder, each method will automatically resolve a read or write connection for you and execute the query on the correct server.

Currently Voltis supports the following databases:

-	MySQL 5.7+

(more support in development for other databases)

## Configuration

The configuration for your databases is located in `/config/database.php` and in there you may specify all your different connections to all the databases you wish to connect to, a default one is provided for you and shows all the available configuration options. 

Let's go through each option to talk about how they should be used.

### Default Connection

The `default` option must be set and is used to decide which database to use by default when no connection is specified, here you should set your main database that you interact with.

### Database Connections

The `connections` array is where you list all of your databases that you want to connect to, an example database connection is provided in the configuration file. The default provided is called `default` and contains a connection to a MySQL database. Each connection must have a unique name but you may change the `driver` when connecting to a different database server.

```php
"connections" => [

	"database1" => [

		// configuration options for db1...

	],

	"database2" => [

		// configuration options for db2...

	],

]
```

There are many options inside each connection, so let’s go through each of them. 

### Read & Write Connections

Compared to most PHP applications and database access, Voltis works a little differently, it uses a connection pool to keep connections to your database open, meaning you don’t have the overhead of creating and authenticating to a database per each request to your server.

That means you need to have a connection pool for both read and write connections, don’t worry as Voltis automatically manages this for you and will always use the right connection. 

All you need to do is provide the read and write connections and setup the connection pool configuration, which we will talk about soon. For now let’s look at a read and write configuration array.

```php
"read" => [
	"hosts" => [

		env("Main_Database.HOST", "127.0.0.1")

	],
],

"write" => [
	"hosts" => [

		env("Main_Database.HOST", "127.0.0.1")

	],
]
```

Here we have read and write connections, most applications will only use one database server and that is usually all you need. So if you are only using one database server, just place the same host IP for your read and write connections.

However, if your setup requires multiple read or write connections, Voltis supports that. All you need to do is add as many IPs to the read or write connections as you need. You can see the example above uses the main database host IP from the `env` config but you are not required to do that, you could simple just put an IP address there.

If you have multiple read or write connections, Voltis will choose a random host to connect to when creating the read and write connection pools.

### Setting the database to Active

Inside the database configuration, you have an `active` option, if set to `true` the database will be available for use in your application and a connection pool will be created during server boot. When this is set to `false` the database is not usable and no connection pool will be created during server boot.

### Database Driver

When creating a database connection, each connection needs to have a valid `driver` set so Voltis knows what type of database it is connecting to. Here are the currently supported database drivers:

- `mysql`: MySQL Server driver using PHP PDO

> More database drivers are in development

### Database Name

For the config option `database` you specify the database you want to connect to when running quires, the name of the database you want to select.

### Database Port

Usually the common `port` for a database server such as MySQL is 3306 but you may change that to whatever port you are using.

### Database Username

The `username` you are using to connect to your database server.

### Database Password

The `password` you are using to connect to your database server.

### Character Set

You may define which `charset` your database is using but a suitable default of `utf8mb4` is used.

### Collation

A `collation` of `utf8mb4_unicode_ci` is used as the default but you may change this if you like.

### Prefix

When setting a `prefix` Voltis will place this prefix at the start of table names, when using the Voltis Query Builder.

### Connection Pool

As mentioned at the start, Voltis uses a connection pool for both read and write connections, this gives you immense control over the number of read or write connections you want to keep active, your application may need more reads than writes or the other way round, whatever your needs, Voltis allows you to define your pool to suit your needs. 

A connection pool is a way to cache database connections, they are kept alive after being used and sit in a pool until they are needed to execute a query, then put back to wait for another request. The benefit here is performance and reusability, pre-connected database connections are quick to use as they are already available to you, no need to reconnect or authenticate to the database server again.

#### Wait Timeout

This option by default is set to 5 seconds and controls how long Voltis should wait to receive a connection.

#### Connection Idle Timeout

This option is used to specify in minutes how long a connection can be idle for until it is deemed inactive and removed from the pool. This idle connection timeout will respect the minimum connection limit. The default is 1 minute.

#### Minimum Connections

The minimum number of connections to keep in the pool, this limit is used when creating the pool. Remember, there are minimum limits for both read and write connections. Usually you will have more read connections than write connections.  

#### Maximum Connections

The maximum number of connections that are allowed in the pool, if you have a pool size of 20 and all of them are in use, no more connections can be created, a connection will need to be returned to the pool before another connection is available, so set this to match your work load.

#### Connection Pool Size Warning

By default Voltis is set to use a worker count based on the number of cores your CPU has, so 4 CPU cores will equal 4 workers. This means that for each worker a connection pool is created and thus, each worker has a pool of read and write connections available to it.

This is important because you can easily thrash the maximum number of connections your database servers can handle, for example, a maximum of 10 connections for read and write could lead to 10 read + 10 write = 20 * 4 workers = 80 total connections. Please set this and consider your work load requirements.

## Using Multiple Connections

```php
DB::select('select * from user where age >= ?', [22], 'databaseTwo');
```

By default Voltis automatically uses the default database connection set in `/config/database.php` but as you could have multiple connections, you can specify to use a specific connection by passing in the name like shown above as the last parameter, this connection name should match one in the database configuration file.

```php
DB::connection('databaseTwo', 'user')->select('username')->get();
```

Above shows you how to use a different connection when using the Voltis Query Builder, you must use the `connection` method and pass in a connection name, then the table you want to use.

## Executing Raw SQL Queries

To run raw SQL queries against your configured databases, you can use the basic raw methods to quickly run a raw statement. Voltis provides you with `select`, `update`, `insert`, `delete` and `raw` methods to execute raw SQL, each will handle getting a connection from the pool for you.

All these methods use the `Voltis\Database\Facade\DB` Facade.

### Select Statements

```php
$users = DB::select('SELECT * FROM user WHERE age >= ? AND active = ?', [22, 1]);
```

The first argument is the query and the second is the array of data to pass as parameter bindings that need to be prepared with the query; using prepared statements prevents SQL injection attacks.

The return value is an associative array of each row that was found.

### Named Bindings

You may also use named parameter bindings instead of the `?` in your queries:

```php
$users = DB::select('select * from user where age >= :age', ['age' => 22]);
```

### Insert Statements

```php
$affected = DB::insert('insert into user (name, age) values (?, ?)', ['Luke', 22]);
```

An insert statement takes the query as its first argument and the second are the data bindings. It will return the affected rows.

### Update Statements

```php
$affected = DB::update('update user set active = ? where name = ?', [1, 'Luke']);
```

An update statement will return the number of affected rows.

### Delete Statements

```php
$deleted = DB::delete('delete from user where age > ?', [30]);
```

When running a delete query like this, it will return the number of deleted rows.

### Raw Statements

```php
$result = DB::raw('drop table user', $data = null, $type = 'write', $database = null);
```

Sometimes you may want to just run a direct query and `raw` allows you to do that, you are in complete control. You set the query, data and if you need to, you can change the query type which affects which connection it uses and the database to run the query on.

## Database Transactions

You can use the transaction methods `DB::transaction()` and `DB::manualTransaction()` from the database `Voltis\Database\Facade\DB` Facade.

### Auto Transactions

```php
$result = DB::transaction(function($query)
{
    $result = $query->select('select name, age from user where age < ?', [44]);

    $query->table('user')
        ->where('id', '=', 1)
        ->update(['active' => 1]);

		return $result;
});
```

The `transaction` method allows you to setup an auto-commit transaction, you may perform a range of normal database operations as you normally would, only difference is you must use the $query parameter that is passed in to the `Closure` which gives you access to all the raw SQL methods and the Voltis Query Builder. You must use `$query` as that provides you with a connection from the pool that can be used throughout the transaction.

This method will automatically commit your changes if the closure executes successfully and will rollback changes if an error is thrown.

In addition, you can pass in the number of attempts you wish to perform if the transaction fails and the database which you want to connect to if its not the default one you wish to use: `DB::transaction($callback, $attempts = 1, $database = null);` - Increasing the attempt value is useful when you hit deadlocks.

### Manual Transaction

```php
$result = DB::manualTransaction(function($query, $transaction)
{
    $result = null;

    try
    {
        $transaction->start();

        $result = $query->select('select name, age from user where age < ?', [44]);

		$query->table('user')
			->where('id', '=', 1)
			->update(['active' => 1]);
    }
    catch(Exception $e)
    {
        $transaction->rollBack();

        echo $e->getMessage();
    }

    if($transaction->status())
    {
        $transaction->commit();
    }

    return $result;
}, $database = null);
```

You may want to have full control over your database transaction, in that case you can use `manualTransaction` which allows you to start, rollback and commit your changes as you wish. By running your transaction in a closure, you still gain access to the raw SQL methods and the Voltis Query Builder. A closure also allows Voltis to handle getting you the connection from the pool and putting it back as well, in a usable state, if you forget to commit, Voltis will rollback changes so the connection can be used again.