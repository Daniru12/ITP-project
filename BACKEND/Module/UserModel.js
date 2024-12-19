const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,//datatype
        require:true//validate
    },
    gmail:{
        type:String,
        require:true//validate
    },
    qty:{
        type:Number,
        require:true//validate
    },
    food:{
        type:String,
        require:true//validate
    }
});

module.exports = mongoose.model(
    "UserModel",//filename
    userSchema//schema
)