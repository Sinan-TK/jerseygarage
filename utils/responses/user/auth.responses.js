
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
  OTP_EXPIRED:{
    code: 410,
    message: "OTP expired. Please resend OTP!",
    redirectToFrontend:"/verify-otp",
  },
  INCORRECT_OTP:{
    code: 401,
    message:"Incorrect OTP. Please try again!",
  },
  REGISTER:{
    code: 200,
    message: "OTP verified successfully!",
    redirectToFrontend:"/register",
  },
  NEWPASSWORD:{
    code: 200,
    message: "OTP verified successfully!",
    redirectToFrontend:"/newpassword",
  }
});

export const resendOtp = Object.freeze({
  DATA_NOT_FOUND:{
    code: 409,
    message: "Session expired. Please try again!",
  },
  RESEND_OTP:{
    code: 200,
    message: "OTP resended successfully!",
  },
});

export const registerLogic = Object.freeze({
  DATA_NOT_FOUND:{
    code: 409,
    message: "Session expired. Please try again!",
  },
  ACCOUNT_CREATED:{
    code: 200,
    message: "Account Created Successfully!",
    redirectToFrontend: "/login",
  },
});

export const forgetPass = Object.freeze({
  NOT_FOUND:{
    code: 409,
    message: "No account found with this email!",
  },
  OTP_GENERATED:{
    code: 200,
    message: "OTP generated!",
    redirectToFrontend:"/verify-otp"
  },
  PASS_CHANGE:{
    code: 200,
    message: "Password changed successfully!",
    redirectToFrontend:"/login"
  },
});
