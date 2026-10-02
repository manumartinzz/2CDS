if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => {
        console.log("AcquaSafe pronto para instalação.");
      })
      .catch((error) => {
        console.error("Erro ao registrar o aplicativo:", error);
      });
  });
}
