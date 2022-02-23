const express = require('express')
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient
const app = express()
app.use(express.json())
var database

app.get('/', (req, resp) => {
    resp.send("Welcome to mongodb API")
})

app.get('/products', (req, resp) => {
    database.collection('products').find({}).toArray((err, result) => {
        if (err) throw error
        resp.send(result)
    })
})

app.post('/products/login', (req, resp) => {
    const user = {
        name: "admin",
        email: "admin@gmail.com"
    };
    const token = jwt.sign({ user }, 'mysecretkey');
    resp.json({
        token: token
    });
})

app.get('/products/:id', verifyToken, (req, resp) => {
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            database.collection('products').find({ id: parseInt(req.params.id) }).toArray((err, result) => {
                if (err) throw err
                resp.send(result)
            })
        }
    })
})

app.post('/products/addProduct', verifyToken, (req, resp) => {
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            let res = database.collection('products').find({}).sort({ id: -1 }).limit(1)
            res.forEach(obj => {
                if (obj) {
                    let product = {
                        id: obj.id + 1,
                        name: req.body.product,
                        price: req.body.price

                    }
                    database.collection('products').insertOne(product, (err, result) => {
                        if (err) resp.status(500).send(err)
                        resp.send("Added Successfully")
                    })
                }
            })
        }
    })
})
app.put('/products/:id', verifyToken, (req, resp) => {
    let query = { id: parseInt(req.params.id) }
    let product = {
        id: parseInt(req.params.id),
        name: req.body.name
    }
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            let dataset = { $set: product }
            database.collection('products').updateOne(
                query,
                dataset, (err, result) => {
                    if (err) throw err
                    resp.send(product)
                })
        }
    })
})

app.delete('/products/:id', verifyToken, (req, resp) => {
    jwt.verify(req.token, 'mysecretkey', (err) => {
        if (err) {
            resp.status(404).send("Unauthorized Access")
        }
        else {
            database.collection('products').deleteOne({ id: parseInt(req.params.id) }, (err, result) => {
                if (err) throw err
                resp.send('Product is deleted')
            })
        }
    })
})

app.listen(8080, () => {
    MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (error, result) => {
        if (error) throw error
        database = result.db('mydatabase')
        console.log("CONEECTION SUCCESSFUL!!")
    })
})
function verifyToken(req, resp, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader != "undefined") {
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }
    else {
        resp.status(404).send("Unauthorized Access")
    }
}
