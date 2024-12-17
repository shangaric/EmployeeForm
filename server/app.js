// Import statements
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 5000;
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "EmploymentForm",
});

db.connect((err) => {
  if (err) {
    console.log("Error occurred while connecting to the database:", err.message);
    process.exit();
  } else {
    console.log("Connected to the database");
  }
});

// API to add an employee
app.post("/addEmployee", (req, res) => {
  const { name, employee_id, email, phone, department, date_of_joining, role } = req.body;

  // Check if email or employee ID already exists
  const checkQuery = `SELECT * FROM employees WHERE employee_id = ? OR email = ?`;
  db.query(checkQuery, [employee_id, email], (err, result) => {
    if (err) {
      console.log("Error occurred while checking email or employee_id");
      return res.status(500).json({ message: "Internal server error" });
    }
    if (result.length > 0) {
      return res.status(400).json({ message: "Email or employee_id already exists" });
    }

    // Insert into database
    const query = `INSERT INTO employees(name, employee_id, email, phone, department, date_of_joining, role) VALUES(?,?,?,?,?,?,?)`;
    db.query(query, [name, employee_id, email, phone, department, date_of_joining, role], (err) => {
      if (err) {
        console.log("Error occurred while inserting data:", err.message);
        return res.status(500).json({ message: "Failed to insert data" });
      }
      console.log("Employee successfully added");
      return res.status(201).json({ message: "Employee successfully created" });
    });
  });
});

// API to get all employees
app.get("/getEmployees", (req, res) => {
  const query = `SELECT * FROM employees`;
  db.query(query, (err, result) => {
    if (err) {
      console.log("Error occurred while retrieving data:", err.message);
      return res.status(500).json({ message: "Failed to retrieve data" });
    }
    res.status(200).json(result);
  });
});

// API to update an employee
app.put("/updateEmployee/:id", (req, res) => {
  console.log("Updating employee with ID:", req.params.id);  // Log the ID
  const { name, email, phone, department, date_of_joining, role } = req.body;
  console.log("Request Body:", req.body);  // Log the body
  
  const query = `UPDATE employees SET name = ?, email = ?, phone = ?, department = ?, date_of_joining = ?, role = ? WHERE employee_id = ?`;
  
  db.query(
      query,
      [name, email, phone, department, date_of_joining, role, req.params.id],
      (err, result) => {
          if (err) {
              console.log("Error occurred:", err.message);
              return res.status(500).json({ message: "Failed to update employee" });
          }
          if (result.affectedRows === 0) {
              return res.status(404).json({ message: "Employee not found" });
          }
          console.log("Employee successfully updated");
          return res.status(200).json({ message: "Employee successfully updated" });
      }
  );
});

// API to delete an employee
app.delete("/deleteEmployee/:id", (req, res) => {
  const { employee_id } = req.params;

  // Log the employee_id for debugging
  console.log("Deleting employee with ID:", employee_id);

  const query = `DELETE FROM employees WHERE employee_id = ?`;
  db.query(query, [employee_id], (err, result) => {
    if (err) {
      console.log("Error occurred while deleting data:", err.message);
      return res.status(500).json({ message: "Failed to delete employee" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Employee successfully deleted");
    return res.status(200).json({ message: "Employee successfully deleted" });
  });
});

// Server listening on port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
