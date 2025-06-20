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

        localStorage.setItem("socialCreditCard", JSON.stringify(data));
        window.location.href = "/result.html"; // Redirect to result page
      } catch (err) {
        console.error("❌ Error generating card:", err);
        alert("There was a problem generating your card:\n" + err.message);
      }
    });
  }

  // === RESULT PAGE ===
  if (pathname === "/result.html") {
    const card = JSON.parse(localStorage.getItem("socialCreditCard"));
    if (!card) return (window.location.href = "/");

    // Log card data for debugging
    console.log("Card data from localStorage:", card);

    // Display all the new social credit elements
    document.getElementById("loyaltyLevel").innerText = `Loyalty Level: ${card.loyaltyLevel}`;
    document.getElementById("socialCreditScore").innerText = `Social Credit: ${card.socialCredit}`;
    document.getElementById("tagline").innerText = `Tagline: ${card.tagline}`;
    document.getElementById("followers").innerText = `Followers: ${card.followers}`;
    document.getElementById("following").innerText = `Following: ${card.following}`;
    document.getElementById("card_name").innerText = `Comrade ${card.handle}`;

    const avatar = document.getElementById("avatar");
    avatar.src = card.avatar || "default-avatar.png"; // Set profile picture (avatar)

    // Show the card
    const cardContainer = document.getElementById("cardContainer");
    cardContainer.classList.remove("hidden");
  }
});
