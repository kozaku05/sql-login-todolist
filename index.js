const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000;
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
const SECRET = "secret_key_ohaigha0@w8outw80jniwaghw@";

// データベース接続
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "todolist",
});
connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});
//ページの表示
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/todolist", (req, res) => {
  res.sendFile(__dirname + "/public/todolist.html");
});
//ユーザー登録
app.post(
  "/register",
  body("email")
    .isEmail()
    .withMessage("メールアドレスを正しく入力してください")
    .isLength({ max: 49 })
    .withMessage("メールアドレスは49文字以内")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 5, max: 99 })
    .withMessage("パスワードを5文字以上99文字以下で入力してください")
    .matches(/[^ぁ-んァ-ン一-龯]/)
    .withMessage("パスワードには日本語は使用できません"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    let sql = "SELECT * FROM users WHERE email = ?";
    connection.query(sql, [email], (err, results) => {
      if (err) {
        return res.status(500).send("sql error");
      }
      if (results.length > 0) {
        return res.status(400).json({ err: "重複するメアド" });
      }
      sql = "INSERT INTO users (email, password) VALUES (?, ?)";
      connection.query(sql, [email, hashedPassword], (err, results) => {
        if (err) {
          return res.status(500).send("sql error");
        }
        const payload = {
          email: email,
          password: password,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        };
        const token = jwt.sign(payload, SECRET);
        res.cookie("user", token, {
          maxAge: 1000 * 60 * 60 * 24 * 7,
          httpOnly: true,
          sameSite: "strict",
          secure: false,
        });
        res.status(200).send("login success");
      });
    });
  }
);
//ログイン(jwtの発行)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("null email or password");
  }
  let sql = "SELECT password FROM users WHERE email = (?)";
  connection.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).send("sql error");
    }
    if (results.length === 0) {
      return res.status(401).send("email not found");
    }
    const hashedPassword = results[0].password;
    if (!bcrypt.compareSync(password, hashedPassword)) {
      return res.status(401).send("password not match");
    }
    const payload = {
      email: email,
      password: password,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };
    const token = jwt.sign(payload, SECRET);
    res.cookie("user", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });
    res.status(200).send("login success");
  });
});
//ログイン
app.get("/jwt", (req, res) => {
  const token = req.cookies.user;
  if (!token) {
    return res.status(401).send("null token");
  }
  try {
    const payload = jwt.verify(token, SECRET);
    const sql = "SELECT * FROM users WHERE email = ?";
    connection.query(sql, [payload.email], (err, results) => {
      if (err) {
        return res.status(500).send("sql error");
      }
      if (results.length === 0) {
        res.clearCookie("user", { httpOnly: true });
        return res.status(401).send("not match");
      }
      res.status(200).json({ user: results });
    });
  } catch (err) {
    res.clearCookie("user", { httpOnly: true });
    return res.status(500).send("jwt error");
  }
});
//ログアウト
app.get("/logout", (req, res) => {
  res.clearCookie("user", { httpOnly: true });
  res.status(200).send("logout success");
});
//todoリストの所得
app.get("/todo", (req, res) => {
  const token = req.cookies.user;
  if (!token) {
    return res.status(401).send("null token");
  }
  const payload = jwt.verify(token, SECRET);
  let sql = "SELECT id FROM users WHERE email = ?";
  connection.query(sql, [payload.email], (err, id) => {
    if (err) {
      return res.status(500).send("sql error");
    }
    id = id[0].id;
    if (!id) {
      res.clearCookie("user", { httpOnly: true });
      return res.status(401).send("not match");
    }
    sql = "SELECT * FROM todos WHERE user_id = ?";
    connection.query(sql, [id], (err, todo) => {
      if (err) {
        return res.status(500).send("sql error");
      }
      res.status(200).json(todo);
    });
  });
});
// todoの追加
app.post("/add", (req, res) => {
  const token = req.cookies.user;
  if (!token) {
    return res.status(401).send("null token");
  }
  if (req.body.value == "") {
    return res.status(400).send("null todo");
  }
  const payload = jwt.verify(token, SECRET);
  let sql = "select id from users where email = ?";
  connection.query(sql, [payload.email], (err, id) => {
    if (err) {
      return res.status(500).send("sql error");
    }
    try {
      id = id[0].id;
    } catch (error) {
      res.clearCookie("user", { httpOnly: true });
      return res.status(401).send("not match");
    }
    sql = "select user_order from todos where user_id = ?";
    connection.query(sql, [id], (err, result) => {
      if (err) {
        return res.status(500).send("sql error");
      }
      const order = result.length + 1;
      const { input } = req.body;
      if (!input) {
        return res.status(400).send("null todo");
      }
      sql = "INSERT INTO todos (user_id, user_order,value) VALUES (?,?,?)";
      connection.query(sql, [id, order, input], (err, result) => {
        if (err) {
          return res.status(500).send("sql error");
        }
        res.status(200).send("success");
      });
    });
  });
});
//todoの削除
app.post("/delete", (req, res) => {
  const token = req.cookies.user;
  if (!token) {
    return res.status(401).send("null token");
  }
  const payload = jwt.verify(token, SECRET);
  let sql = "select id from users where email = ?";
  connection.query(sql, [payload.email], (err, id) => {
    if (err) {
      return res.status(500).send("sql error");
    }
    try {
      id = id[0].id;
    } catch (error) {
      res.clearCookie("user", { httpOnly: true });
      return res.status(401).send("not match");
    }
    const { checkboxId } = req.body;
    sql = "DELETE FROM todos WHERE user_id =? AND user_order =?";
    connection.query(sql, [id, checkboxId], (err, result) => {
      if (err) {
        return res.status(500).send("sql error");
      }
      res.status(200).send("success");
    });
  });
});
//サーバーの起動
app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
