const inquirer = require('inquirer');
const { Pool } = require('pg');

// Configure the PostgreSQL client using a connection pool
const pool = new Pool({
    user: 'postgres', // replace with your PostgreSQL username
    host: 'localhost',
    database: 'company',
    password: 'hh121a121', // replace with your PostgreSQL password
});

pool.connect();

const mainMenu = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role',
                'Exit'
            ]
        }
    ]).then((answer) => {
        switch (answer.action) {
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add a Department':
                addDepartment();
                break;
            case 'Add a Role':
                addRole();
                break;
            case 'Add an Employee':
                addEmployee();
                break;
            case 'Update an Employee Role':
                updateEmployeeRole();
                break;
            case 'Exit':
                pool.end();
                break;
        }
    });
};

const viewAllDepartments = () => {
    pool.query('SELECT * FROM department', (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.table(res.rows);
        mainMenu();
    });
};

const viewAllRoles = () => {
    const query = `
        SELECT role.id, role.title, department.name AS department, role.salary
        FROM role
        JOIN department ON role.department_id = department.id
    `;
    pool.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.table(res.rows);
        mainMenu();
    });
};

const viewAllEmployees = () => {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
               manager.first_name AS manager_first_name, manager.last_name AS manager_last_name
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `;
    pool.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        console.table(res.rows);
        mainMenu();
    });
};

