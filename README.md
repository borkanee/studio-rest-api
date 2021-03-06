Made during the course [1dv527](http://coursepress.lnu.se/kurs/the-web-as-an-application-platform/) (The web as an application platform) at Linnaeus University. 

---

Simple Studio API available at https://api-studio.herokuapp.com/

The API is intended to be used by Studio members looking to report songs they have recorded. Resources are not tied to specific users, all registered users have the ability to create, update and delete songs.

TO TEST: Download the two JSON-files inside the postman-folder. One is for the collection and the other is for enviroment variables. 

If the API is unused for a while, it will sleep. The first request might take a second. This the way free apps run on Heroku.

**Explain and defend your implementation of HATEOAS in your solution** <br>
I have tried to follow the HAL specification (http://stateless.co/hal_specification.html) as much as possible. I would say that the specification is somewhat unclear on certain points and many of the larger businesses that implement HAL do that in different ways. There doesn't seem to be a "correct" way. But the main point here are the links that "move" the API forward to additional resources and tell the client it's position. Keys within links describe the relationship between the current resource and the link. Embedded resources are used for presenting children of a resource, for example in a list. I have an entry point in the API with information and relative links to get started, such as register, authenticate, list songs etc. After a successful registration, there is a link to autenticate as well as an description. When presenting a collection of songs, there are next, last, first, and previos links for pages, since I'm using pagination and only present 10 resources per page.

**If your solution should implement multiple representations of the resources. How would you do it?** <br>
At the moment, only application/json is avaliable as Content-Type and Accept to the client. In the case of other representations, I would have given the user an option to choose something else, for example XML, and in that case the logic on the server would have looked a bit different; I would probably have used multiple libraries for parsing and responding with the correct MIME type.

**Motivate and defend your authentication solution** <br>
For unsafe HTTP-methods (POST, PUT, DELETE) the client must provide a JSON Web Token in the Authorization header. To get a token, client must login with correct credentials. The token expires 2 hours after creation. The token includes username, expire, issuer and issued at. Password is NOT included in the token. The secret that is used to validate the JWT is stored in an enviroment variable on Heroku. Token-based which I'm using seems to be the safest and best for this purpose. It can only be used for a short amount of time, it only consists of data that I don't consider as vulnerable, and the client is not forced to send username and password for each request.

* **What other authentication solutions could you implement?** <br>
HTTP Basic authentication, Digest Authentication, OAuth, API keys

* **What pros/cons do this solution have?** <br>
Basic Authentication is built in the HTTP-standard and is well supported. It's not encrypted so when using it without TSL the data is pretty easy to get to. It's easy to implement and with HTTPS I would consider it an okay approach except the need to send username and password on every request. Digest authentication is similar but it uses MD5 hashing, which today is considered a bit outdated for this purpose. API keys are similar to token-based but api keys often have longer expiration time and they are mostly used when logging a specific users request and keeping statistics. I can't see any reason for using the Oauth flow here to obtain an access token because it's only a simple API without a client application. Also, even if a specific client was developed that used this API, it would not be making requests on third-party user's behalf. Perhaps the Resource Owner Password Credentials (ROPC) grant type could have been used.

**Explain how your web hook works** <br>
The client can choose to create a webhook by providing a payloadURL in a POST request to /webhooks. To test webhooks, use https://webhook.site and enter the provided URL in the post body or enter another endpoint URL of your choice. The payloadURL is stored in mongoDB together with an event chosen by me. Whenever somebody creates a new resource (adds a song) through the API, my webhohoks.trigger-function will send a JSON-payload to all registered payloadURLs. Here is an example of the JSON-payload: 

```json
{
  "action": "newSong",
  "createdAt": "2019-02-28T14:14:51.553Z",
  "sender": "testuser",
  "song": {
    "name": "Detta är en ny låt",
    "url": "https://api-studio.herokuapp.com/songs/5c77ecdbd164f700178361dc"
  }
}
```

**Since this is your first own web API there are probably things you would solve in an other way looking back at this assignment. Write your down thoughts about this** <br>
Well, first of, I would have considered other hypermedia types before starting. I did look into JSON API a bit but it seemed a bit overkill for this API. Another thing that needs improvement is validation. I'm checking a few things, like valid URI for payloadURL and the length of the provided username and password but that's basically it. It was not something I focused on during this assignment as most of the time was spent on structuring the JSON responses. I chose to use Restify for this API, not because I find it better than Express for example but because I wanted to try something new. I would have liked to spend more time looking into different frameworks, comparing their pros and cons.

**Did you do something extra besides the fundamental requirements? Explain them.** <br>
I'm not sure if this is considered extra. The client can register as a user and then login with the credentials to get a token for unsafe HTTP-methods. HTTP GET is redirected to HTTPS. POST, PUT and DELETE requests requires HTTPS. When using HTTP the API returns a 403 with a message explaining how to proceed. The API is running on Heroku and according to their documentation "SSL is always enabled for .herokuapp.com". I'm not using my own domain, It's running on https://api-studio.herokuapp.com/
