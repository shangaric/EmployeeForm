import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./App.css";

// Yup Validation Schema
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  employee_id: yup
    .string()
    .max(10, "ID must be at most 10 characters")
    .matches(/^[a-zA-Z0-9]+$/, "ID must be alphanumeric")
    .required("Employee ID is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone is required"),
  department: yup.string().required("Department is required"),
  date_of_joining: yup
    .date()
    .max(new Date(), "Date cannot be in the future")
    .required("Date of Joining is required"),
  role: yup.string().required("Role is required"),
});

function App() {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getEmployees");
      setEmployees(response.data);
      setShowDetails(true);
    } catch (error) {
      alert(`Error fetching employees: ${error.message}`);
    }
  };

  // Add/Update employee
  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        date_of_joining: new Date(data.date_of_joining).toISOString().split("T")[0],
      };

      if (editMode) {
        await axios.put(`http://localhost:5000/updateEmployee/${editEmployeeId}`, formattedData);
        alert("Employee updated successfully!");
      } else {
        await axios.post("http://localhost:5000/addEmployee", formattedData);
        alert("Employee added successfully!");
      }

      reset();
      setShowForm(false);
      setEditMode(false);
      setEditEmployeeId(null);
      fetchEmployees();
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Edit employee function
  const editEmployee = (employee) => {
    setEditMode(true);
    setEditEmployeeId(employee.employee_id);  // Changed to employee.employee_id

    setShowForm(true);

    // Populate form fields
    Object.keys(employee).forEach((key) => {
      if (key === "date_of_joining") {
        setValue(key, new Date(employee[key]).toISOString().split("T")[0]);
      } else {
        setValue(key, employee[key]);
      }
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-heading">Employee Management System</h1>

      {!showForm && (
        <div className="action-buttons">
          <button className="button-add" onClick={() => setShowForm(true)}>Add Employee</button>
          <button className="button-get-details" onClick={() => setShowDetails(!showDetails)}>
           {showDetails ? "Hide Details" : "Get Details"}
          </button>

        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="employee-form">
          <div>
            <label>Name:</label>
            <input type="text" {...register("name")} />
            {errors.name && <small className="error">{errors.name.message}</small>}
          </div>
          <div>
            <label>Employee ID:</label>
            <input type="text" {...register("employee_id")} />
            {errors.employee_id && <small className="error">{errors.employee_id.message}</small>}
          </div>
          <div>
            <label>Email:</label>
            <input type="email" {...register("email")} />
            {errors.email && <small className="error">{errors.email.message}</small>}
          </div>
          <div>
            <label>Phone:</label>
            <input type="text" {...register("phone")} />
            {errors.phone && <small className="error">{errors.phone.message}</small>}
          </div>
          <div>
            <label>Department:</label>
            <select {...register("department")}>
              <option value="">Select Department</option>
              <option value="HR">HR</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
            {errors.department && <small className="error">{errors.department.message}</small>}
          </div>
          <div>
            <label>Date of Joining:</label>
            <input type="date" {...register("date_of_joining")} />
            {errors.date_of_joining && <small className="error">{errors.date_of_joining.message}</small>}
          </div>
          <div>
            <label>Role:</label>
            <input type="text" {...register("role")} />
            {errors.role && <small className="error">{errors.role.message}</small>}
          </div>
          <button type="submit">{editMode ? "Update" : "Submit"}</button>
          <button type="button" onClick={() => reset()}>
            Reset
          </button>
          <button type="button" onClick={() => { setShowForm(false); setEditMode(false); }}>
            Cancel
          </button>
        </form>
      )}

      {showDetails && employees.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Date of Joining</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.employee_id}>  {/* Use employee.employee_id */}
                <td>{employee.name}</td>
                <td>{employee.employee_id}</td>
                <td>{employee.email}</td>
                <td>{employee.phone}</td>
                <td>{employee.department}</td>
                <td>{new Date(employee.date_of_joining).toLocaleDateString()}</td>
                <td>{employee.role}</td>
                <td>
                  <button onClick={() => editEmployee(employee)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
