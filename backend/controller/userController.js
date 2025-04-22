import User from "../models/User.js";
import Service from "../models/Service.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Pet from "../models/Pets.js";
import express from "express";

dotenv.config();

const router = express.Router();

export function registerUser(req, res) {
  try {
    const data = req.body;

    // Validate required fields
    const requiredFields = ['username', 'password', 'full_name', 'email', 'phone_number', 'user_type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Set default profile picture if none provided
    if (!data.profile_picture) {
      data.profile_picture = 'https://via.placeholder.com/150';
    }

    // Hash the password before saving the user
    data.password = bcrypt.hashSync(data.password, 8);

    const newUser = new User(data);

    newUser
      .save()
      .then(() => {
        res.status(200).json({ message: "User created successfully" });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        if (error.code === 11000) { // Duplicate key error
          res.status(400).json({ message: "Email already exists" });
        } else {
          res.status(500).json({ message: "Error creating user", error: error.message });
        }
      });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export function loginUser(req, res) {
  const data = req.body;

  User.findOne({ email: data.email }).then((user) => {
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    } else {
      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });
      }

      const isPasswordValid = bcrypt.compareSync(data.password, user.password);

      if (isPasswordValid) {
        const token = jwt.sign(
          {
            _id: user._id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number,
            user_type: user.user_type,
            profile_picture: user.profile_picture,
            loyalty_points: user.loyalty_points,
            isActive: user.isActive
          },
          process.env.JWT_SECRET,
        );

        res.status(200).json({
          message: "Login successful",
          token: token,
          user: user,
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    }
  });
}

export async function Profile(req, res) {
  //just for testing
  // if (req.user == null) {
  //   res.status(401).json({
  //     message: "Please login and try again"
  //   });
  //   return;
  // }
  // if(req.user.user_type != "admin"){
  //   res.status(403).json({
  //     message : "You are not authorized to perform this action"
  //   })
  //   return
  // }

  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      user_type: user.user_type,
      profile_picture: user.profile_picture,
      loyalty_points: user.loyalty_points
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details" });
  }
}

export const registerPet = async (req, res) => {
  if (req.user == null) {
    return res.status(401).json({
      message: "Please login and try again",
    });
  }

  if (req.user.user_type !== "pet_owner") {
    return res.status(403).json({
      message: "Only pet owners can register pets",
    });
  }

  try {
    const { name, species, breed, age, gender, pet_image } = req.body;

    // Create pet data with owner ID
    const petData = {
      owner_id: req.user._id,
      name,
      species,
      breed,
      age,
      gender,
      pet_image: pet_image || [] // Use provided image URLs or empty array
    };

    const newPet = new Pet(petData);
    await newPet.save();

    res.status(201).json({
      message: "Pet registered successfully",
      pet: newPet,
    });
  } catch (error) {
    console.error("Error registering pet:", error);
    res.status(500).json({
      message: "Error registering pet",
      error: error.message,
    });
  }
};

export const getPets = async (req, res) => {
  if (req.user == null) {
    res.status(401).json({
      message: "Please login and try again",
    });
    return;
  }

  try {
    const pets = await Pet.find({ owner_id: req.user._id });
    res.status(200).json({
      message: "Pets fetched successfully",
      pets: pets,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching pets", 
      error: error.message,
    });
  }
};

export const getLoyaltyPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const possibleDiscount = calculateDiscount(user.loyalty_points);

    res.status(200).json({
      points: user.loyalty_points,
      possibleDiscount: possibleDiscount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching loyalty points",
      error: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  if(req.user.user_type !== "admin"){
    res.status(403).json({
      message: "You are not authorized to perform this action"
    })
    return
  }else{
    const users = await User.find()
    res.status(200).json({
      message: "Users fetched successfully",
      users: users
    })
  }
  
}

export const getAllServices = async (req,res) => {
  if(req.user.user_type !== "admin"){
    res.status(403).json({
      message: "You are not authorized to perform this action"
    })
    return
  }else{
    const services = await Service.find().populate('provider_id', 'username full_name phone_number email')
    res.status(200).json({
      message: "Services fetched successfully",
      services: services
    })
  }
}

export const getAllPets = async (req,res) => {
  if(req.user.user_type!== "admin"){
    res.status(403).json({
      message: "You are not authorized to perform this action"
    })
    return
  }else{
    const pets = await Pet.find().populate('owner_id', 'username full_name phone_number email')
    res.status(200).json({
      message: "Pets fetched successfully",
      pets: pets
    })
  }
}

//delete pet by owner
export const deletePet = async (req, res) => {
  try {
    //check pet own to the user
    const pet = await Pet.findById(req.params.id);
    if (pet.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this pet" });
    }
    await Pet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting pet", error: error.message });
  }
};

export const getServicesForDisplay = async (req, res) => {
  try {
    const services = await Service.find().populate('provider_id', 'username full_name phone_number email')
    res.status(200).json({
      message: "Services fetched successfully",
      services: services
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error: error.message });
  }
}

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider_id', 'username full_name phone_number email')
    res.status(200).json({
      message: "Service fetched successfully",
      service: service
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching service", error: error.message });
  }
}

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if(service.provider_id.toString() !== req.user._id.toString()){
      return res.status(403).json({ message: "You are not authorized to delete this service" });
    }
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error: error.message });
  }
}

export const adminDeleteService = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user_type !== "admin") {
      return res.status(403).json({ message: "Only admins can delete services" });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting service",
      error: error.message 
    });
  }
};

export const adminDeletePet = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user_type !== "admin") {
      return res.status(403).json({ message: "Only admins can delete pets" });
    }
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    await Pet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting pet", error: error.message });
  }
};

//get pet by id
export const getPetById = async (req, res) => {
  const pet = await Pet.findById(req.params.id).populate('owner_id', 'username full_name phone_number email')
  res.status(200).json({
    message: "Pet fetched successfully",
    pet: pet
  })
}

// Update pet information
export const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    // Check if pet exists
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Check if user owns the pet
    if (pet.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this pet" });
    }

    const { name, species, breed, age, gender, pet_image } = req.body;

    // Update pet data
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      {
        name,
        species,
        breed,
        age,
        gender,
        pet_image: pet_image || pet.pet_image // Keep existing images if no new ones provided
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "Pet updated successfully",
      pet: updatedPet
    });
  } catch (error) {
    console.error("Error updating pet:", error);
    res.status(500).json({
      message: "Error updating pet",
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.user_type !== "admin") {
      return res.status(403).json({
        message: "Only admins can update user details"
      });
    }

    const userId = req.params.id;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.user_type; // Prevent changing user type for security
    
    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Error updating user",
      error: error.message
    });
  }
};

export const adminUpdatePet = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user_type !== "admin") {
      return res.status(403).json({
        message: "Only admins can update pet details"
      });
    }

    const petId = req.params.id;
    const updateData = req.body;

    // Find and update the pet
    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('owner_id', 'username full_name email phone_number');

    if (!updatedPet) {
      return res.status(404).json({
        message: "Pet not found"
      });
    }

    res.status(200).json({
      message: "Pet updated successfully",
      pet: updatedPet
    });
  } catch (error) {
    console.error("Error updating pet:", error);
    res.status(500).json({
      message: "Error updating pet",
      error: error.message
    });
  }
};

export const adminUpdateService = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user_type !== "admin") {
      return res.status(403).json({ message: "Only admins can update services" });
    }

    const service = await Service.findById(req.params.id);
    
    // Check if service exists
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Get updated data from request body
    const { 
      service_name, 
      description, 
      service_category,
      packages,
      is_available 
    } = req.body;

    // Update service data
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {
        service_name,
        description,
        service_category,
        packages,
        is_available: is_available !== undefined ? is_available : service.is_available
      },
      { new: true } // Return the updated document
    ).populate('provider_id', 'username full_name phone_number email');

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      message: "Error updating service",
      error: error.message
    });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user_type !== "admin") {
      return res.status(403).json({
        message: "Only admin can deactivate accounts"
      });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: `Account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: user
    });

  } catch (error) {
    console.error("Error in deactivateAccount:", error);
    res.status(500).json({
      message: "Error updating account status",
      error: error.message
    });
  }
};

export default router;
