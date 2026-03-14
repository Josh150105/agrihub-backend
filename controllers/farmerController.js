import Farmer from "../models/Farmer.js";


// 🔥 REGISTER FARMER
export async function registerFarmer(req, res) {
  try {

    const existing = await Farmer.findOne({ phone: req.body.phone });

    if (existing) {
      return res.json({
        success: false,
        message: "Farmer already registered with this phone number"
      });
    }

    const farmer = new Farmer(req.body);

    await farmer.save();

    res.json({
      success: true,
      message: "Farmer Registered Successfully",
      data: farmer
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

export const deleteFarmer = async (req, res) => {
  try {
    await Farmer.findByIdAndDelete(req.params.id);
    res.json({ message: "Farmer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 FARMER LOGIN
export async function farmerLogin(req, res) {

  try {

    const { phone } = req.body;

    const farmer = await Farmer.findOne({ phone });

    if (!farmer) {
      return res.json({
        success: false,
        message: "Farmer not found"
      });
    }

    res.json({
      success: true,
      farmer
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}


// 🔥 GET ALL FARMERS (Admin Use)
export async function getAllFarmers(req, res) {
  try {

    const farmers = await Farmer.find();

    res.json({
      success: true,
      data: farmers
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}


// 🔥 GET SINGLE FARMER BY PHONE
export async function getFarmerByPhone(req, res) {
  try {

    const farmer = await Farmer.findOne({
      phone: req.params.phone
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found"
      });
    }

    res.json({
      success: true,
      data: farmer
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}


// 🔥 UPDATE FARMER PROFILE (CROP + ALERT SETTINGS)
export async function updateAlerts(req, res) {

  try {

    const { phone } = req.params;

    const updateData = {
      crop: req.body.crop,
      alertsEnabled: req.body.alertsEnabled
    };

    const farmer = await Farmer.findOneAndUpdate(
      { phone },
      updateData,
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found"
      });
    }

    res.json({
      success: true,
      message: "Profile Updated Successfully",
      data: farmer
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
