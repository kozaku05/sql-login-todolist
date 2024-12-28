fetch("/jwt", {
  method: "GET",
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
      location.href = "/";
      return;
    }
    return res.json();
  })
  .then((data) => {
    const body = document.querySelector("body");
    body.style.display = "block";
    const email = data.user[0].email;
    document.getElementById("email").textContent = email;
    getTodo();
  });
function getTodo() {
  fetch("/todo", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        location.href = "/";
        return;
      }
      return res.json();
    })
    .then((data) => {
      load(data);
      console.log(data);
    });
}
function load(todo) {
  const ul = document.getElementById("ul");
  ul.innerHTML = "";
  if (todo.length == 0) {
    let h2 = document.createElement("h2");
    h2.textContent = "データがありません";
    document.getElementById("ul").appendChild(h2);
    return;
  }
  todo.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.value;
    ul.appendChild(li);
    let deleteBox = document.createElement("input");
    deleteBox.setAttribute("type", "checkbox");
    deleteBox.setAttribute("class", "deletebox");
    deleteBox.setAttribute("id", item.user_order);
    li.appendChild(deleteBox);
    deleteBox.addEventListener("click", (event) => {
      if (event.target.checked) {
        let checkboxId = event.target.id;
        fetch("/delete", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checkboxId }),
        }).then((res) => {
          if (!res.ok) {
            alert("Error");
            location.href = "/";
            return;
          }
          getTodo();
        });
      }
    });
  });
}
function addTodo() {
  const input = document.getElementById("input").value;
  if (input === "") {
    alert("入力してください");
    return;
  }
  fetch("/add", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  }).then((res) => {
    if (!res.ok) {
      alert("Error");
      location.href = "/";
      return;
    }
    getTodo();
  });
}
function logout() {
  fetch("/logout", {
    method: "GET",
  }).then((res) => {
    location.href = "/";
  });
}
