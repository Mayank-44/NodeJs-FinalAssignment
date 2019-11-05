const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: "root",
    password: "root",
    database: "nodeAssignment"
})

function getAllBands(email){
    return new Promise((resolve,reject) => {
        connection.query(`Select * from bands b where b.email='${email}'`,
        function(err,rows,cols){
            if(err){
                reject(err);
            } else{
                resolve(rows);
            }
        })
    })
}

function checkCredentials(email,password){
    return new Promise((resolve,reject) => {
        connection.query(`select * from user u where u.email='${email}' and u.password='${password}'`,
        function(err,rows,cols){
            if(err)
                reject(err);
            else 
                resolve(rows);
        })
    })
}

function addNewBand(bandname,email){
    return new Promise((resolve,reject) => {
        connection.query(`Insert into bands(bandname,email) values (?,?)`,
        [bandname,email],
        function(err,result){
            if(err)
                reject(err);
            else
                resolve();
        })
    })
}

function createCredentials(username,college,dob,email,password){
    return new Promise((resolve,reject) => {
        connection.query(`insert into user(username,password,college,dateofbirth,email) values (?,?,?,?,?)`,
        [username,password,college,dob,email],
        function(err,result){
            if(err)
                reject(err);
            else    
                resolve();
        })
    })
}

function removeBand(bandId){
    return new Promise((resolve,reject) => {
        connection.query(`delete from bands where bandid=?`,
        [bandId],
        function(err,result){
            if(err)
                reject(err);
            else    
                resolve();
        })
    })
}

function updateBand(bandid,bandname){
    return new Promise((resolve,reject) => {
        connection.query(`update bands set bandname=? where bandid=?`,
        [bandname,bandid],
        function(err,result){
            if(err)
                reject(err);
            else    
                resolve();
        })
    })
}

function updateUserPswd(email,password){
    return new Promise((resolve,reject) => {
        connection.query(`update user set password=? where email=?`,
        [password,email],
        function(err,result){
            if(err)
                reject(err);
            else    
                resolve();
        })
    })
}

exports = module.exports = {
    getAllBands,
    addNewBand,
    checkCredentials,
    removeBand,
    updateBand,
    createCredentials,
    updateUserPswd
}