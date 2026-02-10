import Razorpay from "razorpay";

export default new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_TESTKEYSECRET,
});

//<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// import razorpay from "../config/razorpay.js";

// export const createOrder = async (req, res) => {

//   const { amount } = req.body;

//   const order = await razorpay.orders.create({
//     amount: amount * 100,
//     currency: "INR"
//   });

//   res.json(order);
// };

