import Advertisement from "../../models/Advertisement/advertise.js";

// Create a new advertisement
export const createAdvertisement = async (req, res) => {
  try {
    const { title, description, category, image_url, start_date, end_date } = req.body;
    const advertiser_id = req.user._id;

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

// Get all advertisements
export const getAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find();
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get approved advertisements
export const getApprovedAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find({ status: "approved" });
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

// Update an advertisement
export const updateAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    if (ad.advertiser_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this advertisement" });
    }

    Object.assign(ad, req.body);
    const updatedAd = await ad.save();
    res.status(200).json(updatedAd);
  } catch (error) {
    console.error("Error updating advertisement:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete an advertisement (✅ Now checks permissions)
export const deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    if (ad.advertiser_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this advertisement" });
    }

    await ad.deleteOne();
    res.status(200).json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve advertisement
export const approveAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
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

// Reject advertisement
export const rejectAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
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
