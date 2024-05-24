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

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the department name:'
        }
    ]).then((answer) => {
        pool.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Department added successfully.');
            mainMenu();
        });
    });
};

const addRole = () => {
    pool.query('SELECT * FROM department', (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        const departments = res.rows.map(department => ({ name: department.name, value: department.id }));
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the role title:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the role salary:'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department:',
                choices: departments
            }
        ]).then((answer) => {
            pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answer.title, answer.salary, answer.department_id], (err, res) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Role added successfully.');
                mainMenu();
            });
        });
    });
};

const addEmployee = () => {
    pool.query('SELECT * FROM role', (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        const roles = res.rows.map(role => ({ name: role.title, value: role.id }));
        pool.query('SELECT * FROM employee', (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            const managers = res.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
            managers.push({ name: 'None', value: null });
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'Enter the employee first name:'
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'Enter the employee last name:'
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'Select the role:',
                    choices: roles
                },
                {
                    type: 'list',
                    name: 'manager_id',
                    message: 'Select the manager:',
                    choices: managers
                }
            ]).then((answer) => {
                pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answer.first_name, answer.last_name, answer.role_id, answer.manager_id], (err, res) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('Employee added successfully.');
                    mainMenu();
                });
            });
        });
    });
};

const updateEmployeeRole = () => {
    pool.query('SELECT * FROM employee', (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
        const employees = res.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
        pool.query('SELECT * FROM role', (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            const roles = res.rows.map(role => ({ name: role.title, value: role.id }));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Select the employee:',
                    choices: employees
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'Select the new role:',
                    choices: roles
                }
            ]).then((answer) => {
                pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answer.role_id, answer.employee_id], (err, res) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('Employee role updated successfully.');
                    mainMenu();
                });
            });
        });
    });
};

// Start the application
mainMenu();
