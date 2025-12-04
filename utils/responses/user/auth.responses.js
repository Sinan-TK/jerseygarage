
export const loginUser = Object.freeze({
  USER_NOT_FOUND:{
    code: 404,
    message: "User not found!",
  },
  PASSWORD_NOT_MATCH:{
    code: 401,
    message: "Invalid password!",
  },
  LOGIN:{
    code: 200,
    message: "Login successful!",
    redirectToFrontend:"/",
  }
});

export const signupUserEmail = Object.freeze({
  USER_FOUND:{
    code: 409,
    message: "Email already registered!",
  },
  EMAIL_OK:{
    code: 200,
    message: "OTP sended successfully!",
    redirectToFrontend:"/verify-otp",
  }
});

export const otpVerify = Object.freeze({
  DATA_NOT_FOUND:{
    code: 409,
    message: "Session expired. Please try again!",
  },
  EMAIL_OK:{
    code: 200,
    message: "OTP sended successfully!",
    redirectToFrontend:"/verify-otp",
  }
});
