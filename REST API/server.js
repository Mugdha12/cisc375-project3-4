var fs = require('fs');
var path = require('path');

var express = require('express');
var sqlite3 = require('sqlite3');
var bodyParser = require('body-parser');
var js2xmlparser = require("js2xmlparser");
var cors = require ('cors');
var port = 8000;
var db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

// app.use(cors())
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});


var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.get('/codes', (req, res) => {
    var code = "";
    var reports= {};
    var commaCode = "";
    var arrayofCodes;
    db.all("SELECT * FROM Codes", (err,data) => {
       if(err){
           console.log("Error accessing the tables");
       }else{
           
             if(req.query.hasOwnProperty('codes')){

               
                commaCode = req.query.codes;
                let pos = commaCode.indexOf(",");
                if(pos < 0)
                {
                    arrayofCodes = [commaCode];
                }
                else
                {
                    arrayofCodes = commaCode.split(",");
                }
               
                
                for (let i = 0; i<arrayofCodes.length; i++){
                    for(let j=0; j< data.length; j++)
                    {
                        
                        if(Number(arrayofCodes[i]) === Number(data[j]["code"]))
                        {
                            code = "c" + data[j]["code"];
                            reports[code] = data[j]["incident_type"];
                            break;
                        }
                     }
                }
            }
            else
            {
                for(let i=0; i< data.length; i++)
                {
                 code = "c" + data[i]["code"];
                 reports[code] = data[i]["incident_type"];
                 }
            }
            if(req.query.hasOwnProperty('format')){

                res.writeHead(200,{'Content-Type':'text/xml'});
                res.write(js2xmlparser.parse("Codes", reports));
                //res.end();

            }
            else{
               // res.writeHead(200,{'Content-Type':'text/html'});
                res.write(JSON.stringify(reports, null, ' '));
                
            }
            res.end(); 
                
       }
    });  
});



app.get('/neighborhoods',(req, res) => {
    var neighId = "";
    var reports= {};
    var commaNeighbor;
    var arrayofNeighborhood;
    db.all("SELECT * FROM Neighborhoods", (err,data) => {
    if(err){
        console.log("Error accessing the tables");
    }else{


        if (req.query.hasOwnProperty('id')){
            commaNeighbor = req.query.id;
            let pos = commaNeighbor.indexOf(",");
            if(pos < 0)
            {
                arrayofNeighborhood = [commaNeighbor];
            }
            else
            {
                arrayofNeighborhood = commaNeighbor.split(',');
            }

            for (let i =0; i<arrayofNeighborhood.length; i++){
                for(let j=0; j< data.length; j++){
                    if(Number(arrayofNeighborhood[i]) === Number(data[j]["neighborhood_number"]))
                    {
                        neighId = "N" + data[j]["neighborhood_number"];
                        reports[neighId] = data[j]["neighborhood_name"];
                        break;
                    }

                }
            }

        }
        else
        {
            for(let i=0; i< data.length; i++)
            {
            neighId = "N" + data[i]["neighborhood_number"];
            reports[neighId] = data[i]["neighborhood_name"];
            }
        }

        if(req.query.hasOwnProperty('format')){
            res.writeHead(200,{'Content-Type':'text/xml'});
            res.write(js2xmlparser.parse("Neighborhoods", reports));
            //res.end();
        }
        else {
            res.write(JSON.stringify(reports, null, 4));

        } 
            res.end();
        }
    });  
});

app.get('/incidents',(req, res) => {
    var case_number = "";
    var reports= {};
    var arrayofNeighborhood;
    var arrayofCodes;
    var arrayofGrids;
    var hold;
    var pos;
    db.all("SELECT * FROM Incidents ORDER BY date_time DESC", (err,data) => {
       if(err){
           console.log("Error accessing the tables");
       }else {
           if( req.query.hasOwnProperty('start_date') && req.query.hasOwnProperty('end_date'))
           {
            var commaStartDate = req.query.start_date;
            var commaEndDate = req.query.end_date;
               let loc = 0;
              
                for(let i=0; i< data.length; i++)
                {
                     hold = data[i]["date_time"];
                     pos = hold.indexOf("T");
                    date = hold.substring(0,pos);
                    if(commaStartDate === date)
                    {
                        loc=i;
                    }
                }
                let locEnd = 0;
           
                for(let i=0; i< data.length; i++)
                {
                   hold = data[i]["date_time"];
                    pos = hold.indexOf("T");
                    date = hold.substring(0,pos);
                    if(commaEndDate === date)
                    {
                        locEnd=i;
                        break;
                    }
                }
                
            for (let i = locEnd; i<=loc; i++)
                    {
                            let innerObj = {};
                            case_number = "I" + data[i]["case_number"];
                            hold = data[i]["date_time"];
                            pos = hold.indexOf("T");
                            innerObj["date"] = hold.substring(0,pos);
                            innerObj["time"] = hold.substring(pos+1, hold.length);
                            innerObj["code"] = data[i]["code"];
                            innerObj["incident"] = data[i]["incident"];
                            innerObj["police_grid"] = data[i]["police_grid"];
                            innerObj["neighborhood_number"] = data[i]["neighborhood_number"];
                            innerObj["block"] = data[i]["block"];
                            reports[case_number] = innerObj;
                    }   
            

           }
            else if(req.query.hasOwnProperty('start_date')){
                //console.log("Entered ");
                var commaStartDate = req.query.start_date;
               let loc = 0;
               
              
                    for(let i=0; i< data.length; i++)
                    {
                         hold = data[i]["date_time"];
                        pos = hold.indexOf("T");
                        date = hold.substring(0,pos);
                        
                        if(commaStartDate == date)
                        {
                            loc++;
                        }
                    
                }
                    var startPoint = 0;
                    if(loc-startPoint > 10000)
                    {
                        startPoint = loc-10000;
                    }
                
                   // console.log('start only ' + loc);
                    for (let i = endPoint; i < loc + 1; i++)
                    {
                            let innerObj = {};
                            case_number = "I" + data[i]["case_number"];
                            hold = data[i]["date_time"];
                            pos = hold.indexOf("T");
                            innerObj["date"] = hold.substring(0,pos);
                            innerObj["time"] = hold.substring(pos+1, hold.length);
                            innerObj["code"] = data[i]["code"];
                            innerObj["incident"] = data[i]["incident"];
                            innerObj["police_grid"] = data[i]["police_grid"];
                            innerObj["neighborhood_number"] = data[i]["neighborhood_number"];
                            innerObj["block"] = data[i]["block"];
                            reports[case_number] = innerObj;
                    }     
                     
                }
            else if (req.query.hasOwnProperty('end_date')){
                var commaEndDate = req.query.end_date;
                var pos = commaEndDate.indexOf(",");
               
               let loc = 0;
                
                    for(let i=0; i< data.length; i++)
                    {
                         hold = data[i]["date_time"];
                       pos = hold.indexOf("T");
                        date = hold.substring(0,pos);
                        if(commaEndDate === date)
                        {
                            loc=i;
                            break;
                        }
                    }
                    
                    var endPoint = data.length;
                    if(endPoint-loc > 10000)
                    {
                        endPoint = loc+10000
                    }
                    
                    for (let i = loc; i<endPoint; i++)
                    {
                            let innerObj = {};
                            case_number = "I" + data[i]["case_number"];
                            hold = data[i]["date_time"];
                            pos = hold.indexOf("T");
                            innerObj["date"] = hold.substring(0,pos);
                            innerObj["time"] = hold.substring(pos+1, hold.length);
                            innerObj["code"] = data[i]["code"];
                            innerObj["incident"] = data[i]["incident"];
                            innerObj["police_grid"] = data[i]["police_grid"];
                            innerObj["neighborhood_number"] = data[i]["neighborhood_number"];
                            innerObj["block"] = data[i]["block"];
                            reports[case_number] = innerObj;
                    }       
                }
            if(req.query.hasOwnProperty('codes')){

                var commaCode = req.query.codes;
                let pos = commaCode.indexOf(",");
                if(pos < 0)
                {
                    arrayofCodes = [commaCode];
                }
                else
                {
                    arrayofCodes = commaCode.split(",");
                }
               
                
                for (let j = 0; j<arrayofCodes.length; j++){
                    for(let i=0; i< data.length; i++)
                    {
                        
                        if(Number(arrayofCodes[j]) === Number(data[i]["code"]))
                        {
                            let innerObj = {};
                            case_number = "I" + data[i]["case_number"];
                            let hold = data[i]["date_time"];
                            let pos = hold.indexOf("T");
                            date = hold.substring(0,pos);
                            innerObj["date"] = hold.substring(0,pos);
                            innerObj["time"] = hold.substring(pos+1, hold.length);
                            innerObj["code"] = data[i]["code"];
                            innerObj["incident"] = data[i]["incident"];
                            innerObj["police_grid"] = data[i]["police_grid"];
                            innerObj["neighborhood_number"] = data[i]["neighborhood_number"];
                            innerObj["block"] = data[i]["block"];
                            reports[case_number] = innerObj;
                        }
                     }
                }
            }
            if (req.query.hasOwnProperty('grid')){
                var commaGrid= req.query.grid;
                let pos = commaGrid.indexOf(",");
                if(pos < 0)
                {
                    arrayofGrids = [commaGrid];
                }
                else
                {
                    arrayofGrids = commaGrid.split(",");
                }
               
                
                for (let j = 0; j<arrayofGrids.length; j++){
                    for(let i=0; i< data.length; i++)
                    { 
                        
                        if(Number(arrayofGrids[j]) === Number(data[i]["police_grid"]))
                        {
                            let innerObj = {};
                            case_number = "I" + data[i]["case_number"];
                            let hold = data[i]["date_time"];
                            let pos = hold.indexOf("T");
                            date = hold.substring(0,pos);
                            innerObj["date"] = hold.substring(0,pos);
                            innerObj["time"] = hold.substring(pos+1, hold.length);
                            innerObj["code"] = data[i]["code"];
                            innerObj["incident"] = data[i]["incident"];
                            innerObj["police_grid"] = data[i]["police_grid"];
                            innerObj["neighborhood_number"] = data[i]["neighborhood_number"];
                            innerObj["block"] = data[i]["block"];
                            reports[case_number] = innerObj;
                        }
                     }
                }

            }
            if (req.query.hasOwnProperty('id')){
               var  commaNeighbor = req.query.id;
                let pos = commaNeighbor.indexOf(",");
                if(pos < 0)
                {
                    arrayofNeighborhood = [commaNeighbor];
                }
                else
                {
                    arrayofNeighborhood = commaNeighbor.split(',');
                }
                //console.log(commaNeighbor);
                for (let j =0; j<arrayofNeighborhood.length; j++){
                    for(let i=0; i< data.length; i++){
                        if(Number(arrayofNeighborhood[j]) === Number(data[i]["neighborhood_number"]))
                        {
                            let innerObj = {};
                            case_number = "I" + data[i]["case_number"];
                            let hold = data[i]["date_time"];
                            let pos = hold.indexOf("T");
                            date = hold.substring(0,pos);
                            innerObj["date"] = hold.substring(0,pos);
                            innerObj["time"] = hold.substring(pos+1, hold.length);
                            innerObj["code"] = data[i]["code"];
                            innerObj["incident"] = data[i]["incident"];
                            innerObj["police_grid"] = data[i]["police_grid"];
                            innerObj["neighborhood_number"] = data[i]["neighborhood_number"];
                            innerObj["block"] = data[i]["block"];
                            reports[case_number] = innerObj;
                        }
    
                    }
                }
    
            }

             if(req.query.hasOwnProperty('limit')){
                var thelimit = req.query.limit;
                
                for(let i=0; i< Number(limit); i++){
                            let innerObj = {};
                            case_number = "I" + data[i]["case_number"];
                            let hold = data[i]["date_time"];
                            let pos = hold.indexOf("T");
                            date = hold.substring(0,pos);
                            innerObj["date"] = hold.substring(0,pos);
                            innerObj["time"] = hold.substring(pos+1, hold.length);
                            innerObj["code"] = data[i]["code"];
                            innerObj["incident"] = data[i]["incident"];
                            innerObj["police_grid"] = data[i]["police_grid"];
                            innerObj["neighborhood_number"] = data[i]["neighborhood_number"];
                            innerObj["block"] = data[i]["block"];
                            reports[case_number] = innerObj;
                }
            } 
           if(!req.query.hasOwnProperty('limit') && !req.query.hasOwnProperty('id') && !req.query.hasOwnProperty('grid') && !req.query.hasOwnProperty('codes') && !req.query.hasOwnProperty('end_date') && !req.query.hasOwnProperty('start_date'))
           {
            for(let i=0; i<10000; i++)
            {
                let innerObj = {};
                 case_number = "I" + data[i]["case_number"];
                 let hold = data[i]["date_time"];
                 let pos = hold.indexOf("T"); 
                 date = hold.substring(0,pos);
                 innerObj["date"] = hold.substring(0,pos);
                 innerObj["time"] = hold.substring(pos+1, hold.length);
                 innerObj["code"] = data[i]["code"];
                 innerObj["incident"] = data[i]["incident"];
                 innerObj["police_grid"] = data[i]["police_grid"];
                 innerObj["neighborhood_number"] = data[i]["neighborhood_number"];
                 innerObj["block"] = data[i]["block"];
                 reports[case_number] = innerObj;
            }
           }
            if(req.query.hasOwnProperty('format')){
                res.writeHead(200,{'Content-Type':'text/xml'});
                res.write(js2xmlparser.parse("Incidents", reports));
                //res.end();
            }
            else{
            res.write(JSON.stringify(reports, null, 4));
            }
            res.end();
           
           
       }
    });  
});

app.put('/new-incident', (req,res) =>{
   

    var innerObj = {
        date : req.body.date,
        time : req.body.time,
        code : req.body.code,
        incident : req.body.incident,
        police_grid: req.body.police_grid, 
        neighborhood_number: req.body.neighborhood_number,
        block:req.body.block 
    }

    var incident = {};
    var case_number = "I" + req.body.case_number;
    incident[case_number] = innerObj;
    
    db.all("SELECT * FROM Incidents WHERE case_number=?", [req.body.case_number], (err,data) => {
       //console.log("[["+req.body.case_number+"]]");
        if(err)
        {
            console.log("The value doesn't ")
        }
        else
        { 
            if(data.length == 0)
            {
                db.run("INSERT INTO Incidents (case_number, date_time , code, incident, police_grid, neighborhood_number, block) VALUES (?, ?, ?, ?, ?, ?, ?)", [req.body.case_number, req.body.date_time,req.body.code, req.body.incident, req.body.police_grid,req.body.neighborhood_number,  req.body.block], (err,data)=>{
                    if(err)
                    {
                        console.log("Error entering incident" + err );
                    }
                    else
                    {
                        res.status(200).send('Success!');
                    }
                });
            }
            else
            {
                if(req.body.case_number === data["case_number"])
                {
                    res.status(500).send('Error: incident already exists');
                }
            }
        }
    });
    
});


console.log('Now listening on port ' + port);
app.listen(port);
