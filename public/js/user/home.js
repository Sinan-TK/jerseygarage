document.querySelectorAll(".product-item").forEach(item => {
  item.addEventListener("click", () => {
    console.log(item.dataset.id);
    
  });
});
