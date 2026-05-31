const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

loginBtn.addEventListener("click", async () => {
  try {
    loginError.classList.add("hidden");
    loginError.textContent = "";

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    console.log("Login with:", username, password);

    const data = await login(username, password);

    console.log("Login response:", data);

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("username", data.user.username);
    localStorage.setItem("user_role", data.user.role);

    if (data.user.role === "manager") {
      window.location.href = "./admin-products.html";
    } else {
      window.location.href = "./products.html";
    }
  } catch (error) {
    console.error("Frontend login error:", error);
    loginError.textContent = "Login failed.";
    loginError.classList.remove("hidden");
  }
});