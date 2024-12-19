const User = require("../Module/UserModel");

// Controller to get all users
const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find(); // Fetch all users
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!users ) {
    return res.status(404).json({ message: "No users found" });
  }

  return res.status(200).json({ users });
};


//data insert
const addUsers = async (req, res, next) => {
    const {name,gmail,qty,food}=req.body;

    let user;

    try{
        user = new User({name,gmail,qty,food});
        await user.save();
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }

    if(!user){
        return res.status(400).send({message:"unable to add users"});
    }
    return res.status(201).json({user});
}

//get by id
const getById = async (req, res, next)=>{
    const id = req.params.id;

    let user;

    try{
        user = await User.findById(id);
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }

    if(!user){
        return res.status(401).send({message:"unable users"});
    }
    return res.status(202).json({user});
}

//update user Details
const updateUser = async (req, res, next)=>{
    const id = req.params.id;
    const {name,gmail,qty,food}=req.body;

    let user;

    try{
        user = await User.findByIdAndUpdate(id,
          {name: name, gmail: gmail, qty: qty, food: food});
          await user.save();
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }

    if(!user){
      return res.status(401).send({message:"unable to update user details"});
  }
  return res.status(202).json({user});
}

//delete user details
const deleteUser = async (req, res, next)=>{
      const id = req.params.id;

      let user;

      try{
        user = await User.findByIdAndDelete(id)   ;
      }catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      if(!user){
        return res.status(401).send({message:"unable to Delete user details"});
      }
      return res.status(202).json({user});

}

module.exports = { getAllUsers,addUsers, getById,updateUser,deleteUser };

