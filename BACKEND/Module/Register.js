const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const regiSchema = new Schema({
    name:{
        type:String,//datatype
        require:true//validate
    },
    gmail:{
        type:String,
        require:true//validate
    },
    password:{
        type:String,
        require:true//validate
    }
});

module.exports = mongoose.model(
    "register",//filename
    regiSchema//schema
)