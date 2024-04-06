---
title: "#3 User Registration API"
description: Building a User Registration API with GoLang and CassandraDB
pubDate: 6-April-2024
tags: ["Go", "CassandraDB"]
---

It's time to write an API to register a user into the database. First, we have to connect our database with our server, and to do that we will need a driver. A database driver is a component which allows us to interact with the database from our application.

In this case, we will be using GoCQL which is a database driver for CassandraDB. We can install it with the following command.

```shell
go get github.com/gocql/gocql
```

In our directory, I have the `'server'` folder, and inside that `'http-server'` folder where the code for our http-service resides. At this moment I am not worried about project structure. I want to make things working. I'll arrange the code into separate files and packages later.

For now, let's just create a db.go file inside `'http-server'` and write this code in there.

```go
package main

import (
	"fmt"
	"log"

	"github.com/gocql/gocql"
)

var Session *gocql.Session

func initDb() {
	var err error
	cluster := gocql.NewCluster("127.0.0.1")
	cluster.Keyspace = "channels_db"
	Session, err = cluster.CreateSession()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Database initialized")
}
```

Here, we are importing the gocql package and using it to initialize a database session.

Now, we can call the initDb() function in our `main.go` file to initialize the session.

```go
func main() {
	initDb()
	router := http.NewServeMux()

	log.Printf("Starting server on port %s", server.Addr)
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
```

Let's add a route for the user registration and create a handler.

```go
	router.HandleFunc("POST /api/user", handleCreate)
```

Before creating the handler for the API route we first have to define our user model.

```go
type User struct {
	UserID    gocql.UUID `json:"user_id"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Password  string     `json:"password"`
	CreatedAt time.Time  `json:"created_at"`
}
```

Now let's create the handler by writing the following code.

```go
func handleCreate(w http.ResponseWriter, r *http.Request) {
    var newUser User
    err := json.NewDecoder(r.Body).Decode(&newUser)
    if err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        log.Println("Error decoding request body: ", err)
        return
    }
    defer r.Body.Close()
```

The `handleCreate` function begins by decoding the JSON request body into a `User` struct. The `defer` statement ensures that the request body is closed after the function returns to prevent resource leaks.

Now we have to check if the user with the same email already exists in our database. For that, I wrote the code as shown below.

```go
	var existingUser User
	query := "SELECT user_id FROM users WHERE email = ? LIMIT 1 ALLOW FILTERING"
	if err := Session.Query(query, newUser.Email).Scan(&existingUser.UserID); err == nil {
		http.Error(w, "Email already exists", http.StatusConflict)
		log.Println("Email already exists in the database")
		return
	} else if err != gocql.ErrNotFound {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Println("Error querying database:", err)
		return
	}
```

**note**: At first, in the CQL query I hadn't included 'ALLOW FILTERING', which gave me an error :
`error querying database: cannot execute this query as it might involve data filtering and thus may have unpredictable performance. if you want to execute this query despite the performance unpredictability, use allow filtering`

Right now, I don't know about the better method to check if a user with the same email already has an account. i'll update this part once i figure it out.

In the following code we are generating a timestamp for when the user is created and assigning a UUID using gocql.TimeUUID(). We are using the bcrypt package to hash the password.

```go
    newUser.CreatedAt = time.Now()
    newUser.UserID = gocql.TimeUUID()

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        log.Println("Error hashing password:", err)
        return
    }
    newUser.Password = string(hashedPassword)

```

Now, we will write a database query to insert the user and execute the query by using the session object from the database driver.

```go
	query := "INSERT INTO users (user_id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)"

	if err := Session.Query(query, newUser.UserID, newUser.Username, newUser.Email, newUser.Password, newUser.CreatedAt).Exec(); err != nil {
		log.Println("Error while inserting into database:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
```

Finally, we can return a `201 Created` status upon successful user creation and send a JSON response.

```go
w.WriteHeader(http.StatusCreated)
log.Println("received request to create a User")

	response := map[string]string{"message": "User created!"}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Println("Error encoding JSON response:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
```

With that, we have RestAPI for the user registration. Let's test by using Postman.

![Postman screenshot](/postman03.png)

We can see that our API is working. Let's confirm if the user is created in the database by connecting to the database with cqlsh and select the keyspace for our project by typing '`USE channels_db`' command.

Then use the following query

```cql
SELECT * FROM users;
```

That will give us the output as below. where we can see that our table contains a record for a user.

![User table screenshot](/databasess04.png)

