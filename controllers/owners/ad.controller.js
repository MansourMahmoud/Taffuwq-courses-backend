const asyncWrapper = require("../../middleware/asyncWrapper");
const Ad = require("../../models/ad.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getAllAds = asyncWrapper(async (req, res, next) => {
  const options = {
    select: { __v: false },
    page: parseInt(req.query.page) || 1, // الصفحة الحالية (الافتراضي الصفحة 1)
    limit: parseInt(req.query.limit) || 5, // عدد العناصر في كل صفحة (الافتراضي 5)
  };

  const ads = await Ad.paginate({}, options);

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { ads },
  });
});

const getSingleAd = asyncWrapper(async (req, res, next) => {
  const { adId } = req.params;

  const ad = await Ad.findById({ _id: adId }, { __v: false });

  if (!ad) {
    const err = appError.create("ad not found", 400, FAIL);
    return next(err);
  }

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { ad },
  });
});

const addAd = asyncWrapper(async (req, res, next) => {
  const {
    course,
    branch,
    timeFrom,
    timeTo,
    dayFrom,
    dayTo,
    eduQualification,
    priceOfCourse,
  } = req.body;
  console.log(req.body);
  if (!course) {
    const err = appError.create("course is required", 400, FAIL);
    return next(err);
  } else if (!branch) {
    const err = appError.create("branch is required", 400, FAIL);
    return next(err);
  } else if (!eduQualification) {
    const err = appError.create("eduQualification is required", 400, FAIL);
    return next(err);
  } else if (!priceOfCourse) {
    const err = appError.create("priceOfCourse is required", 400, FAIL);
    return next(err);
  } else if (!timeFrom) {
    const err = appError.create("timeFrom is required", 400, FAIL);
    return next(err);
  } else if (!timeTo) {
    const err = appError.create("timeTo is required", 400, FAIL);
    return next(err);
  } else if (!dayFrom) {
    const err = appError.create("dayFrom is required", 400, FAIL);
    return next(err);
  } else if (!dayTo) {
    const err = appError.create("dayTo is required", 400, FAIL);
    return next(err);
  }

  const ad = new Ad({
    course,
    branch,
    eduQualification,
    priceOfCourse,
    timeFrom,
    timeTo,
    dayFrom,
    dayTo,
  });

  await ad.save();

  return res.status(201).json({
    status: SUCCESS,
    message: "ad has been added successfully",
    data: { ad },
  });
});

const updateAd = asyncWrapper(async (req, res, next) => {
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

const deleteAd = asyncWrapper(async (req, res, next) => {
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
  getAllAds,
  addAd,
  getSingleAd,
  deleteAd,
  updateAd,
};
