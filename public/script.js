document.addEventListener("DOMContentLoaded", () => {
  const pathname = window.location.pathname;

  // === RESULT PAGE ===
  if (pathname === "/result.html") {
    const card = JSON.parse(localStorage.getItem("socialCreditCard"));

    if (!card) {
      alert("Card not found. Please generate your card again.");
      window.location.href = "/"; // Redirect if no card found
    }

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
