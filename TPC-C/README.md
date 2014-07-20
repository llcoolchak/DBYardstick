
Developers
==========

Prerequisites
-------------

1. NodeJS 0.10.x
2. TypScript compiler (tsc)
3. GNU Make


Install Prerequisites
---------------------

Adapt these instructions for your platform:

```bash

# Install Node Version Manager from https://github.com/creationix/nvm
$ curl https://raw.githubusercontent.com/creationix/nvm/v0.11.1/install.sh | bash

# Install stable version of NddeJS; we'll use 0.10.x
$ nvm install 0.10

# Optionally, make 0.10 your default version
$ nvm alias default 0.10

# Install TypeScript compiler; note it's 'npm' from here on, not 'nvm'
$ npm install -g typescript

# Install development dependencies
$ sudo apt-get install git make

# Clone this repository, and switch to that directory
$ git clone git@github.com:gurjeet/tpc.js

# Install package dependencies
$ npm install

# Connect to Postgres, install TPC-C schema and populate initial data.

```


Compile and Run
---------------

In the `TPC-C` directory:

- Use `make` to compile the source code.

- Use `make run` to execute the TPC-C tests, and compile the code if necessary.

- Use `make watch` to launch the compiler in 'watch' mode, where it watches
source files for changes and automatically compiles them as you save the source
files.

TPCC='{"active_warehouses":11, "stats_interval":3, "database":"Postgres", "postgres_connection_pool_count": 4}'

Notes
=====

* With PostgresDummy DB, at 15000 warehouses, using 4 CPUs we get no NewOrder
transactions until about 3 minutes!! This seems to be because of the backlog of
Payment transactions that builds up within the first 18-or-so seconds, and for
the first 3 minutes the database sees a barrage of Payment transactions. By the
time that barrage ends, the backlog of NewOrder transactions builds up and then
the database sees only NewOrder transactions for a while.

  NullDB doesn't exhibit this behaviour, apparently because the backlog never
builds up.

* Watch backend execution using the following query

```sql
select  regexp_replace(query, '.*process_(.*)\(.*', '\1') as "Transaction Profile",
        state as "Current Backend State",
        count(*) as count,
        total
from    (select *,
                count(*) over () as total
        from    pg_stat_activity
        where   pid <> pg_backend_pid()) as v
group by
        query, state, total
order by query, state;
```

Typical output may look like:

```
 Transaction Profile | Current Backend State | count | total
---------------------+-----------------------+-------+-------
 delivery            | active                |     1 |     5
 new_order           | active                |     1 |     5
 order_status        | idle                  |     1 |     5
 payment             | active                |     1 |     5
 payment             | idle                  |     1 |     5
(5 rows)
```

* Watch Postgres XLOG generation and DB growth rates using the following shell script

```bash
MEASUREMENT_INTERVAL=60
WAL_POS1=$(psql -A -t -d tpcc -U tpcc -c "select pg_current_xlog_location();");
DB_SZ1=$(psql -A -t -d tpcc -U tpcc -c "select pg_database_size('tpcc');");

while sleep $MEASUREMENT_INTERVAL; do
    WAL_POS2=$(psql -A -t -d tpcc -U tpcc -c 'select pg_current_xlog_location();');
    DB_SZ2=$(psql -A -t -d tpcc -U tpcc -c "select pg_database_size('tpcc');");
    DIFF_WAL_POS=$(psql -A -t -d tpcc -U tpcc -c "select pg_xlog_location_diff('$WAL_POS2', '$WAL_POS1')/1024.0/1024")
    DIFF_DB_SZ=$(psql -A -t -d tpcc -U tpcc -c "select ($DB_SZ2 - $DB_SZ1)/1024.0/1024")

    echo $(date): $DIFF_WAL_POS $DIFF_DB_SZ
    WAL_POS1=$WAL_POS2
    DB_SZ1=$DB_SZ2
done
```
Typical output looks like following, last column being the amount (in MB) of WAL
generated over measurement interval:

```
Sat Jul 19 11:57:30 EDT 2014: 33/D4D5DF80 33/D502AF50 2.8007354736328125
Sat Jul 19 11:57:40 EDT 2014: 33/D502AF50 33/D51B4040 1.5353851318359375
Sat Jul 19 11:57:50 EDT 2014: 33/D51B4040 33/D53E08C0 2.1739501953125000
```

TODO
====

1. Allow a configurable value for the first active warehouse-id.

2. Allow user to increase/decrease the think/keying times, with an aim of
   increasing/decreasing the transaction rates using the same number of
   active warehouses.
