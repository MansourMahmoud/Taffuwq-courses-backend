const asyncWrapper = require("../../middleware/asyncWrapper");
const appError = require("../../utils/appError");
const { SUCCESS, FAIL } = require("../../utils/httpStatusText");
const Stripe = require("stripe");

const createChechoutSession = asyncWrapper(async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { courses, course, email, endPoint, mode, adId } = req.body;

  let totalPrice = 0;

  if (mode === true || mode === "true") {
    const extractingItems = await courses.map((course) => {
      let unit_amount = 0;

      if (course.course?.ad?.showDiscount) {
        // احتساب السعر بعد التخفيض
        unit_amount = +course.course?.ad?.discount;
      } else {
        // إذا لم يكن هناك تخفيض، احتساب السعر كالمعتاد
        unit_amount = +course.course?.ad?.priceOfCourse;
      }

      totalPrice += unit_amount;

      return {
        quantity: 1,
        price_data: {
          currency: "ILS",
          unit_amount: unit_amount * 100,
          product_data: {
            name: course.course.ad.course,
            description: course.course.ad.description,
            images: [course.course.ad.courseImg],
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: extractingItems,
      mode: "payment",
      success_url: `${process.env.BASE_URL_FRONTEND}${
        endPoint || ""
      }/success?session_id={CHECKOUT_SESSION_ID}&mode=${true}`,
      cancel_url: `${process.env.BASE_URL_FRONTEND}${endPoint || ""}`,
      metadata: {
        email,
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 2000,
              currency: "ILS",
            },
            display_name: "مصاريف إدارية",
          },
        },
      ],
    });

    return res.status(200).json({
      message: "Connection is Active!",
      success: true,
      id: session.id,
      data: { courses, email },
    });
  } else {
    let unit_amount = 0;

    if (course.course?.ad?.showDiscount) {
      // احتساب السعر بعد التخفيض
      unit_amount = +course.course?.ad?.discount;
    } else {
      // إذا لم يكن هناك تخفيض، احتساب السعر كالمعتاد
      unit_amount = +course.course?.ad?.priceOfCourse;
    }

    totalPrice += unit_amount;

    const extractingItems = {
      quantity: 1,
      price_data: {
        currency: "ILS",
        unit_amount: unit_amount * 100,
        product_data: {
          name: course.course.ad.course,
          description: course.course.ad.description,
          images: [course.course.ad.courseImg],
        },
      },
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [extractingItems],
      mode: "payment",
      success_url: `${process.env.BASE_URL_FRONTEND}${
        endPoint || ""
      }/success?session_id={CHECKOUT_SESSION_ID}&mode=${false}&course=${
        course.courseId
      }&total=${totalPrice.toString()}&adId=${adId}`,
      cancel_url: `${process.env.BASE_URL_FRONTEND}${endPoint || ""}`,
      metadata: {
        email,
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 2000,
              currency: "ILS",
            },
            display_name: "مصاريف إدارية",
          },
        },
      ],
    });

    return res.status(200).json({
      message: "Connection is Active!",
      success: true,
      id: session.id,
      data: { course, email },
    });
  }
});

module.exports = {
  createChechoutSession,
};
