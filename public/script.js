const form = document.getElementById("form");
fetch("/jwt", {
  method: "GET",
  credentials: "include",
}).then((res) => {
  if (res.ok) {
    location.href = "/todolist";
  }
});

function login() {
  form.style.display = "none";
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => {
      if (res.ok) {
        location.href = "/todolist";
        return;
      } else {
        form.style.display = "block";
        return res.text();
      }
    })
    .then((data) => {
      if (data) {
        alert(data);
      }
    })
    .catch(() => {
      form.style.display = "block";
    });
}
function register() {
  form.style.display = "none";
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => {
      if (res.ok) {
        location.href = "/todolist";
        return;
      } else {
        return res.json();
      }
    })
    .then((data) => {
      if (data.err) {
        alert(data.err);
      }
      const errorMessages = data.errors.map((error) => error.msg).join("\n");
      if (errorMessages) {
        alert(errorMessages);
      }
      form.style.display = "block";
      return;
    })
    .catch(() => {
      form.style.display = "block";
    });
}
