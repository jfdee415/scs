document.addEventListener("DOMContentLoaded", () => {
  const pathname = window.location.pathname;

  // === LANDING PAGE ===
  if (pathname === "/" || pathname === "/index.html") {
    const generateBtn = document.getElementById("generate");

    generateBtn?.addEventListener("click", async () => {
      const handleInput = document.getElementById("handle");
      const handle = handleInput.value.trim().replace(/^@/, "");

      if (!handle) {
        alert("Please enter your Twitter handle.");
        return;
      }

      try {
        const res = await fetch("/generate-forcecard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle })
        });

        const contentType = res.headers.get("content-type");

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error("Expected JSON but got HTML:\n" + text.slice(0, 200));
        }

        const data = await res.json();

        if (data.error) {
          alert("❌ Card generation failed: " + data.error);
          return;
        }

        localStorage.setItem("forceCard", JSON.stringify(data));
        window.location.href = "/result.html";
      } catch (err) {
        console.error("❌ Error generating card:", err);
        alert("There was a problem generating your card:\n" + err.message);
      }
    });
  }
});
