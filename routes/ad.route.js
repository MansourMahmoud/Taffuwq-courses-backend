const express = require("express");
const {
  getAllAds,
  addAd,
  getSingleAd,
  deleteAd,
  updateAd,
} = require("../controllers/owners/ad.controller");
const router = express.Router();

router.route("/").get(getAllAds).post(addAd);

router.route("/:adId").get(getSingleAd).delete(deleteAd).patch(updateAd);

module.exports = router;
