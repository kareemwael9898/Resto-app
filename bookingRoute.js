const express = require("express");
const {add, getByDate, getAll, getBusy, deleteBooking} = require("../services/booking");
const { verifyTokenAndAuthorization } = require("../middlewares/verifyToken");

const router = express.Router();
router.post("/booking/add", verifyTokenAndAuthorization,  add);
router.post("/booking/getByDate", verifyTokenAndAuthorization,  getByDate);
router.get("/booking/getAll", verifyTokenAndAuthorization,  getAll);
router.post("/booking/getBusy", verifyTokenAndAuthorization,  getBusy);
router.post("/booking/delete", verifyTokenAndAuthorization,  deleteBooking);

module.exports = router;