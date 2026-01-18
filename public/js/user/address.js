async function loadAddresses() {
  const res = await axios.get("/user/address/data");
  document.querySelector(".address-list").innerHTML = res.data.data.addresses
    .map(renderAddress)
    .join("");
}

function renderAddress(address) {
  return `
    <div class="address-card" data-id="${address._id}">
    <div class="address-info">
    <h4>${address.address_type}</h4>
    
    <p>${address.full_name}</p>
    
    <p>${address.address_line}</p>

        <p>${address.city}, ${address.zip_code}</p>

        <p>${address.phone_no}</p>
        
        <p>${address.country}</p>
        </div>
        
        <div class="edit-delete">
        <button
        onclick="openEditAddressModal(this)"
        data-address="${encodeURIComponent(JSON.stringify(address))}"
        class="edit-link"
        >
        <i class="fa-solid fa-pen-to-square"></i>
        </button>
        
        ${
          address.is_default
            ? `<p class="default-txt">Default</p>`
            : `<button class="delete-link" data-id="${address._id}">
            <i class="fa-solid fa-trash"></i>
            </button>`
        }
        </div>
        </div>
        `;
}
loadAddresses();
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
      is_default: form.is_default.checked,
    };

    try {
      const res = await axios.post("/user/address", formData);

      if (res.data.success) {
        toastr.success(res.data.message, "Success");
        closeAddAddressModal();
        await loadAddresses();
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

document.querySelector(".address-list").addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".delete-link");

  if (!deleteBtn) return;

  const id = deleteBtn.dataset.id;

  const addressCard = deleteBtn.closest(".address-card");

  try {
    const res = await axios.delete(`/user/address`, {
      data: {
        id,
      },
    });

    if (res.data.success) {
      addressCard.remove();
      toastr.success(res.data.message, "Removed!!");
    }
  } catch (err) {
    const error = res.response?.data;

    toastr.error(error.message, "Error!!");
  }
});

function closeEditAddressModal() {
  document.getElementById("editAddressModal").style.display = "none";
}

function openEditAddressModal(btn) {
  //   const address = JSON.parse(btn.dataset.address);
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

    try {
      const res = await axios.patch(
        `/user/address/edit/${addressId}`,
        formData
      );
      if (res.data.success) {
        toastr.success(res.data.message, "Success");
        btn.innerHTML = "Update Address";
        btn.disabled = false;
        closeEditAddressModal();
        loadAddresses();
      }
    } catch (err) {
      const error = err.response?.data;

      toastr.error(error?.message, "Error!!");

      btn.innerHTML = "Update Address";
      btn.disabled = false;
    }
  });
