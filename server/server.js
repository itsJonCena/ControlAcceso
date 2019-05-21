const express = require('express');
const mongoose = require('mongoose')
const app = express();
const bodyParser = require('body-parser')
require('./config/config')

/**
 * Middlewares
 */
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(require('./routes/index'))
 /* */


mongoose.connect(process.env.URLDB, {useNewUrlParser: true},(err,res) =>{
    if(err) throw err;

    console.log('Connected to MongoDB ...');
})

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});