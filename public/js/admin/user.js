document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
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

  document.getElementById("usersTableBody").addEventListener("click", (e) => {
    const icon = e.target.closest(".block-icon");
    if (!icon) return;
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

    try {
      const res = await axios.patch(
        `/admin/users/${selectedAction}/${selectedUserId}`,
      );

      if (res.data.success) {
        if (res.data.data.is_blocked) {
          const statusEl = document.querySelector(
            `[data-id="${selectedUserId}"]`,
          );
          statusEl.textContent = "Blocked";
          statusEl.classList.replace("active", "inactive");

          const row = document.querySelector(
            `tr[data-userid="${selectedUserId}"]`,
          );
          row.dataset.status = "blocked";
          selectedAction = "unblock";

          const icon = row.querySelector(".block-icon");

          icon.classList.add("unblock");
          icon.classList.replace("fa-ban", "fa-unlock");

          toastr.error(res.data.message, "Status");
        } else {
          const statusEl = document.querySelector(
            `[data-id="${selectedUserId}"]`,
          );
          statusEl.textContent = "Active";
          statusEl.classList.replace("inactive", "active");

          const row = document.querySelector(
            `tr[data-userid="${selectedUserId}"]`,
          );
          row.dataset.status = "active";
          selectedAction = "block";

          const icon = row.querySelector(".block-icon");

          icon.classList.remove("unblock");
          icon.classList.replace("fa-unlock", "fa-ban");

          toastr.success(res.data.message, "Status");
        }
      } else {
        toastr.error("Something went wrong!", "error");
      }
    } catch (err) {
      const error = err.response?.data;
      console.log(error);
      toastr.error(error?.message || "Something went wrong", "Failed");
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

  const statusLabels = {
    all: "All Users",
    active: "Active Users",
    blocked: "Blocked Users",
  };

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

  const filterInput = document.getElementById("filterInput");
  const clearBtn = document.getElementById("clearFilter");

  clearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    filterInput.value = "";
    hiddenInput.value = "all";
    dropdownSelected.textContent = "All Users";
    loadUsers(1);
  });
});

document.querySelector(".apply-btn").addEventListener("click", (e) => {
  e.preventDefault();
  loadUsers(1);
});

const filterInput = document.getElementById("filterInput");
const statusFilter = document.getElementById("statusFilter");

async function loadUsers(page = 1) {
  const search = filterInput.value.trim();
  const status = statusFilter.value;

  try {
    const res = await axios.get("/admin/users/data", {
      params: {
        page,
        search,
        status,
      },
    });
    renderUsers(res.data.data);
  } catch (err) {
    const error = err.response?.data;
    console.log(error);
    toastr.error(error?.message || "Something went wrong", "Failed");
  }
}

function renderUsers(data) {
  const users = data.users;
  const tbody = document.getElementById("usersTableBody");

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px;">No users found</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users
    .map(
      (user) => `
    <tr data-name="${user.full_name}" 
        data-status="${user.is_blocked ? "blocked" : "active"}"
        data-userid="${user._id}">

      <td class="user-info">
        <img src="${user.avatar}" class="avatar">
        ${user.full_name}
      </td>

      <td>
        <strong>
          <i class="fa-solid fa-envelope"></i>
          ${user.email}<br>
        </strong>
        <i class="fa-solid fa-phone"></i>
        ${user.phone_no || "N/A"}
      </td>

      <td>${user.orderCount}</td>

      <td>₹${Number(user.totalSpent).toFixed(0)}</td>

      <td>${new Date(user.createdAt).toDateString()}</td>

      <td>
        <span class="status ${user.is_blocked ? "inactive" : "active"}" data-id="${user._id}">
          ${user.is_blocked ? "Blocked" : "Active"}
        </span>
      </td>

      <td>
        ${
          user.is_blocked
            ? `<div id="unblock"><i class="fa-solid fa-unlock block-icon unblock"></i></div>`
            : `<div id="block"><i class="fa-solid fa-ban block-icon"></i></div>`
        }
      </td>

    </tr>
  `,
    )
    .join("");

  document.querySelector(".pagination").innerHTML = pagination(data.pagination);
}

function pagination(data) {
  const backward = data.page > 1 ? true : false;
  const forward = data.page < data.totalPages ? true : false;
  return `${
    backward
      ? `<button onclick="loadUsers(${data.page - 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-left"></i>
  </button>`
      : ""
  }

  <span class="current-page-display">
      ${data.page}
  </span>
    ${
      forward
        ? `<button onclick="loadUsers(${data.page + 1})" class="arrow-btn">
      <i class="fa-solid fa-chevron-right"></i>
  </button>`
        : ""
    }`;
}

document.getElementById("filterInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement === e.target) {
    e.preventDefault();
    loadUsers();
  }
});

