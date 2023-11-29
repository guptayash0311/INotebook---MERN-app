const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser')
const Note = require('../models/Notes')
const { body, validationResult } = require('express-validator');

//ROUTE 1 : Get all the notes using: GET "api/notes/fetchallnotes", Login required
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured!");
    }
})
//ROUTE 2 : Add a new note using: POST "api/notes/addnote", Login required
router.post('/addnote', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be of atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    try {


        const { title, description, tag } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured!");
    }
})

//ROUTE 3 : Updating a existing note using: PUT "api/notes/updatenote", Login required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        //Create a new note
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the not to be updated by that particular user and update it.
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found"); }
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed"); }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured!");
    }
})

//ROUTE 4 : Deleting a existing note using: DELETE "api/notes/deletenode", Login required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    
    try {
        // Find the not to be deleted by that particular user and delete it.
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found"); }
        // Allow deletion only if user owns that Note
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed"); }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted successfully", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured!");
    }
})
module.exports = router