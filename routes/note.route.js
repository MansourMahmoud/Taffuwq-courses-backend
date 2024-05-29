const express = require("express");
const {
  getAllNotes,
  addNote,
  updateNote,
  deleteNote,
  searchNotes,
} = require("../controllers/students/note.controller");
const router = express.Router();

router.route("/").post(addNote);
router.route("/:studentId").get(getAllNotes);
router.route("/:noteId").delete(deleteNote).patch(updateNote);
router.get("/:studentId/search", searchNotes);
router.get("/:studentId/search/:query", searchNotes);

module.exports = router;
