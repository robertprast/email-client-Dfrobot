var express = require('express');
var app = express();
var ejs = require('ejs');
var bodyParser = require('body-parser')
const fs = require('fs');
const main_emails = require("./database.js").main_emails
const main_convos = require("./database.js").main_convos
const sku_data = require("./database.js").sku_data
const skus = fs.readFileSync("./skus.txt").toString().replace("\r", "").split("\r\n")

app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


app.get("/", (req, res) => {
    res.render("index", { data: "data passed from main server script" })
})


app.post("/api", async (req, res) => {
    var query = ""
    const action = req.body.action;
    const category = req.body.category;
    const hasDates = req.body.hasDates;
    const findID = req.body.findID;
    const keywords = req.body.keywords;
    // if (keywords) {
    //     console.log(keywords)
    // }
    // else console.log("NO KEYWORDS")
    var tmp = ""
    if (hasDates) {
        var endDate = transformDate(req.body.startDate, "endDate")
        var startDate = transformDate(req.body.startDate, "startDate")
        //var dateQueryWhere = `.where({ 'receivedDateTime': { "$gte": "${startDate}", "$lte": "${endDate}" } })`
    }

    switch (action) {
        case "getConvoThread":
            try {
                quickData = {}
                var count = 0
                main_emails.find({
                    conversationId: req.body.convoID
                }).sort({ "recvdDate": 1 }).exec((err, data) => {
                    // console.log(data)
                    res.send(data)
                    res.end()
                })

            } catch (err) {
                console.log(err)
            }
            break
        case "getConvoBasicData":
            try {
                quickData = {}
                var count = 0

                req.body.convoIDS.forEach((item) => {
                    main_emails.find({
                        conversationId: item
                    }).exec((err, data) => {
                        quickData[item] = data
                        count++;
                        if (count === req.body.convoIDS.length) {
                            res.send(quickData)
                            res.end()
                            return
                        }
                    })

                })
            } catch (err) {
                console.log(err)
            }
            break
        case "getTop10":
            try {
                if (hasDates) {
                    main_convos.find({ "relevantSKUS": { "$in": skus } }, "relevantSKUS id").where({ 'recvdDate': { "$gte": startDate, "$lte": "endDate" } }).exec((err, data) => {
                        res.send(processDataToTop10(data, res))
                        res.end()
                    });
                } else {
                    main_convos.find({ "relevantSKUS": { "$in": skus } }, "relevantSKUS id").exec((err, data) => {
                        res.send(processDataToTop10(data, res))
                        res.end()
                    });
                }
            } catch (err) {
                console.log(err)
                res.send(err)
                res.end()
            }
            return
        case "findEmails":
            const limitVal = 20;
            try {
                if (hasDates && keywords) {
                    var r = buildRegexFutureCheck(keywords)

                    main_emails.find({}).or([{ 'emailContent': { $regex: new RegExp(r, 'i') } }]).limit(limitVal).where({ 'recvdDate': { "$gte": startDate, "$lte": "endDate" } }).exec((err, data) => {
                        res.send(data)
                        res.end()
                    });
                } else {
                    if (hasDates) {
                        main_emails.find({}).where({ 'recvdDate': { "$gte": startDate, "$lte": "endDate" } }).limit(limitVal).exec((err, data) => {
                            res.send(data)
                            res.end()
                        });
                    }
                    else if (keywords) {
                        var r = buildRegexFutureCheck(keywords)
                        main_emails.find({}).or([{ 'emailContent': { $regex: new RegExp(r, 'i') } }]).limit(limitVal).exec((err, data) => {
                            res.send(data)
                            res.end()
                        });
                    }
                    else {
                        main_emails.find({}).limit(limitVal).exec((err, data) => {
                            res.send(data)
                            res.end()
                        });
                    }
                }
            } catch (err) {
                console.log(err)
                res.send(err)
            }
            return
        // console.log(`startDate: ${startDate} endDate: ${endDate}`)
        // let data = `main_emails.find({ 'receivedDateTime': { "$gte": startDate, "$lte": endDate } }).sort({ "receivedDateTime": -1 }).limit(100)`
        // query = `main_emails.find({'dateFormatted': $gte Date('12/05/2019')}).or([{ 'body': new RegExp('DFR0550') }, { 'subject': new RegExp('DFR0550') }])`
        // break
        default:
            return res.send("API ACTION ERROR")
    }
    // if (hasDates) query += dateQueryWhere
    // query += ".limit(10)"
    // console.log(query)
    // return res.send(await dbQuery(query))

})
app.listen(process.env.PORT || 8081, '0.0.0.0', function () {
    console.log('app running');
});


//DB helper functions!
function buildRegexFutureCheck(searchString) {
    try {
        if (searchString) {
            var r = "";
            var sss = searchString.split(" ");
            if (sss.length <= 1) {            // only one word
                r = sss[0];
            } else {
                // result should look like this: (?=.*comp)(?=.*abc)(?=.*300).*
                for (var s in sss) {
                    r += "(?=.*" + sss[s] + ")";
                }
                r += ".*";
            }
        }
        return r
    }
    catch (err) {
        return err
    }
}


function processDataToTop10(data, res) {
    try {
        returnData = {}
        data.forEach(
            (element) => {
                element = element.toJSON()
                element.relevantSKUS.forEach(
                    (sku) => {
                        if (sku in returnData) {
                            returnData[sku].push(element)
                        }
                        else {
                            returnData[sku] = [element]
                        }
                    }
                )
            }
        )


        //SORT ALL RESULTS BY NUMBER OF CONVERSATIONS 
        //Complicated sort
        var items = Object.keys(returnData).map(function (key) {
            return [key, returnData[key].length];
        });
        items.sort(function (first, second) {
            return second[1] - first[1];
        });


        //resest Return data to array to hold each conversation as normal 
        var finalList = []
        for (var i = 0; i < 10; i++) {
            var tmp = {}
            tmp.id = items[i][0]
            var tmpList = []
            returnData[items[i][0]].forEach((item) => {
                tmpList.push(item.id)
            })
            tmp.conversationIDs = tmpList
            tmp.numberOfThreads = tmpList.length
            finalList.push(tmp)

        }
        return finalList
    } catch (err) {
        return err
    }
}

// DATA FORMMATTER
/*
db.main_convos.find({}).forEach((it) => {

    db.main_convos.update({ _id: it._id },
        { $set: {
            "dateFormatted":new Date(it.recvdDate)
            
        } },
        { multi: false, upsert: false }
    )
});


REMOVE A FIELD 

db.getCollection("main_emails").update({}, {
    $unset: {
        "dateFormatted": 1
    }
}, { multi: true }); 
//Copy from NoSQLBooster for MongoDB free edition. This message does not appear if you are using a registered version.

receivedDateTime:2018-06-25T03:38:30Z

*/


//endDateFormat  "YEAR-MONTH-DATE-23:59:59 THAT DAY" Less than that day at midnight
//startDateFormat "YEAR-MONTH-DATE-00:00:00 THAT DAY"
function transformDate(stringDate, startOrEnd) {
    var tmp = new Date(stringDate).toISOString();
    var indexOfT = tmp.indexOf("T")
    if (startOrEnd === "startDate") {
        tmp = tmp.slice(0, indexOfT) + "T00:00:01.000Z"
    }
    else {
        tmp = tmp.slice(0, indexOfT) + "T23:59:59.000Z"
    }
    return tmp;
}

function dbQuery(query) {
    try {
        console.log(query)
        var data = (eval(query))
        // print(data)
        if (!data) {
            return "error in finding"
        } else {
            return data
        }
    } catch (err) {
        console.log(err)
        return 'Unknown server error'
    }

}





