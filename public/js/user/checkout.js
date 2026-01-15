// Toggle active radio cards
document.querySelectorAll(".radio-card").forEach(card => {
  card.addEventListener("click", () => {
    const name = card.querySelector("input").name;
    document.querySelectorAll(`input[name="${name}"]`)
      .forEach(i => i.closest(".radio-card").classList.remove("active"));
    card.classList.add("active");
    card.querySelector("input").checked = true;
  });
});
