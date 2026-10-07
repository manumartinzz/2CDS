(() => {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {scope: "./"});
      await registration.update();
      console.log("AcquaSafe pronto para instalação.");
    } catch (error) {
      console.error("Não foi possível ativar o modo aplicativo:", error);
    }
  });
})();
