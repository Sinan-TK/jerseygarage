// Toggle active radio cards
document.querySelectorAll(".radio-card").forEach((card) => {
  card.addEventListener("click", () => {
    const name = card.querySelector("input").name;
    document
      .querySelectorAll(`input[name="${name}"]`)
      .forEach((i) => i.closest(".radio-card").classList.remove("active"));
    card.classList.add("active");
    card.querySelector("input").checked = true;
  });
});

document
  .getElementById("addAddressForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("submitBtn");
    btn.innerHTML = "Saving...";
    btn.disabled = true;
    const form = e.target;

    const formData = {
      full_name: form.full_name.value.trim(),
      address_type: form.address_type.value.trim(),
      phone_no: form.phone_no.value.trim(),
      address_line: form.address_line.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      zip_code: form.zip_code.value.trim(),
      country: form.country.value.trim(),
      is_default: true,
    };

    try {
      const res = await axios.post("/user/address", formData);

      if (res.data.success) {
        toastr.success(res.data.message, "Success");

        setTimeout(() => {
          closeAddAddressModal();
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      const error = err.response?.data;
      console.error(error);

      btn.innerHTML = "Save Address";
      btn.disabled = false;
      toastr.error(error?.message || "Something went wrong", "Failed!!");
    }
  });

function openAddAddressModal() {
  console.log("running");
  document.getElementById("addAddressModal").style.display = "flex";
}

function closeAddAddressModal() {
  const modal = document.getElementById("addAddressModal");
  const form = document.getElementById("addAddressForm");

  form.reset();

  const btn = document.getElementById("submitBtn");
  btn.innerHTML = "Save Address";
  btn.disabled = false;

  modal.style.display = "none";
}

function closeEditAddressModal() {
  document.getElementById("editAddressModal").style.display = "none";
}

function openEditAddressModal(btn) {
  const address = JSON.parse(decodeURIComponent(btn.dataset.address));

  document.getElementById("edit_address_id").value = address._id;
  document.getElementById("edit_full_name").value = address.full_name;
  document.getElementById("edit_address_type").value = address.address_type;
  document.getElementById("edit_phone_no").value = address.phone_no;
  document.getElementById("edit_address_line").value = address.address_line;
  document.getElementById("edit_city").value = address.city;
  document.getElementById("edit_state").value = address.state;
  document.getElementById("edit_zip_code").value = address.zip_code;
  document.getElementById("edit_country").value = address.country;
  document.getElementById("edit_is_default").checked = address.is_default;

  document.getElementById("editAddressModal").style.display = "flex";
}

document
  .getElementById("editAddressForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const btn = form.querySelector("#edit-submit");

    btn.innerHTML = "Saving...";
    btn.disabled = true;

    const addressId = form.address_id.value;

    console.log(addressId);

    const formData = {
      full_name: form.full_name.value.trim(),
      address_type: form.address_type.value.trim(),
      phone_no: form.phone_no.value.trim(),
      address_line: form.address_line.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      zip_code: form.zip_code.value.trim(),
      country: form.country.value.trim(),
      is_default: form.is_default.checked,
    };

    // console.log(formData);
    try {
      const res = await axios.patch(
        `/user/address/edit/${addressId}`,
        formData,
      );
      if (res.data.success) {
        toastr.success(res.data.message, "Success");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      const error = err.response?.data;

      toastr.error(error?.message, "Error!!");

      btn.innerHTML = "Update Address";
      btn.disabled = false;
    }
  });

document.querySelector(".place-order").addEventListener("click", async () => {
  const addressId = selectedValue("address");

  const paymentMethod = selectedValue("payment");

  try {
    const res = await axios.post("/user/place-order", {
      addressId,
      paymentMethod,
    });

    console.log(res);

    if (res.data.data?.waring) {
      toastr.waring(res.data.data.waring, "warning");
    }

    if (res.data.success) {
      toastr.success(res.data.message, "Success");
      setTimeout(() => {
        window.location.href = res.data.redirect;
      }, 1000);
    }
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
});

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}
