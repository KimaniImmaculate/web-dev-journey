## Assignment 9 — Simple Notes API

A small Express-based notes API used for learning Node.js and building simple REST endpoints. Notes are stored in-memory (an array) so data will reset when the server restarts. The server provides basic CRUD operations for notes.

### Run the server

Make sure Node.js is installed. From the `Assignment 9` folder run:

```powershell
# If you haven't already initialized the project and installed Express
npm init -y
npm install express

# Start the server
node server.js
```

By default the server listens on port 3000. You should see a console message: `Server is running on port 3000`.

### Example API endpoints

Base URL: http://localhost:3000

- GET /notes
	- Returns a JSON array of all notes.
	- Example response:

```json
[
	{ "id": 1, "title": "Grocery List", "content": "Milk, Bread, Eggs, Butter" },
	{ "id": 2, "title": "Homework", "content": "Finish Node.js assignment" }
]
```

- GET /notes/:id
	- Returns a single note by ID. Returns 404 if not found.

- POST /notes
	- Create a new note. Request body (JSON):

```json
{
	"title": "New note",
	"content": "Note content here"
}
```

	- Returns 201 with the created note.

- PUT /notes/:id
	- Update an existing note. Request body same shape as POST. Returns 404 if note not found.

- DELETE /notes/:id
	- Deletes the note. Returns 204 on success.

### Testing with Insomnia or Postman

You can test the API easily using Insomnia or Postman. The steps are the same in both clients:

- Set the request method (GET, POST, PUT, DELETE).
- Set the URL to: `http://localhost:3000` plus the endpoint (for example `/notes` or `/notes/1`).
- For POST and PUT requests add a header: `Content-Type: application/json` and use a raw JSON body.

Examples:

- GET all notes
	- Method: GET
	- URL: `http://localhost:3000/notes`

- GET a single note
	- Method: GET
	- URL: `http://localhost:3000/notes/1`

- Create a note (POST)
	- Method: POST
	- URL: `http://localhost:3000/notes`
	- Headers: `Content-Type: application/json`
	- Body (raw JSON):

```json
{
	"title": "Test",
	"content": "Hello"
}
```

- Update a note (PUT)
	- Method: PUT
	- URL: `http://localhost:3000/notes/1`
	- Headers: `Content-Type: application/json`
	- Body (raw JSON):

```json
{
	"title": "Updated",
	"content": "New content"
}
```

- Delete a note
	- Method: DELETE
	- URL: `http://localhost:3000/notes/1`


---

Notes are stored temporarily in the server process. For persistence, replace the in-memory storage with a database.
