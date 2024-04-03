---
title: "#2 Setting up the database"
description: Installing CassandraDB and creating a keyspace.
pubDate: 3-April-2024
tags: ["CassandraDB"]
---

Let's set up the database now. As I mentioned in the first post, we will use CassandraDB.

I followed the steps for the installation from the official documentation site. I don't want to deal with docker at the moment therefore I installed the Tarball binary file.

After extracting the .tar.gz file we can cd into it and start the database.

```shell
$ cd apache-cassandra-4.1.4/ && bin/cassandra
```

Let's connect to the database using cqlsh. It is a command-line interface for interacting with Cassandra.

```shell
$ bin/cqlsh
```

Now, we can create a keyspace for our project by typing the following query.

```cql
CREATE KEYSPACE channels_db WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}
```

Here we are creating a keyspace named "channels_db". A keyspace in Cassandra is akin to a database in traditional relational database systems.

- In the `replication` map, `'class'` is a key that specifies the replication strategy class.
- In this case, the replication strategy chosen is `'SimpleStrategy'`. SimpleStrategy is a basic replication strategy that is suitable for single data centers or development environments. It distributes replicas of data evenly across the cluster nodes.
- `'replication_factor'` is another key within the replication map. It specifies the number of replicas (copies) of data to be maintained for fault tolerance.
- In this query, the replication factor is set to `'1'`, meaning that only one replica of each piece of data will be maintained. While this is fine for development it doesn't provide fault tolerance in a production environment. Production systems typically use a replication factor greater than one to ensure data durability and availability

After creating keyspace we can type `use channels_db` command to connect to our database.

Let's create a user table inside the database with the following query.

```cql
CREATE TABLE users (
    user_id uuid PRIMARY KEY,
    bio text,
    created_at timestamp,
    email text,
    password text,
    username text
)
```

We can display all the tables in database with `DESCRIBE tables` query.

Now, that we have a database ready. We can connect to it from our HTTP Server.
