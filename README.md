# sql-login-todolist
テーブル users
```
+----------+--------------+------+-----+---------+----------------+
| Field    | Type         | Null | Key | Default | Extra          |
+----------+--------------+------+-----+---------+----------------+
| id       | int          | NO   | PRI | NULL    | auto_increment |
| email    | varchar(50)  | NO   | UNI | NULL    |                |
| password | varchar(100) | NO   |     | NULL    |                |
+----------+--------------+------+-----+---------+----------------+
```
テーブルtodos
```
+------------+------+------+-----+---------+-------+
| Field      | Type | Null | Key | Default | Extra |
+------------+------+------+-----+---------+-------+
| user_id    | int  | NO   |     | NULL    |       |
| user_order | int  | NO   |     | NULL    |       |
| value      | text | NO   |     | NULL    |       |
+------------+------+------+-----+---------+-------+
```
