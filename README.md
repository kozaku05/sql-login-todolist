# sql-login-todolist
テーブル users
```
CREATE TABLE users(
    id int auto_increment primary key,
    email varchar(50) unique,
    password varchar(100) not null
);

```
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
create table todos(
    user_id int not null,
    user_order int not null,
    value text not null
    );
```
```
+------------+------+------+-----+---------+-------+
| Field      | Type | Null | Key | Default | Extra |
+------------+------+------+-----+---------+-------+
| user_id    | int  | NO   |     | NULL    |       |
| user_order | int  | NO   |     | NULL    |       |
| value      | text | NO   |     | NULL    |       |
+------------+------+------+-----+---------+-------+
```
