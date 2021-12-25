const mysql = require('mysql2');
const inquirer = require('inquirer');

const db = mysql.createConnection({
    user: 'root',
    database: 'business_db'
})



const selectedChoice = (selection) => {
    switch (selection) {
        case 'View all departments':
            db.query('SELECT * FROM departments ORDER BY id ASC', (err, result) => {
                console.table(result);
                init();
            });
            break;
           
        case 'View all roles':
            db.query(`SELECT 
                    r.id, 
                    r.title, 
                    d.department_name, 
                    r.salary 
                    FROM roles r
                    INNER JOIN departments d
                    ON r.department_id = d.id 
                    ORDER BY r.id ASC`, (err, result) => {
                console.table(result);
                init();
            });
            break;
        case 'View all employees':
            db.query(`SELECT 
                    e.id, 
                    e.first_name,
                    e.last_name, 
                    r.title, 
                    d.department_name,
                    r.salary, 
                    CONCAT(m.first_name," ",m.last_name) AS manager 
                    FROM employees m
                    RIGHT JOIN employees e
                    ON m.id = e.manager_id
                    INNER JOIN roles r
                    ON r.id = e.role_id
                    INNER JOIN departments d
                    ON d.id = r.department_id
                    ORDER BY e.id ASC`, (err, result) => {
                console.table(result);
                init();
            });
            
            break;
        case 'Add a department':
            inquirer.prompt([
                {
                    message: "Enter name of the department",
                    name: 'department'
                }
            ])
                .then((response) => {
                    db.query(`INSERT INTO departments (department_name) 
                          VALUES (?)`, [response.department], (err, result) => { })
                          init();
                });
                
            break;
        case 'Add a role':
            
            inquirer.prompt([
                {
                    message: "Role name?",
                    name: 'role'
                },
                {
                    message: "What is the salary amount?",
                    name: 'salary'
                },
                {
                    type: 'list',
                    message: "What department would you like to add the role to?",
                    name: 'departments',
                    choices: [
                        'Sales',
                        'Engineering',
                        'Finance',
                        'Legal'
                    ]
                }
            ])
        
                .then((response) => {
                        
                    db.query(`SELECT id FROM  departments WHERE department_name = ?`, [response.departments], (err, results) =>{
                        
                    db.query(`INSERT INTO roles (title, salary, department_id) VALUES (?,?,?) `, [response.role, response.salary,  results[0].id], (err, result) => { init();})

                });
                    
            })
            
            break;
        case 'Add an employee':
                inquirer.prompt([
                    {
                        message: "Employee first name?",
                        name: 'first'
                    },
                    {
                        message: "Employee last name?",
                        name: 'last'
                    },
                    {   type: 'list',
                        message: "What is employee role?",
                        name: 'role',
                        choices: [
                            'Sales Lead',
                            'Salesperson',
                            'Lead Engineer',
                            'Software Engineer',
                            'Account Manager',
                            'Accountant',
                            'Legal Team Lead',
                            'Lawyer',
                            
                        ]
                    },
                    {
                        type: 'list',
                        message: "Who is employee manager?",
                        name: 'manager',
                        choices: [
                           'Vito Corleone',
                           'Michael Corleone',
                           'Connie Corleone',
                           'Tom Hagen'
                        ]
                    }
                ])
                .then((response) => {
                    db.query(`Select id FROM employees WHERE CONCAT(employees.first_name," ",employees.last_name) = ?`,[response.manager],(err, employee) => {
                      
                    db.query(`SELECT id FROM roles WHERE  title = ?`, [response.role], (err, results) => {
                        
                    db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?) `, [response.first, response.last,  results[0].id, employee[0].id], (err, result) => {
                         init();
                        })
                });
            });
            })
           
            break;
        case 'Update an employee role':
                inquirer.prompt ([
                    {   
                        type: 'list',
                        message: "Which employee role would you like to update?",
                        name: 'employee',
                        choices: [
                            'Vito Corleone',
                            'Sonny Corleone',
                            'Michael Corleone',
                            'Vincent Corleone',
                            'Connie Corleone',
                            'Johnny Fontane',
                            'Tom Hagen',
                            'Petere Clemenza'
                        ]
                    },
                    {
                        type: 'list',
                        message: 'Which role do would you like the assign the selected employee?',
                        name: 'role',
                        choices:  [
                            'Sales Lead',
                            'Salesperson',
                            'Lead Engineer',
                            'Software Engineer',
                            'Account Manager',
                            'Accountant',
                            'Legal Team Lead',
                            'Lawyer',
                        ]
                    }
                ])
                .then ((response) => {
                    db.query(`Select id FROM employees WHERE CONCAT(employees.first_name," ",employees.last_name) = ?`, [response.employee], (err, employee) => {
                        console.log(employee[0].id);
                        db.query(`SELECT id FROM roles WHERE  title = ?`, [response.role], (err, results) => {
                            db.query(`UPDATE employees SET role_id = ? WHERE id = ?`,[results[0].id, employee[0].id], (err, result) =>{
                                init();
                            })
                        })
                    })
                })
               
            break;
        default: return process.exit();

    }
}

const init = () =>{
    inquirer.prompt([
    {
        type: 'list',
        message: 'What would you like to do?',
        name: 'selection',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Quit'
        ]
    }
    ])
    .then((response) => {
        selectedChoice(response.selection);
    })
}

init();