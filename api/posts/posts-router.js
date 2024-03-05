// implement your posts router here
const Posts = require('./posts-model');
const express = require('express')
const router = express.Router();

const currentDate = new Date();

// [GET] 1
// Returns an array of all the post objects contained in the database
router.get('/', async (req, res) => {
    try {
        const quotesList = await Posts.find()
        if (!quotesList) {
            res.status(404).json('Not found')
        }
        res.status(200).json(quotesList);
    } catch (err) {
        res.status(500).json('Internal router error')
    }
})

// [GET] 2
// Returns the post object with the specified id
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const quote = await Posts.findById(id)
        if (!quote) {
            res.status(404).json({ message: "does not exist" })
        }
        res.status(200).json(quote);
    } catch (err) {
        res.status(500).json('Internal server error')
    }
})

// [POST] 3
// Creates a post using the information sent inside the request body and returns the newly created post object
router.post('/', async (req, res) => {
    const post = req.body;
    try {
        if (!post.title || !post.contents) {
            return res.status(400).json({ message: "Please provide title and contents for the post" })
        }
        const returnId = await Posts.insert(post)
        const newObj = {
            id: returnId.id,
            ...post,
            created_at: currentDate,
            updated_at: currentDate,
        }
        res.status(201).json(newObj)
    } catch (err) {
        res.status(500).json({ message: "There was an error while saving the post to the database" })
    }
})

// [PUT] 4
// Updates the post with the specified id using data from the request body and returns the modified document, not the original
router.put('/:id', async (req, res) => {
    const post = req.body;
    const id = Number(req.params.id);
    console.log("ID: " + id)
    if (!id || id <= 0) {
        return res.status(404).json({ message: "The post with the specified ID does not exist" });
    }
    if (!post.title || !post.contents) {
        return res.status(400).json({ message: "Please provide title and contents for the post" });
    }
    try {
        const updated = await Posts.update(id, post);
        console.log("UPDATED: " + updated)
        const updatedObj = {
            ...post,
            id: Number(updated),
            updated_at: currentDate,
        }
        return res.status(201).json(updatedObj)
    } catch (err) {
        res.status(500).json('Internal server error')
    }
})

// [DELETE] 5
// Removes the post with the specified id and returns the deleted post object
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const post = await Posts.findById(id)
    try {
        const response = await Posts.remove(id);
        console.log(response)
        if (!response) {
            return res.status(404).json({ message: "The post with the specified ID does not exist" });
        }
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json('Internal server error')
    }
})

// [GET] 6
// Returns an array of all the comment objects associated with the post with the specified id
router.get('/:id/comments', async (req, res) => {
    const id = Number(req.params.id);
    const post = await Posts.findById(id);
    const comments = await Posts.findPostComments(id);
    if (!post) {
        return res.status(404).json({ message: "The post with the specified ID does not exist" })
    }
    if (!comments) {
        return res.status(404).json({ message: "The comments information could not be retrieved" })
    }
    try {
        return res.status(200).json(comments)
    } catch (err) {
        res.status(500).json('Internal server error')
    }
})

module.exports = router;