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
      phone_no: form.phone_no.value.trim(),
      address_line1: form.address_line1.value.trim(),
      address_line2: form.address_line2.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      zip_code: form.zip_code.value.trim(),
      country: form.country.value.trim(),
      is_default: form.is_default.checked,
    };

    console.log(formData);

    try {
      const res = await axios.post("/user/address", formData);

      if (res.data.success) {

        toastr.success(res.data.message,"Success");
        // Close modal
        closeAddAddressModal();

        // Optional: reload to show new address
        window.location.reload();
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

