const asyncWrapper = require("../../middleware/asyncWrapper");
const Owner = require("../../models/owner.model");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");

const getSingleOwner = asyncWrapper(async (req, res, next) => {
  const { ownerId } = req.params;

  const owner = await Owner.findById(
    { _id: ownerId },
    { __v: false, password: false, token: false }
  );

  if (!owner) {
    const err = appError.create("owner not found", 400, FAIL);
    return next(err);
  }

  return res.status(200).json({
    status: SUCCESS,
    message: "fetch is successfully",
    data: { owner },
  });
});

module.exports = {
  getSingleOwner,
};
