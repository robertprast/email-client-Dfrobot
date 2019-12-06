const mongoose = require("mongoose");
const dbPath = "mongoose.connect('mongodb://localhost:27017/emailDB";
mongoose.connect(dbPath, {
    useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", () => {
    console.log("> error occurred from the database");
});
db.once("open", () => {
    console.log("> successfully opened the database");
});

module.exports.main_emails = mongoose.model('main_emails', {});
module.exports.main_convos = mongoose.model('main_convos', {});
module.exports.sku_data = mongoose.model('sku_datas', {});



// // Conversation threads
// const schema = {
//     _id: { type: mongoose.SchemaTypes.String, required: true },
//     numberOfThreads: { type: mongoose.SchemaTypes.Number, required: true },
//     conversationIDS: [{
//         type: String
//     }]
// };


// const collectionName = "emailThreadsBySku"
// const emailThreadsBySkuSchema = mongoose.Schema(schema)
// const emailThreadsBySku = mongoose.model(collectionName, emailThreadsBySkuSchema)





// //Pure emails
// const schema2 = {

//     _id: { type: mongoose.SchemaTypes.ObjectId, required: true },
//     id: String,
//     receivedDateTime: String,
//     subject: String,
//     body: String,
//     from: { type: mongoose.SchemaTypes.Map },
//     conversationId: String,
//     // "_id": ObjectId("5de4b32d99aa0748142ddc56"),
//     // "id": "AAMkADlhNTlhZTNkLTA0ZGUtNDk3Ni1iMTcyLWM1Nzk4OGJjZGYzYgBGAAAAAAAFtWGOmCeMTaGPF4nHZD-VBwCHk1X24hUyT4fuLwyMuz4lAAAAAAEMAACHk1X24hUyT4fuLwyMuz4lAAJJ8gE-AAA=",
//     // "receivedDateTime": "2019-11-18T08:06:46Z",
//     // "subject": "Re: DUST SENSOR",
//     // "body": "Hi; I am talking about the pressure coming from the compressor.I want to see the dust level in the air from the compressor.The sensor will be exposed to compressor pressure. Have good day... Tech Support <techsupport@dfrobot.com>, 18 Kas 2019 Pzt,",
//     // "from": {
//     //     "emailAddress": {
//     //         "name": "Mustafa yorgancı",
//     //         "address": "mustafayorganc@gmail.com"
//     //     }
//     // },
//     // "conversationId": "AAQkADlhNTlhZTNkLTA0ZGUtNDk3Ni1iMTcyLWM1Nzk4OGJjZGYzYgAQAOHWzgJRI71Pu_r0GdnY5ak="
// };

// let allEmailData = mongoose.model('main_emails', schema2);

// module.exports.allEmailData = allEmailData;
// module.exports.emailThreadsBySku = emailThreadsBySku;
