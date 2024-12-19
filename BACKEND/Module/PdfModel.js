const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pdfSchema = new Schema({
    pdf:{
        type:String,//datatype
        require:true//validate
    },
    title:{
        type:String,
        require:true//validate
    }
});

module.exports = mongoose.model(
    "PdfDetails",//filename
    pdfSchema//schema
)