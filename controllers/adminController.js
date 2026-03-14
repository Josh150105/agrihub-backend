import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "agrihub_secret";

export const adminLogin = async (req, res) => {

  try {

    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role
      },
      SECRET,
      { expiresIn: "1d" }
    );

    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      success: true,
      token,
      role: admin.role,
      username: admin.username
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
