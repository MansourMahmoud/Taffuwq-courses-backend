const asyncWrapper = require("../../middleware/asyncWrapper");
const Ad = require("../../models/ad.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getAllAds = asyncWrapper(async (req, res, next) => {
  const ads = await Ad.find({}, { __v: false });

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
  const { course, branch, from, to } = req.body;
  console.log(req.body);
  if (!course) {
    const err = appError.create("course is required", 400, FAIL);
    return next(err);
  } else if (!branch) {
    const err = appError.create("branch is required", 400, FAIL);
    return next(err);
  } else if (!from) {
    const err = appError.create("from is required", 400, FAIL);
    return next(err);
  } else if (!to) {
    const err = appError.create("to is required", 400, FAIL);
    return next(err);
  }

  const ad = new Ad({
    course,
    branch,
    from,
    to,
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
