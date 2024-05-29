const asyncWrapper = require("../../middleware/asyncWrapper");
const Note = require("../../models/note.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getAllNotes = asyncWrapper(async (req, res, next) => {
  const { studentId } = req.params;
  const notes = await Note.find({ studentId }).sort({ updatedAt: -1 });
  return res.status(200).json({
    status: "SUCCESS",
    message: "note fetched successfully",
    data: { notes },
  });
});
const addNote = asyncWrapper(async (req, res, next) => {
  const { studentId, title, content, dueDate } = req.body;
  const newNote = new Note({
    studentId,
    title,
    content,
    dueDate,
  });
  const savedNote = await newNote.save();

  return res.status(201).json({
    status: "SUCCESS",
    message: "note created successfully",
    data: { savedNote },
  });
});
const updateNote = asyncWrapper(async (req, res, next) => {
  const { noteId } = req.params;
  const updatedNote = await Note.findByIdAndUpdate(
    noteId,
    { ...req.body },
    { new: true }
  );

  return res.status(200).json({
    status: "SUCCESS",
    message: "note created successfully",
    data: { updatedNote },
  });
});
const deleteNote = asyncWrapper(async (req, res, next) => {
  const { noteId } = req.params;

  await Note.findByIdAndDelete(noteId);

  return res.status(200).json({
    status: "SUCCESS",
    message: "note deleted successfully",
    data: { data: null },
  });
});
const searchNotes = asyncWrapper(async (req, res, next) => {
  const { studentId, query } = req.params;
  const { startTime, endTime } = req.query; // استخراج startTime و endTime من الاستعلام

  const searchRegex = new RegExp(query, "i");

  const queryConditions = {
    studentId,
    $or: [
      { title: searchRegex },
      { content: searchRegex },
    ],
  };

  // إضافة شروط البحث بين startTime و endTime إذا كانت موجودة
  if (startTime && endTime) {
    queryConditions.dueDate = {
      $gte: new Date(startTime), // بداية الفترة
      $lte: new Date(endTime), // نهاية الفترة
    };
  }

  const notes = await Note.find(queryConditions);
  console.log("notes:", notes);
  return res.status(200).json({
    status: "SUCCESS",
    message: "Notes retrieved successfully",
    data: { notes },
  });
});
module.exports = {
  getAllNotes,
  addNote,
  updateNote,
  deleteNote,
  searchNotes,
};
