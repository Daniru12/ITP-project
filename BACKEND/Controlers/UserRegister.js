const User = require("../Module/Register");

const RegisterUsers = async (req, res, next) => {
    const { name, gmail, password } = req.body;

    let user;

    try{
        user = new User({name, gmail, password});
        await user.save();
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }

    if(!user){
        return res.status(400).send({message:"unable to Register users"});
    }
    return res.status(201).json({user});
}

module.exports = { RegisterUsers };