import PetBook from "../models/PetBook.js";
import Pet from "../models/Pets.js";

// Controller for PetBook operations
const petBookController = {
  // Create a new petbook entry
  createEntry: async (req, res) => {
    try {
      // Check if the pet exists and belongs to the user
      const pet = await Pet.findOne({
        _id: req.body.pet_id,
        owner_id: req.user._id
      });

      if (!pet) {
        return res.status(404).json({ message: "Pet not found or unauthorized" });
      }

      const newEntry = new PetBook({
        pet_id: req.body.pet_id,
        title: req.body.title,
        date: req.body.date || new Date(),
        category: req.body.category,
        description: req.body.description,
        metrics: req.body.metrics || {}
      });

      const savedEntry = await newEntry.save();
      res.status(201).json(savedEntry);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all entries for a specific pet
  getEntriesByPet: async (req, res) => {
    try {
      const { pet_id } = req.params;
      
      // Verify pet ownership
      const pet = await Pet.findOne({
        _id: pet_id,
        owner_id: req.user._id
      });

      if (!pet) {
        return res.status(404).json({ message: "Pet not found or unauthorized" });
      }

      const entries = await PetBook.find({ pet_id })
        .sort({ date: -1 }); // Sort by date descending
      
      res.status(200).json(entries);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update a petbook entry
  updateEntry: async (req, res) => {
    try {
      const { id } = req.params;
      const entry = await PetBook.findById(id);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // Verify pet ownership
      const pet = await Pet.findOne({
        _id: entry.pet_id,
        owner_id: req.user._id
      });

      if (!pet) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedEntry = await PetBook.findByIdAndUpdate(
        id,
        {
          title: req.body.title,
          date: req.body.date,
          category: req.body.category,
          description: req.body.description,
          metrics: req.body.metrics
        },
        { new: true }
      );

      res.status(200).json(updatedEntry);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete a petbook entry
  deleteEntry: async (req, res) => {
    try {
      const { id } = req.params;
      const entry = await PetBook.findById(id);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // Verify pet ownership
      const pet = await Pet.findOne({
        _id: entry.pet_id,
        owner_id: req.user._id
      });

      if (!pet) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await PetBook.findByIdAndDelete(id);
      res.status(200).json({ message: "Entry deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export default petBookController; 