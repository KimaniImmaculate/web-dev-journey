const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

//Logging middleware
app.use((req, res, next) => {
    const currentTime = new Date().toISOString();
    console.log(`[${currentTime}] ${req.method} ${req.url}`);
    next();
});

//Temporary notes storage
let notes = [
    { id: 1, title: "Grocery List", content: "Milk, Bread, Eggs, Butter" },
    { id: 2, title: "Homework", content: "Finish Node.js assignment" },
    { id: 3, title: "Books to Read", content: "Clean Code, Eloquent JavaScript" }
];
let currentId = 4; // next ID to assign

//Routes
//GET /notes - Retrieve all notes
app.get('/notes', (req, res) => {
    res.json(notes);
});

//GET /notes/:id - Retrieve a specific note by ID
app.get('/notes/:id', (req, res) => {
    const note = notes.find(n => n.id === parseInt(req.params.id));
    if (!note) {
        return res.status(404).json({ error: "Note not found." });
    }
    res.json(note);
});

//POST /notes - Create a new note
app.post('/notes', (req, res) => {
    const { title, content } = req.body;

    // Validate request body
    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
    }

    const newNote = { id: currentId++, title, content };
    notes.push(newNote);
    res.status(201).json(newNote);
});

//PUT /notes/:id - Update an existing note by ID
app.put('/notes/:id', (req, res) => {
    const note = notes.find(n => n.id === parseInt(req.params.id));
    if (!note) {
        return res.status(404).json({ error: "Note not found." });
    }

    // Validate request body
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
    }

    note.title = title;
    note.content = content;
    res.json(note);
});

//DELETE /notes/:id - Delete a note by ID
app.delete('/notes/:id', (req, res) => {
    const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id));
    if (noteIndex === -1) {
        return res.status(404).json({ error: "Note not found." });
    }

    notes.splice(noteIndex, 1);
    res.status(204).send();
});

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});