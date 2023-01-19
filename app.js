const express = require('express');
const app = express();

const request = require("request");

// Json
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//Cors
const cors = require('cors');
app.use(cors())

// Plantillas ejs
app.set('view engine', 'ejs');

const http = require('http');
const server = http.createServer(app);

//Enviroment
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'});

const port = process.env.PORT || 3000;

//Conexion base de datos
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});
connection.connect((error)=>{
    if(error){
        console.log("El error es: " + error);
        return;
    }
    console.log("Conectado");
});

app.get('/', (req, res)=>{
    res.render("index");
});

app.get('/countries', (req, res)=>{
    request("https://restcountries.com/v3.1/all",async (err,response,body)=>{
        if (!err){
            const users = JSON.parse(body);
            const log = await set_log('Consulta de todos los paises');
            res.render("countries",{ 
                users:users
            });
        }
    })
});

app.get('/countries/:name', (req, res)=>{
    request(`https://restcountries.com/v3.1/name/${req.params.name}`,async (err,response,body)=>{
        if (!err){
            const country = JSON.parse(body);
            var description = `Consulta del pais ${req.params.name} `
            if(country.status == 404){
                description += "fallido, el pais no existe"
            }else{
                description += "exitoso"
            }
            const log = await set_log(description);
            res.render("country",{ 
                country:country,
                country_name:req.params.name
            });
        }
    })
});

const set_log = async(description)=>{
    return new Promise((resolve, reject) => {
        connection.query('insert into logs set ?', {
            description: description
        },function (error, results, fields){
            return resolve(results);
        });
    })
}

server.listen(port, function() {
    console.log('App running on *: ' + port);
});



