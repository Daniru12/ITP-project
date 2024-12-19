
const User = require("../Module/Register"); 
    const LoginUsers = async (req, res, next) =>{
    const {gmail, password } = req.body;
  
    try{
      const user = await User.findOne({gmail});
      if(!user){
        return res.json({err:"user Not Founded"})
      }
      if(user.password === password){
        return res.json({status:"ok"});
      }else{
        return res.json({err:"Incorect Password"});
      }
    }catch(err){
      console.error(err);
      res.status(500).json({err:"server err"})
    }
  }

  module.exports = { LoginUsers };