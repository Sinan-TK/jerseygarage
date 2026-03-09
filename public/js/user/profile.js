document.querySelector(".edit-btn").addEventListener("click", () => {
  document.querySelector(".edit-btn").style.display = "none";
  document.querySelector(".edit-submit").style.display = "flex";
  document.querySelector(".edit-cancel").style.display = "flex";

  const fullNameP = document.getElementById("full_name");
  const fullName = fullNameP.textContent.trim();

  const emailP = document.getElementById("email");
  const email = emailP.textContent.trim();

  const phoneNoP = document.getElementById("phone_no");
  const phoneNo = phoneNoP.textContent.trim();

  const inputName = document.createElement("input");
  inputName.type = "text";
  inputName.value = fullName;
  fullNameP.replaceWith(inputName);
  inputName.className = "edit-input";
  inputName.id = "fullName";

  const inputMail = document.createElement("input");
  inputMail.type = "text";
  inputMail.value = email;
  emailP.replaceWith(inputMail);
  inputMail.className = "edit-input";
  inputMail.id = "email";

  const inputPhone = document.createElement("input");
  inputPhone.type = "number";
  inputPhone.value = phoneNo;
  phoneNoP.replaceWith(inputPhone);
  inputPhone.className = "edit-input";
  inputPhone.id = "phoneNo";
});

async function editSubmit() {
  const inputs = document.querySelectorAll(".edit-input");

  let values = {};

  inputs.forEach((input) => {
    values[input.id] = input.value.trim();
  });
  try {
    const res = await axios.patch("/user/profile/edit", values);

    if (res.data.success) {
      if (res.data.message === "Email change") {
        toastr.success("Otp verification needed!!", res.data.message);

        setTimeout(() => {
          window.location.href = res.data.redirect;
        }, 1000);
      } else {
        toastr.success(res.data.message, "Edited");

        document.querySelector(".edit-btn").style.display = "flex";
        document.querySelector(".edit-submit").style.display = "none";
        document.querySelector(".edit-cancel").style.display = "none";

        const editedData = res.data.data;

        const inputName = document.getElementById("fullName");
        const fullNameP = document.createElement("p");
        fullNameP.id = "full_name";
        fullNameP.innerText = editedData.full_name;
        inputName.replaceWith(fullNameP);

        const inputMail = document.getElementById("email");
        const emailP = document.createElement("p");
        emailP.id = "email";
        emailP.innerText = editedData.email;
        inputMail.replaceWith(emailP);

        const inputPhone = document.getElementById("phoneNo");
        const phoneNoP = document.createElement("p");
        phoneNoP.id = "phone_no";
        phoneNoP.innerText = editedData.phone_no;
        inputPhone.replaceWith(phoneNoP);
      }
    }
  } catch (err) {
    const error = err.response?.data;

    console.log(error);

    toastr.error(error?.message || "Something went wrong!!", "Failed");
  }
}

/* =========================
   OPEN / CLOSE
========================= */

function openPasswordModal() {
  document.getElementById("passwordModal").style.display = "flex";
}

function closePasswordModal() {
  document.getElementById("passwordModal").style.display = "none";

  // Reset form
  document.getElementById("passwordForm").reset();
}

/* =========================
   SUBMIT HANDLER
========================= */

document
  .getElementById("passwordForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;

    const newPassword = document.getElementById("newPassword").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    const payload = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    console.log(payload);

    try {
      const res = await axios.patch("/user/profile/change-password", payload);

      if (res.data.success) {
        toastr.success(res.data.message || "Password updated", "success");
        closePasswordModal();
      }
    } catch (err) {
      const error = err.response?.data;

      if (error?.message) {
        const errorBox = document.querySelector(".error-box");
        errorBox.style.display = "flex";
        const errorTxt = document.querySelector(".error-text-password");
        errorTxt.innerText = error.message;

        setTimeout(() => {
          errorBox.style.display = "none";
        }, 2000);
      } else {
        toastr.error("Failed to update password", "error");
      }
    }
  });

/* =========================
   CLOSE ON OUTSIDE CLICK
========================= */

document.getElementById("passwordModal")?.addEventListener("click", (e) => {
  if (e.target.id === "passwordModal") {
    closePasswordModal();
  }
});

document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.getAttribute("data-target"));

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

const avatarModal = document.getElementById("avatarModal");
const avatarPreview = document.getElementById("avatarPreview");
const userAvatar = document.getElementById("userAvatar");

// Open modal
userAvatar.addEventListener("click", () => {
  avatarPreview.src = userAvatar.src;
  avatarModal.style.display = "flex";
});

// Close modal
document
  .getElementById("avatarModalClose")
  .addEventListener("click", closeAvatarModal);
avatarModal.addEventListener("click", (e) => {
  if (e.target === avatarModal) closeAvatarModal();
});

function closeAvatarModal() {
  avatarModal.style.display = "none";
}

// Change photo
document.getElementById("changeAvatarBtn").addEventListener("click", () => {
  document.getElementById("avatarInput").click();
});

// Remove photo
document
  .getElementById("removeAvatarBtn")
  .addEventListener("click", async () => {
    try {
      const res = await axios.delete("/user/profile/avatar");
      if (res.data.success) {
        // const defaultAvatar = "/images/default-avatar.png";
        userAvatar.src = res.data.data.avatar;
        avatarPreview.src = res.data.data.avatar;
        toastr.success(res.data.message, "Success");
        closeAvatarModal();
      }
    } catch (err) {
      toastr.error("Failed to remove profile picture", "Error");
    }
  });

////////////////////////////////////////////////////////////////////////////////////

let cropper = null;

// When file is selected → open cropper modal
document.getElementById("avatarInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    // Close avatar modal, open crop modal
    closeAvatarModal();
    document.getElementById("cropModal").style.display = "flex";

    const cropImage = document.getElementById("cropImage");
    cropImage.src = ev.target.result;

    // Destroy previous cropper if exists
    if (cropper) cropper.destroy();

    cropper = new Cropper(cropImage, {
      aspectRatio: 1, // square crop for profile pic
      viewMode: 1,
      autoCropArea: 1,
      movable: true,
      zoomable: true,
      rotatable: false,
    });
  };
  reader.readAsDataURL(file);

  // Reset input so same file can be selected again
  e.target.value = "";
});

// Close crop modal
document.getElementById("cropModalClose").addEventListener("click", () => {
  document.getElementById("cropModal").style.display = "none";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
});

// Save cropped image
document.getElementById("cropSaveBtn").addEventListener("click", async () => {
  if (!cropper) return;

  // Get cropped canvas
  const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });

  // Close crop modal
  document.getElementById("cropModal").style.display = "none";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }

  // Convert canvas to blob and upload
  canvas.toBlob(
    async (blob) => {
      const formData = new FormData();
      formData.append("avatar", blob, "avatar.jpg");

      try {
        const res = await axios.patch("/user/profile/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          document.getElementById("userAvatar").src = res.data.data.avatar;
          document.getElementById("avatarPreview").src = res.data.data.avatar;
          toastr.success(res.data.message, "Success");
        }
      } catch (err) {
        const error = err.response?.data;
        console.error(error);
        toastr.error(
          error?.message || "Failed to update profile picture",
          "Error",
        );
      }
    },
    "image/jpeg",
    0.9,
  );
});
