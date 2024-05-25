const asyncWrapper = require("../../middleware/asyncWrapper");
const TeacherLecture = require("../../models/teacherLecture.model");
const Teacher = require("../../models/teacher.model");

const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");
const uploadVideoLecture = require("../../utils/uploadVideoLecture");
const storage = require("../../helpers/firebase");
const {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const { v4 } = require("uuid");

const getAllTeachersLectures = asyncWrapper(async (req, res, next) => {
  const options = {
    select: { __v: false },
    page: parseInt(req.query.page) || 1, // الصفحة الحالية (الافتراضي الصفحة 1)
    limit: parseInt(req.query.limit) || 5, // عدد العناصر في كل صفحة (الافتراضي 5)
  };

  const teachersLectures = await TeacherLecture.paginate({}, options);

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { teachersLectures },
  });
});

const getSingleTeacherLecture = asyncWrapper(async (req, res, next) => {
  const { teacherLectureId } = req.params;

  const teacherLectures = await TeacherLecture.find(
    { teacherId: teacherLectureId },
    { __v: false }
  );

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { teacherLectures },
  });
});

const addTeacherLecture = asyncWrapper(async (req, res, next) => {
  const {
    teacherId,
    lectureTitle,
    lectureDescription,
    attachmentDescription1,
    attachmentDescription2,
    attachmentDescription3,
    attachmentDescription4,
    attachmentDescription5,
  } = req.body;

  const files = req.files;

  if (!teacherId) {
    const err = appError.create("teacherId is required", 400, FAIL);
    return next(err);
  }

  const teacher = await Teacher.findById({ _id: teacherId });

  if (!teacher) {
    const err = appError.create("teacher not found", 400, FAIL);
    return next(err);
  }

  if (!lectureTitle) {
    const err = appError.create("lectureTitle is required", 400, FAIL);
    return next(err);
  } else if (!lectureDescription) {
    const err = appError.create("lectureDescription is required", 400, FAIL);
    return next(err);
  }

  const lectureVideo = await uploadVideoLecture(files.lectureVideo[0]);

  // create attachments files on firebase
  let lectureAttachments = [];

  if (files.lectureAttachments) {
    const results = await Promise.all(
      files.lectureAttachments.map(async (file, index) => {
        // تعيين قيمة attachmentDescription
        const attachmentDescription = eval(`attachmentDescription${index + 1}`);
        const ex = file.mimetype.split("/").pop();
        let exName = file.originalname.split(`.${ex}`)[0];

        const lectureAttachmentRef = ref(
          storage,
          `lectures-attachments/${exName + v4() + "." + ex}`
        );

        const metadata = {
          contentType: file.mimetype,
        };

        const snapshot = await uploadBytesResumable(
          lectureAttachmentRef,
          file.buffer,
          metadata
        );

        const downloadURL = await getDownloadURL(snapshot.ref);
        const result = {
          attachment: downloadURL,
          attachmentDescription: attachmentDescription || "",
        };
        return result;
      })
    );
    lectureAttachments = results;
  }

  const teacherLecture = new TeacherLecture({
    teacherId,
    lectureVideo,
    lectureTitle,
    lectureDescription,
    lectureAttachments,
  });

  await teacherLecture.save();

  return res.status(201).json({
    status: SUCCESS,
    message: "TeacherLecture has been added successfully",
    data: { teacherLecture },
  });
});

const updateTeacherLecture = asyncWrapper(async (req, res, next) => {
  const { adId } = req.params;
  const reqBody = req.body;

  const ad = await Ad.findById({ _id: adId });

  if (!ad) {
    const err = appError.create("ad not found", 400, FAIL);
    return next(err);
  }

  await Ad.updateOne({ _id: adId }, { $set: reqBody });

  const updateAd = await Ad.findOne({ _id: adId });

  return res.status(200).json({
    status: SUCCESS,
    message: "ad has been updated successfully",
    data: { ad: updateAd },
  });
});

const deleteTeacherLecture = asyncWrapper(async (req, res, next) => {
  const { adId } = req.params;

  const ad = await Ad.findById({ _id: adId });

  if (!ad) {
    const err = appError.create("ad not found", 400, FAIL);
    return next(err);
  }

  await Ad.deleteOne({ _id: adId });

  return res.status(200).json({
    status: SUCCESS,
    message: "ad has been deleted successfully",
  });
});

module.exports = {
  getAllTeachersLectures,
  addTeacherLecture,
  getSingleTeacherLecture,
  updateTeacherLecture,
  deleteTeacherLecture,
};
