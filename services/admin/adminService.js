import Admin from "../../models/adminModel.js";
import * as Responses from "../../utils/responses/admin/admin.response.js";

//=============================================================================
//=============================================================================

export const adminLoginLogic = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return { error: Responses.adminLogin.ADMIN_NOT_FOUND };
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return { error: Responses.adminLogin.INVALID_PASSWORD };
  }

  return {
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      avatar: admin.avatar,
    },
  };
};

//=============================================================================
//=============================================================================

