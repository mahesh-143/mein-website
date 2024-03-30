---
title: Setting up the HTTP server in Go
description: Installing latest version of Go and setting up the HTTP Server.
pubDate: 30-March-2024
tags: ["Go"]
---

Let's begin coding our project by setting up the HTTP server in Golang. and before doing that calling our project "A Discord clone" is less creative so let's give it a new name "channels".

Now naming out of the way. let's start by installing Go.

I did install Go previously on my machine but it's version 1.22 and the latest stable version is 1.22.1.
Well, It doesn't matter that much but let's start things fresh by installing the latest version.

## Installation

I am on Linux so I downloaded the binary release suitable for my OS and followed installation instructions from [official docs](https://go.dev/doc/install)

I started by removing the previous installation of go and then extracted the newly downloaded archive to `/usr/local`

```bash
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.1.linux-amd64.tar.gz
```

As I already had a go installed previously, therefore, PATH was already set in `.profile`. If that wouldn't have been the case I would have added it by adding this line

```bash
export PATH=$PATH:/usr/local/go/bin
```

Now, checking the version with `go version` command displays `go version go1.22.1 linux/amd64`. Which means I am now on the latest version.

## Setting up HTTP-server

I created a directory `channels/server`. Inside `server` folder we will write all the code for our backend

Let's start by typing `go mod init` command which will create a go.mod file which is like what package.json is to node.js.

```bash
go mod init github.com/mahesh-143/channels
```

Then let's create `server/main.go` and write code for our HTTP server. I am not going to use any framework instead, work with http/net module which comes with Go. After the release of Go 1.22 http/net module is all we need (I watched this [video](https://www.youtube.com/watch?v=H7tbjKFSg58) by Dreams of Code to learn about new features of the module).

I created a main function which is the entry point of the program. Inside that we can define our router and create an instance of `http.Server` and configure it to make the server listen on port :8080 and add the router as a handler to invoke (At the moment I'm not sure what Handler does, I know that router matches the URL of incoming requests against registered routes).

```go
router := http.NewServeMux()
```

```go
server := http.Server{
	Addr:    ":8080",
	Handler: router,
}

log.Printf("Starting server on port %s", server.Addr)
log.Fatal(server.ListenAndServe())
```

Running the program by typing `go run .` will print `Starting server on port :8080`. That means our server is up and running.

We can make a request to the server using curl and see that it returns error 404 as we haven't registered any routes

```bash
$ curl http://localhost:8080/
404 page not found
```

Now, we can define a route `/hello` and create a handler which will return JSON as a response. Here `handleHello` is a handler. If you have worked with Django or other MVC architecture based framework then a handler is like a controller.

```go
router.HandleFunc("GET /hello", handleHello)
```

We can write the handler as below

```go
type Message struct {
	Text string `json:"message"`
}

func handleHello(w http.ResponseWriter, r *http.Request) {
	message := Message{Text: "Hello, world!"}
	err := json.NewEncoder(w).Encode(message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
```

We can now test it using curl to see the JSON response

```bash
$ curl -X GET http://localhost:8080/hello
{"message":"Hello, world!"}
```

Here is full code that we wrote today.

```go
package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Message struct {
	Text string `json:"message"`
}

func handleHello(w http.ResponseWriter, r *http.Request) {
	message := Message{Text: "Hello, world!"}
	err := json.NewEncoder(w).Encode(message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func main() {
	router := http.NewServeMux()
	router.HandleFunc("GET /hello", handleHello)
	server := http.Server{
		Addr:    ":8080",
		Handler: router,
	}
	log.Printf("Starting server on port %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
```

Next, I'll set up CassandraDB and create API to register users. Stay tuned!
