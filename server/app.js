//import statement
const express=require('express');
const mysql=require('mysql2');
const cors=require('cors');
const bodyParser=require('body-parser');
const port=5000;
const app=express();

//middleware
app.use(cors());
app.use(bodyParser.json());

//db connection
const db=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'1234',
  database:'EmploymentForm' 
});

db.connect((err)=>{
  if(err){
    console.log("error occured while connecting to the database");
    process.exit();
  }
  else{
    console.log("Connected to the database");
  }
})

//Api Creation

app.post('/addEmployee',(req,res)=>{
  const {name,employee_id,email,phone,department,date_of_joining,role}=req.body;
  
   

  checkQuery=`SELECT * FROM EMPLOYEES WHERE employee_id=? OR email=?`;
  db.query(checkQuery,[employee_id,email],(err,result)=>{
    if(err){
      console.log("Errror occured in email and employee id");
      return res.status(500).json({message:'Error occured in email and employee id'});
    }
   if(result.length>0){
      return res.status(400).send({message:"Already email and employee_id existed"});
   }




   const query=`INSERT INTO employees(name,employee_id,email,phone,department,date_of_joining,role) VALUES(?,?,?,?,?,?,?)`;

   db.query(query,[name,employee_id,email,phone,department,date_of_joining,role],(err)=>{
    if(err){
      console.log("Errror occured while inserting the data");
      return res.status(500).json({message:'Errror occured while inserting the data'});
    }
    console.log("Successfully employee created");
    return res.status(201).json({message:'Successfully employee created'});
   })
   
  })
})

app.get('/getEmployees',(req,res)=>{
  const querys=`SELECT * FROM employees`
  db.query(querys,(err,result)=>{
    if(err){
      console.log("Errror occured while retrieving the data");
      res.status(500).json({message:'Errror occured while retrieving the data'});
    }
    else{
      res.status(200).send(result);
    }
    
  })
  
})


app.listen(port,()=>{
  console.log("Running in 5000");
})