(() => {
  const dialog = document.querySelector("#salesPreviewDialog");
  if (!dialog) return;

  const dialogImage = dialog.querySelector("img");
  const dialogTitle = dialog.querySelector("#salesPreviewTitle");
  const closeButton = dialog.querySelector(".preview-dialog-close");

  document.querySelectorAll("[data-preview-image]").forEach((button) => {
    button.addEventListener("click", () => {
      const source = button.dataset.previewImage;
      const title = button.dataset.previewTitle || "Prévia do Raízes Kids";
      dialogImage.src = source;
      dialogImage.alt = title;
      dialogTitle.textContent = title;
      dialog.showModal();
    });
  });

  const closeDialog = () => dialog.close();
  closeButton.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
})();
