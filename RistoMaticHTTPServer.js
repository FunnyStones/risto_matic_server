var mysql = require("mysql");
var express = require("express");
var app = express();
const PORT = process.env.PORT || 8080


var serverExpress = app.listen(PORT, function () {
    console.log("********HTTP SERVER STARTED**********");
});

app.get('/test/:num', function (req, res) {
    console.log(req.params.num);
    res.end("OK");
})
var contatore = 0;
app.get('/CheckLogIn/:DATA', function (req, res) {
    //json che viene inviato in response se il codice inserito non viene trovato
    var notFoundJson = {};
    //notFoundJson["Risposta"] = "NO";
    console.log("RICHIESTA ARRIVARTA: " + contatore);
    contatore++;
    //esegue una query e asepetta la risposta in un altro thread
    con.query('SELECT * FROM risto_matic_android.cameriere WHERE password = ' + req.params.DATA, function (err, rows, fields) {
        //se la query non ha dato errori sul database
        if (!err) {
            if (rows.length >= 1)
            {
                //popola il json con il cameriere trovato e lo invia al client
                console.log(rows[0]);
                res.json(rows[0]);
            }
            else
            {
                //invia il json vuoto
                console.log(notFoundJson);
                res.json(notFoundJson);
            }
            console.log("QUERY ANDATA A BUON FINE");
        }
            //se la query ha dato errori sul database
        else {
            console.log("ERRORE:   " + err);
        }
    });
})

app.get('/getTablesInRoom/:sala', function (req, res) {
    var sala = parseInt(req.params.sala);
    
    console.log("GetTablesInRoom: " + sala + "\n");
    var formattedJson = [];
    var tableJson = {};
    con.query('SELECT * FROM risto_matic_android.gettablesinroom WHERE sala = ' + (sala+1) + ';', function (err, rows, fields) {
        if (!err) {
            var previusIdTable = 0;
            var previusDateTime = false;
            var firstTimeInForEach = true;
            var counter = 0;
            rows.forEach(function(element) {
                var currentIdTable = parseInt(element["tavolo_id"], 10);
                if (element["dataOraPrenotazione"] == null)
                {
                    if (previusDateTime && !firstTimeInForEach)
                        formattedJson.push(tableJson);
                    tableJson = {};
                    tableJson["idTable"] = element["tavolo_id"];
                    tableJson["state"] = element["nome_stato"];
                    tableJson["dataOraPrenotazione"] = [];
                    formattedJson.push(tableJson);
                    previusDateTime = false;
                }
                else
                {
                    if (currentIdTable == previusIdTable)
                    {
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    else
                    {
                        if (!firstTimeInForEach)
                        {
                            formattedJson.push(tableJson);
                            
                        }
                        firstTimeInForEach = false;
                        tableJson = {};
                        tableJson["idTable"] = element["tavolo_id"];
                        tableJson["state"] = element["nome_stato"];
                        tableJson["dataOraPrenotazione"] = [];
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    previusDateTime = true;
                }
                previusIdTable = currentIdTable;
                firstTimeInForEach = false;
            });
            res.json(formattedJson);
        }
        else {
            console.log(err);
        }
    });
})
var JsonInGetTablesRooms;
app.get('/GetTablesRooms', function (req, res) {
    var tableJson = {};
    var roomJson = [];
    var formattedJson = [];

    con.query('SELECT * FROM risto_matic_android.gettablesinroom;', function (err, rows, fields) {        
        if (!err) {
            //tutti gli id precedenti sono settati a 0
            var previusIdTable = 0;
            var previusRoom = 0;
            var previusDateTime = false;
            //prima volta nel foreach
            var firstTimeInForEach = true;
            //numero dell'ultima sala
            var lastRoom = rows[rows.length - 1]["sala"];
            //scorre tutti i tavoli
            rows.forEach(function (element) {
                //salva gli id del tavolo corrente
                var currentIdTable = parseInt(element["tavolo_id"], 10);
                var currentRoom = parseInt(element["sala"], 10);

                //se il tavolo corrente si trova in un altra sala inserisce roomJson nel json finale
                if (currentRoom != previusRoom && !firstTimeInForEach) {
                    formattedJson.push(roomJson);
                    roomJson = [];
                }
                
                //se il tavolo non ha prenotazioni 
                if (element["dataOraPrenotazione"] == null) {
                    //se il tavolo prima non ha prenotazioni
                    if (previusDateTime)
                        roomJson.push(tableJson);
                    tableJson = {};
                    tableJson["idTable"] = element["tavolo_id"];
                    tableJson["state"] = element["nome_stato"];
                    tableJson["dataOraPrenotazione"] = [];
                    roomJson.push(tableJson);
                    previusDateTime = false;
                }
                //se il tavolo corrente ha prenotazioni
                else {
                    //se il tavolo corrente
                    if (currentIdTable == previusIdTable) {
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    else {
                        if (!firstTimeInForEach) {
                            roomJson.push(tableJson);
                        }
                        tableJson = {};
                        tableJson["idTable"] = element["tavolo_id"];
                        tableJson["state"] = element["nome_stato"];
                        tableJson["dataOraPrenotazione"] = [];
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    previusDateTime = true;
                }
                previusRoom = currentRoom;
                firstTimeInForEach = false;
                previusIdTable = currentIdTable;
            });
            formattedJson.push(roomJson);

            console.log(formattedJson);
            JsonInGetTablesRooms = formattedJson;
            res.json(formattedJson);
            console.log("QUERY ANDATA A BUON FINE");
        }
        else {
            console.log(err);
        }
    });

    })

app.post('/changeTableState/:parameters', function (req, res) {
    console.log("CHANGE TABLE STATE");
    var data = [];
    var parametersInJson = JSON.parse(req.params.parameters);
    con.query('UPDATE `risto_matic_android`.`tavolo` SET `fk_stato_tavolo_id`=' +/*DA MODIFICARE!!*/ 2 + ' WHERE `tavolo_id`=' + parametersInJson.idTavolo + ';', function (err, rows, fields) {
        //se la query non ha dato errori sul database
        if (!err) {}
        else 
            console.log("ERRORE:   " + err);
        
    });
    res.status(201).json(data);
});

app.get('/getMenu', function (req, res) {
    con.query('SELECT * FROM risto_matic_android.categories;', function (err, rows, fields) {
        //se la query non ha dato errori sul database
        if (!err) {
            console.log(rows);
            rows.forEach((function (element) {
                element["piatti"] = JSON.parse(element["piatti"]);
            }));
            res.status(201).json(rows);
        }
        else
            console.log("ERRORE: " + err);
    });
})

app.get('/getVariants', function (req, res) {
    console.log("getVariants");
    con.query('SELECT * FROM risto_matic_android.variante;', function (err, rows, fields) {
        //se la query non ha dato errori sul database
        if (!err) {
            res.status(201).json(rows);
        }
        else
            console.log("ERRORE: " + err);
    });
})


app.get('/addPiatto/:JsonPiatto', function (req, res) {
    console.log(req.params.JsonPiatto);
    if (IsJsonString(req.params.JsonPiatto))
    {
        var JsonPiatto = JSON.parse(req.params.JsonPiatto);
        con.query('INSERT INTO `mydb`.`piatti` (`idPiatto`, `Nome`,`Descrizione`,`Prezzo`, `Tipo`) VALUES ("' + JsonPiatto["idPiatto"] + '", "' + JsonPiatto["idPiatto"] + '", "' + JsonPiatto["Descrizione"] + '", "' + JsonPiatto["Prezzo"] + '", "' + JsonPiatto["Tipo"] + '")', function (err, rows, fields) {
            if (!err) {
                res.end("OK");
                console.log("QUERY ANDATA A BUON FINE");
            }
            else {
                res.end("Not valid query: " + err);
                console.log("ERRORE:   " + err);
            }
        });
    }
    else
    {
        res.end("Not valid json");
    }
})

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


////////////////////////////////////
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "cisco",
    database: "risto_matic_android"
});
con.connect();