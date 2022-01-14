---
id: query-builder
title: Query Builder
---

## Getting Started

The Voltis Query Builder offers you a convenient, expressive interface to interacting with your databases. It provides you with most of the functionality that nearly all queries require, making it easy and rapid to write SQL statements in your application. It also provides you with piece of mind as all data inputs are bound to the query using PHP PDO prepared statements, so you are protected against SQL injection attacks.

When using the Query Builder, Voltis will handle getting the correct type of connection for you automatically, read and write connections are retrieved from the connection pool for you as well, you don’t need to worry about database connections and their pools.

<div class="warnMsg">Even though the Query Builder will automatically handle data binding for you with PHP PDO Prepared statements, protecting you from SQL injection attacks, column names are not protected by this, so it is down to you as the developer to use a whitelist to manage which columns are used in database queries. Never allow the user input to select columns, always use a whitelist to validate against.</div>

## Acessing the Query Builder

Wherever you use the query builder, you can access it through the database Facade by including ` Polyel\Database\Facade\DB` in your namespaces that could be inside a controller, Middleware or your own class or service.

For example:

```
$users = DB::table("user")->get();
```

Gets everything from the table `user` and stores the result as an array in `$users`.

## Selects

```
$result = DB::table("user")->select()->get();
```

Gets the whole user table and stores the result in `$result`, calling `select` without any arguments means you wish to `*` everything.

You can include `*` to indicate you want all columns:

```
$result = DB::table("user")->select("*")->get();
```

### Selecting with columns

```
$result = DB::table("user")->select('username')->get();
```

You may pass multiple columns in like so:

```
$result = DB::table("user")->select('name', 'age', 'email')->get();
```

And you may pass in an array of columns:

```
$result = DB::table("user")->select(['name', 'age', 'email'])->get();
```

### Select distinct

```
$result = DB::table("user")->select('age')->distinct()->get();
```

### Select single row

```
$row = DB::table('user')->where('name', '=', 'Tim Jones')->first();
```

Returns only the first matching row from the database.

### Select single column

```
$email = DB::table('user')->where('name', '=', 'Tim Jones')->value('email');
```

Returns only the value from the matched row, in this case the email directly is returned.

### Select by ID

```
$id = DB::table('user')->findById(216);
```

Finds the row using the primary key and returns the user row from the database.

### Select and return columns

```
$usernames = DB::table('test_table')->list('username');
```

### Up-to-date Data

If you are using a multi-server database setup and have multiple read and write connections, you can force your query to use a write connection:

```
$results = DB::table('user')->select('name')->important()->get();
```

## Aggregates

You may use `count`, `min`, `max` and `sum` and `avg` methods after you have constructed your query.

### Count

```
$users = DB::table("user")->select('COUNT(username) as users')->get();
```

or

```
$users = DB::table('user')->where('age', '<', 30)->count('name');
```

### Min

```
$min = DB::table('user')->min('age');
```

### Max

```
$max = DB::table('user')->max('age');
```

### Avg

```
$avg = DB::table('user')->avg('age');
```

### Sum

```
$sum = DB::table('user')->sum('votes');
```

## Chunking Results

Sometimes you may need to process thousands of database records and selecting all of them at once would be cumbersome and put strain on your applications performance, Voltis offers you a range of different chunking methods to handle things situations.

Each chunking method takes a closure which gets fed a small amount of records each time until all of the results are processed, reducing the amount of overhead of retrieving large amounts of rows at once.

### Chunk

```
DB::table('user')->orderBy('id')->chunk(100, function($users) {

	foreach($users as $user)
	{
		echo $user['name'];
	}

});
```

By calling `chunk` you can see above that in the example 100 results each time are processed until all the users have been fed into the closure.

Remember you are free to constrain your chunk with a where for example:

```
DB::table('user')->where('age', '<', 20)->orderBy('id')->chunk(100, function($users) {...});
```

<div class="noteMsg">You may return false and stop anymore chunks from being processed</div>

### Defer and Chunk

The normal `chunk` function on its own is blocking and the request is not sent back until the chunk has finished, so in order to process your chunk and return back to the rest of your application you can defer a chunk.

```
DB::table('user')->orderBy('id')->deferAndChunk(100, function($users) {

	foreach($users as $user)
	{
		echo $user['name'];
	}

});
```

### Chunk By ID

When you chunk results and update at the same time it could affect the results as the data is being changed at the same time, so Voltis provides you with `chunkById` instead. This method chunks by using the primary key to order and process rows.

```
DB::table('user')->where('age', '>', 55)->chunkById(100, function($users) {

	foreach($users as $user)
	{
		echo $user['name'];
	}

}, $column = null);
```

If you change or update data inside the callback for chunking, don’t alter any primary keys or foreign keys or you may experience unexpected results.

<div class="noteMsg">By default <code> chunkById</code> uses <code>id</code> as the primary key column name but as a third argument you can pass in the column name if your primary key name is different</div>

### Defer and Chunk By ID

The `chunkById` by default is blocking but you can use ` deferAndChunkById` to defer the chunk and continue on with your request.

```
DB::table('user')->where('age', '>', 55)->deferAndChunkById(100, function($users) {

	foreach($users as $user)
	{
		echo $user['name'];
	}

});
```

## Joins

### Inner Joins

You can use the query builder to build up join clauses, to perform a basic inner join you can just use the `join` method.

```
DB::table('user')
    ->join('payments', 'user.id', '=', 'payment.id')
    ->join('invoice', 'invoice.id', '=', 'payment.id')
	->select('user.name')
    ->get();
```

Above shows you how you can join multiple tables together, the first argument is the table you wish to join and then your constraints for each join.

Remember your join statements should come before any selects.

### Left & Right Joins

You can use the query builder to also perform left or right joins by using either `leftJoin` or `rightJoin` methods.

```
DB::table('user')
    ->leftJoin('comments', 'user.id', '=', 'comments.userId')
    ->get();

DB::table('user')
	->rightJoin('comments', 'user.id', '=', 'comments.userId')
	->get();
```

### Cross Joins

If you need to build a cross join you can use the `crossJoin` method from the query builder. A cross join is the number of rows in the first table multiplied by the number of rows in the second table; a Cartesian product between the tables.

```
DB::table('foods')
    ->crossJoin('company')
    ->get();
```

## Wheres

### Basic Where Clause

You can use where clauses to help filter down your result set from the database, a basic where clause requires three arguments. The first being the name of the column, second the operator and the value as the third.

Here is an example of a basic where query that selects all users who are over the age of 30:

```
$users = DB::table("user")->select('name', 'age')
    		->where('age', '>', 30)
    		->get();
```

Or another example where the active column is equal to 1:

```
$users = DB::table("user")->select('name', 'age')
    		->where('active', '=', 1)
    		->get();
```

Other supported operators are based on the database you are using but the most comment are:

- `>=`: Greater than or equal
- `<=`: Less than or equal
- `<>`: Not equal (In some versions of SQL this operator may be written as !=)
- `LIKE`: 	Search for a pattern

An example of a where like:

```
$users = DB::table("user")
	->select('name', 'age')
    ->where('name', 'like', '%Luke%')
    ->get();
```

### Adding an array of wheres

To make adding multiple where rules to your query you can pass an array like so:

```
$results = DB::table("user")
	->select('name', 'age')
    ->where([
        ['age', '>=', 18],
        ['votes', '<', 100],
    ])
    ->get();
```

But you can also just keep adding where statements:

```
$results = DB::table("user")
				->select('name', 'age')
				->where('age', '>', 18)
				->where('votes', '<', 100)
				->get();
```

Chaining or adding wheres with arrays will use 'AND' to add one after another.

### Or Where

The basic `where` method will always use 'AND' to add them to the query but you might want to use an 'OR' where, you can do this with the `orWhere` method:

```
$results = DB::table("user")->select('name', 'age')
    ->where('age', '<=', 30)
    ->orWhere('age', '=', 65)
    ->get();
```

You may also use an array to pass chain multiple together:

```
$results = DB::table("user")->select('name', 'age')
    ->where('age', '<=', 30)
    ->orWhere([
        ['age', '<>', 55],
        ['age', '=', 80],
    ])
    ->get();
```

### Grouped Where

You may need to group a where condition with paraentheses such as two or wheres and you can do that by using a closure:

```
$results = DB::table("user")
    ->select('name')
    ->where('name', '=', 'Luke')
    ->orWhere(function($query) {
        $query->where('points', '>', 100)
              ->where('age', '=', '22');
    })
    ->get();
```

The above would produce `SELECT name FROM user WHERE name = 'Luke' OR (points > 100 AND age = 22)"`.

### Where Between

To check that a column's value is between two values, you can use a where between:

```
$result = DB::table("user")->select('name', 'age')
    ->whereBetween('age', [12, 30])
    ->get();

$result = DB::table("user")->select('name', 'age')
    ->orWhereBetween('age', [12, 30])
    ->get();
```

### Where Not Between

Check that a column's value is not between two certain values:

```
$results = DB::table("user")->select('name', 'age')
    ->whereNotBetween('age', [12, 30])
    ->get();

$results = DB::table("user")->select('name', 'age')
    ->orWhereNotBetween('age', [55, 80])
    ->get();
```

### Where In

To check that a column's value is within the contained list:

```
$results = DB::table("user")->select('name', 'age')
    ->whereIn('age', [22, 44])
    ->get();

$results = DB::table("user")->select('name', 'age')
    ->orWhereIn('age', [22, 44])
    ->get();
```

### Where Not In

Check if a column's value is not within a list of values:

```
$results = DB::table("user")->select('name', 'age')
    ->whereNotIn('age', [22, 44])
    ->get();

$results = DB::table("user")->select('name', 'age')
    ->orWhereNotIn('age', [22, 44])
    ->get();
```

### Where Null

Check that a column is null:

```
$results = DB::table("user")->select('name', 'age')
    ->whereNull('first_name')
    ->get();

$results = DB::table("user")->select('name', 'age')
    ->orWhereNull('first_name')
    ->get();
```

### Where Not Null

Check that a column is not null:

```
$results = DB::table("user")->select('name', 'age')
    ->whereNotNull('age')
    ->get();

$results = DB::table("user")->select('name', 'age')
    ->orWhereNotNull('age')
    ->get();
```

### Where Date

Used to compared a column aginst a date:

```
$results = DB::table("user")->select('name', 'age')
    ->whereDate('created_at', '=', '2020-06-01')
    ->orWhereDate('created_at', '=', '2019-05-01')
    ->get();
```

### Where Year

Used to compared a column aginst a specific year:

```
$results = DB::table("user")->select('name', 'age')
    ->whereYear('created_at', '=', '2019')
	->orWhereYear('created_at', '=', '2018')
    ->get();
```

### Where Month

Used to compared a column aginst a specific month:

```
$results = DB::table("user")->select('name', 'age')
    ->whereMonth('created_at', '=', '05')
	->orWhereMonth('created_at', '=', '06')
    ->get();
```

### Where Day

Used to compared a column aginst a specific day:

```
$results = DB::table("user")->select('name', 'age')
    ->whereDay('created_at', '=', '9')
    ->orWhereDay('created_at', '<', '05')
    ->get();

$results = DB::table("user")->select('name', 'age')
    ->whereDayOfYear('created_at', '>', '03')
    ->orWhereDayOfYear('created_at', '>', '03')
    ->get();
```

### Where Week

Used to compared a column aginst a specific week number:

```
$results = DB::table("user")->select('name', 'age')
    ->whereWeekOfYear('created_at', '>', '03')
    ->orWhereWeekOfYear('created_at', '>', '03')
    ->get();
```

### Where Time

Used to compared a column aginst a specific time:

```
$results = DB::table("user")->select('name', 'age')
    ->whereTime('created_at', '>', '16:49')
    ->orWhereTime('created_at', '>', '17:55')
    ->get();
```

### Where Column

Used to compare two column's against each other:

```
$results = DB::table("user")->select('name')
    ->whereColumn('name', '=', 'username')
    ->orWhereColumn('name', '=', 'email')
    ->get();
```

You can change the operator to what you need.

<div class="warnMsg">Where column does not prepare and escape column names so be careful not to pass user supplied data, use a white list instead</div>

### Advanced Where Grouping

When writing SQL sometimes you may need to group or nest clauses with parenthesis, you can do that with the Voltis Query Builder by passing in a Closure as the first argument to a `where` clause:

```
$results = DB::table('users')
            ->where('name', '=', 'John')
            ->where(function ($query) {
                $query->where('votes', '>', 100)
                    ->orWhere('title', '=', 'Admin');
            })
            ->get();
```

Which would produce the following SQL: 

`SELECT * FROM users WHERE name = 'John' AND (votes > 100 OR title = 'Admin')`

### Where Exists

A where exists is used to test for the existence of any record in a subquery, if the subquery exists record exists it will return true. You can build these types of queries in Voltis:

```
$results = DB::table("user")
            ->select('name', 'age')
            ->where('age', '>', 18)
            ->whereExists(function($query) {
                $query->select('name')
                    ->from('user')
                    ->where('votes.vote_id', '=', 'user.id');
            })
            ->get();

$results = DB::table("user")
            ->select('name', 'age')
            ->where('age', '>', 18)
            ->orWhereExists(function($query) {
                $query->select('name')
                    ->from('user')
                    ->where('votes.vote_id', '=', 'user.id');
            })
            ->get();
```

The SQL produced would be:

`SELECT name, age FROM user WHERE age > 18 AND EXISTS (SELECT id FROM votes WHERE vote_id = user.id)`

### Where Not Exists

```
$results = DB::table("user")
    ->select('name', 'age')
    ->where('age', '>', 10)
    ->whereNotExists(function($query) {
        $query->select('name')
            ->from('user')
            ->where('age', '>', 20);
    })
    ->get();

$results = DB::table("user")
    ->select('name', 'age')
    ->where('age', '>', 10)
    ->orWhereNotExists(function($query) {
        $query->select('name')
            ->from('user')
            ->where('age', '>', 20);
    })
    ->get();
```

### Where Subquery Clauses

To perform advanced where clauses with subqueries in them that allow you to compare a value against the result of a subquery, you may call the where function with a closure like so:

```
$results = DB::table('user')
            ->select('name')
            ->where(function($query) {
                $query->select('allowed')
                      ->from('permissions')
                      ->whereColumn('user_id', '=', 'users.id')
                      ->limit(1);
            }, 'Tim Jones')
            ->get();
```

Which would perform the query:

`SELECT name FROM user WHERE (SELECT allowed FROM permissions WHERE user_id = users.id LIMIT 1)`

### Where JSON

For databases that support JSON column types Voltis allows you to use these inside a where clause.

Currently supported databases for use of JSON columns and the query builder: MySQL 5.7+

To access JSON objects you can use the `->` operator:

```
$results = DB::table('json_table')
			->select('json_data->person->name')
			->whereJson('json_data->comments->votes', '>', 40)
			->orWhereJson('json_data->person->age', '<', 50)
			->get();
```

## Ordering

### OrderBy

The `orderBy` method is used to sort the result-set in ascending or descending order, by default it always uses ascending.

```
$results = DB::table("user")->select('age')
			->where('age', '>', 15)
			->orderBy('age')
			->get();
```

The first argument is the column you want to sort by and the second is either `asc` or `desc`.

You can also pass multiple arguments to the `orderBy` method:

```
$results = DB::table("user")->select('name', 'age')
		->where('age', '>', 15)
		->orderBy([['age', 'DESC'], ['name', 'DESC']])
		->get();
```

### Latest & Oldest

You can use the `latest` and `oldest` methods to quickly order your results by date, they both expect you to provide which column you want to order by.

#### Latest

```
$results = DB::table("user")->select('name', 'age')
    ->latest('created_at')
    ->get();
```

#### Oldest

```
$results = DB::table("user")->select('name', 'age')
    ->oldest('created_at')
    ->get();
```

### Order By Random

If you need to order your results in a random order you can use `orderByRandom` which will order your results in a random order and you can pass in a seed if you wish.

```
$results = DB::table("user")->select('name', 'age')
    ->orderByRandom($seed = '')
    ->get();
```

## Group By & Having

You can group query results by using a `groupBy` clause, the `having` method is similar to a basic `where`, for example:

```
$results = DB::table("user")
            ->groupBy('id')
            ->having('id', '>', 50)
            ->get();
```

The `having` clause exists because `where` cannot be used with aggregate functions, `having` is like a normal `where` but is applied after the results are grouped.

You can pass multiple arguments to the `groupBy` method, you also have access to a number of other `having` methods, here is an example of all the other methods you can use:

```
$results = DB::table("user")
            ->select('name')
            ->groupBy('id', 'age')
            ->having('age', '>', 16)
            ->orHaving('age', '<', 16)
            ->havingBetween('age', [10, 33])
            ->orHavingBetween('age', [10, 33])
            ->havingNotBteween('age', [10, 33])
            ->orHavingNotBteween('age', [10, 33])
            ->get();
```

## Limit & Offset

If you want to limit the result set or to skip a number of results you can use `limit` and `offset`:

```
$results = DB::table("user")
    ->select('name')
    ->limit(100)
    ->offset(20)
    ->get();
```

However, you can use `take` to limit results and `skip` to offset a certain number of results as well:

```
$results = DB::table("user")
    ->select('name')
    ->skip(10)
    ->take(5)
    ->get();
```

## Inserting

Even though you have the raw methods to `insert` data into your database, the query builder also provides you with an `insert` method as well. The `insert` method expects an array on data to insert into the database:

```
$affected = DB::table('user')->insert(['name' => 'Joe', 'age' => 23, 'score' => 89]);
```

```
$affected = DB::table('user')->insert([
    ['name' => 'Luke', 'age' => 23, 'score' => 99],
    ['name' => 'Dan', 'age' => 11, 'score' => 34],
	['name' => 'James', 'age' => 11, 'score' => 67]
];
```

### Auto-Incrementing ID

You can receive the auto-incrementing ID using the `insertAndGetId` method:

```
$id = DB::table('user')->insertAndGetId(['name' => 'Luke', 'age' => 23, 'score' => 55]);
```

### Defer & Insert

If you have a load of data to insert into the database and don’t want to block your request from finishing you can use the `deferAndInsert` method which will allow you to defer the insert process and continue on with your request right away and not block the request.

```
$results = DB::table('user')->deferAndInsert([
    ['name' => 'Luke', 'age' => 23, 'score' => 44],
    ['name' => 'Dan', 'age' => 23, 'score' => 33],
    ['name' => 'Joe', 'age' => 23, 'score' => 22],
    ['name' => 'Conor', 'age' => 21, 'score' => 35],
	['name' => 'Earp', 'age' => 22, 'score' => 56],
]);
```

## Updating

You can also use the query builder to update existing records, the `update` method expects an array of columns and a value to update it with, similar to how the `insert` method works:

```
$affected = $results = DB::table('user')
            ->where('id', '=', 1)
            ->update(['bio' => 'My bio was updated!']);
```

And you can add on where clauses to constraint your update query.

### Update or Insert

You may come across a situation where you want to update a record but if it does not exist then insert it, Voltis provides you with `updateOrInsert` to achieve this. This method 1st expects a condition to be passed in as a way to see if the record exists first, then the 2nd argument is the key value pairs to update the row with.

```
$updateOrInsert = $results = DB::table('user')
    ->updateOrInsert(
        ['name' => 'Luke', 'age' => 23],
        ['bio' => 'Luke's bio!']
    , true);
```

The third argument is by default set to `false` and is used to return back the insert ID or not if the record does not exist and is inserted instead, set this to `true` and the insert ID is returned if an insert is performed.

If an insert is performed, both the condition and values array are merged together and that completes the full insert, otherwise it’s just the second array that is used for the update statement.

### Updating JSON

You can also update JSON columns in your database, as like in a `where` clause you use the `->` operator, you do the same with the update statement, for example:

```
$affected = $results = DB::table('json_table')
    ->where('id', '=', 1)
    ->update(['json_data->person->name' => 'Lucas', 'json_data->person->age' => 45]);

$affected = $results = DB::table('json_table')
    ->where('id', '=', 1)
    ->update(['json_data->person->votes' => 3]);
```

This is supported for MySQL 5.7 and up.

### Increment & Decrement

To make it more convenient to update columns where you only need to increment or decrement values, the query builder provides you with both methods. This is a shorthand for updating columns quickly and in an expressive manner.

```
$affected = $results = DB::table('user')
    ->where('id', '=', 1)
    ->increment('age');

$affected = $results = DB::table('user')
    ->where('id', '=', 1)
    ->decrement('votes', 5);
```

Each method expects the column you want to update and then the update amount, by default it is set to 1.

## Deletes

You can use the `delete` method to delete records from the database and include a `where` onto your statement if you want to constrain the query:

```
$affected = DB::table('user')->where('age', '>', 50)->delete();
```

The `delete` method can be passed an ID if you want to quickly delete a row with a column called `id`:

```
$affected = DB::table('user')->delete(44);
```

When using the `delete` method, if you want to delete all rows in a table, you must confirm with `*`:

```
$affected = DB::table('table2')->delete('*');
```

Lastly, you can use `truncate` to remove all the rows and reset the auto-incrementing ID back to zero:

```
$affected = DB::table('table3')->truncate();
```

## Pessimistic Locking

When selecting data from your database, sometimes you will want that data to not change, when reading data you can use `lockForShare` to set a shared lock on your statement and transaction. Doing so will allow other connections to read the same row but not permit them to update the same row until your transaction completes.

The other type of lock is `lockForUpdate` where it sets a lock which blocks other transactions from reading the same row and other transaction will have to wait until the lock is released.

```
$results = DB::table("user")->select('name', 'age')
    ->where('age', '<', 2)
    ->lockForShare()
    ->get();

$results = DB::table("user")->select('name', 'age')
    ->where('age', '<', 2)
    ->lockForUpdate()
    ->get();
```

## Debugging

For query debugging while using the query builder you have `dump` and `dd`. The first method allows you to dump both the query and data bindings while the second does the same but does not execute the SQL query and still continues on with your request.

```
$results = DB::table("user")->dump();
$results = DB::table("user")->dd();
```