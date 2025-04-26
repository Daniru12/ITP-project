import Advertisement from "../../models/Advertisement/advertise.js";

// Create a new advertisement
export const createAdvertisement = async (req, res) => {
  try {
    const { title, description, category, image_url, start_date, end_date } = req.body;
    const advertiser_id = req.user._id; // Assuming user is authenticated

    const newAd = new Advertisement({
      title,
      description,
      advertiser_id,
      category,
      image_url,
      start_date,
      end_date,
    });

    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get all advertisements
export const getAdvertisements = async (req, res) => {
  try {
    
    const ads = await Advertisement.find();
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApprovedAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find({ status: 'approved' }); // Fetch only approved ads
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single advertisement by ID
export const getAdvertisementById = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update an advertisement
export const updateAdvertisement = async (req, res) => {
  try {
    // Find the advertisement by its ID
    const ad = await Advertisement.findById(req.params.id);
    
    // If the advertisement doesn't exist, return a 404 error
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    console.log("Logged-in user ID:", req.user._id);
    console.log("Advertisement owner ID:", ad.advertiser_id);

    // Check if the logged-in user is the advertiser or an admin
    if (ad.advertiser_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      // If not, return a 403 (Forbidden) error
      return res.status(403).json({ message: "Not authorized to update this advertisement" });
    }

    // If authorized, update the advertisement with the new data
    Object.assign(ad, req.body);

    // Save the updated advertisement to the database
    const updatedAd = await ad.save();

    // Return the updated advertisement as a response
    res.status(200).json(updatedAd);
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error updating advertisement:", error);
    res.status(500).json({ message: error.message });
  }
};



// @desc Delete an advertisement
export const deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    await ad.deleteOne();
    res.status(200).json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Approve an advertisement
export const approveAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reject an advertisement
export const rejectAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};