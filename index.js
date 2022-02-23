const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
app.use(express.json())

const customers = [
    { firstName: 'John', age: 27 },
    { firstName: 'James', age: 32 },
    { firstName: 'Robert', age: 45 },
    { firstName: 'Kalyani', age: 21 },
]

app.get('/', (req, resp) => {
    resp.send("Welcome to Customers API")
})

app.get('/customers', (req, resp) => {
    resp.send(customers)
})

app.post('/customers/login', (req, resp) => {
    const user = {
        name: "admin",
        email: "admin@gmail.com"
    };
    const token = jwt.sign({ user }, 'mysecretkey');
    resp.json({
        token: token
    });
})

app.get('/customers/:age', verifyToken, (req, resp) => {
    const customer = customers.find(k => k.age === parseInt(req.params.age))
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            if (!customer) resp.status(404).send("Customer not found")
            resp.send(customer)
        }
    })
})

app.get('/findFirstName/:firstName', verifyToken, (req, resp) => {
    const customername = customers.find(k => k.firstName === (req.params.firstName))
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            if (!customername) resp.status(404).send("Customer not found")
            resp.send(customername)
        }
    })
})

app.post('/customers/addCustomer', verifyToken, (req, resp) => {
    const newCustomer = {
        firstName: req.body.firstName,
        age: req.body.age
    }
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            customers.push(newCustomer)
            resp.send(newCustomer)
        }
    })
})

app.put('/customers/:age', verifyToken, (req, resp) => {
    const customer = customers.find(k => k.age === parseInt(req.params.age))
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            if (!customer) resp.status(404).send("Customer not found")
            else {
                customer.firstName = req.body.firstName
                resp.send(customer)
            }

        }
    })
})

app.delete('/customers/:age', verifyToken, (req, resp) => {
    const customer = customers.find(k => k.age === parseInt(req.params.age))
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            if (!customer) resp.status(404).send("Customer not found")
            else {
                const index = customers.indexOf(customer)
                customers.splice(index, 1)
                resp.send(customer)
            }
        }
    })
})

app.listen(3000);
function verifyToken(req, resp, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader != "undefined") {
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }
    else {
        resp.status(404).send("Wrong Token")
    }
}
