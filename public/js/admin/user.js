document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
      MODAL ELEMENTS
  ================================ */
  const modal = document.getElementById("confirmModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  let selectedUserId = null;
  let selectedUserName = null;
  let selectedAction = null; // block or unblock

  /* ===============================
      BLOCK / UNBLOCK MODAL LOGIC
  ================================ */
  document.querySelectorAll(".block-icon").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.preventDefault();

      const row = icon.closest("tr");
      selectedUserName = row.dataset.name;
      selectedUserId = row.dataset.userid; // FIXED
      const status = row.dataset.status;

      const isUnblock = icon.classList.contains("unblock");
      selectedAction = isUnblock ? "unblock" : "block";

      // Modal title + style
      modalTitle.textContent = isUnblock ? "Unblock User" : "Block User";
      modalTitle.className = isUnblock ? "green-title" : "red-title";

      // Message content
      modalMessage.textContent = isUnblock
        ? `Do you want to unblock "${selectedUserName}"?`
        : `Are you sure you want to block "${selectedUserName}"?`;

      modal.style.display = "flex";
    });
  });

  /* ===============================
      MODAL CLOSE
  ================================ */
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  /* ===============================
      CONFIRM (PATCH)
  ================================ */
  confirmBtn.addEventListener("click", async () => {
    if (!selectedUserId || !selectedAction) return;

    console.log(selectedAction);
    console.log(selectedUserId);

    try {
      const res = await axios.patch(
        `/admin/users/${selectedAction}/${selectedUserId}`
      );

      if (res.data.success) {
        console.log(res.data.updatedData.is_blocked);
        if (res.data.updatedData.is_blocked) {
          const statusEl = document.querySelector(
            `[data-id="${selectedUserId}"]`
          );
          statusEl.textContent = "Blocked";
          statusEl.classList.replace("active", "inactive");

          const row = document.querySelector(
            `tr[data-userid="${selectedUserId}"]`
          );
          row.dataset.status = "blocked";
          selectedAction = "unblock";

          const icon = row.querySelector(".block-icon");

          icon.classList.add("unblock");
          icon.classList.replace("fa-ban", "fa-unlock");

          toastr.error(res.data.message,"Status");

        } else {
          const statusEl = document.querySelector(
            `[data-id="${selectedUserId}"]`
          );
          statusEl.textContent = "Active";
          statusEl.classList.replace("inactive", "active");

          const row = document.querySelector(
            `tr[data-userid="${selectedUserId}"]`
          );
          row.dataset.status = "active";
          selectedAction = "block";

          const icon = row.querySelector(".block-icon");

          icon.classList.remove("unblock");
          icon.classList.replace("fa-unlock", "fa-ban");

          toastr.success(res.data.message,"Status");

        }
      } else {
        toastr.error("Something went wrong!","error");
      }
    } catch (err) {
      console.error(err);
      toastr.error("Server error");
    }

    modal.style.display = "none";
  });

  /* ===============================
      CUSTOM DROPDOWN LOGIC
  ================================ */
  const dropdown = document.querySelector(".custom-dropdown");
  const dropdownSelected = dropdown.querySelector(".dropdown-selected");
  const dropdownOptions = dropdown.querySelector(".dropdown-options");
  const dropdownItems = dropdownOptions.querySelectorAll("li");
  const hiddenInput = document.getElementById("statusFilter");

  const userStatusFromServer = window.userStatusFromServer;

  const statusLabels = {
    all: "All Users",
    active: "Active Users",
    blocked: "Blocked Users",
  };

  dropdownSelected.textContent =
    statusLabels[userStatusFromServer] || "All Users";
  hiddenInput.value = userStatusFromServer;

  dropdownSelected.addEventListener("click", () => {
    dropdownOptions.classList.toggle("show-options");
    dropdownSelected.classList.toggle("active");
  });

  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      const value = item.getAttribute("data-value");
      dropdownSelected.textContent = item.textContent;
      hiddenInput.value = value;

      dropdownOptions.classList.remove("show-options");
      dropdownSelected.classList.remove("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdownOptions.classList.remove("show-options");
      dropdownSelected.classList.remove("active");
    }
  });

  /* ===============================
      FILTER CLEAR LOGIC
  ================================ */
  const clearBtn = document.getElementById("clearFilter");
  const searchInput = document.getElementById("filterInput");

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    hiddenInput.value = "all";
    dropdownSelected.textContent = "All Users";
  });
});
