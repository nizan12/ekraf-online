(function () {
  try {
    var theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
  try {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").catch(function () {});
      });
    }
  } catch (e) {}
})();
