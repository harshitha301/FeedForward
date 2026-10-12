const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../database");

const router = express.Router();

const JWT_SECRET = "feedforward_secret_key_2026";

// =========================
// SIGNUP
// =========================

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      location,
      organizationName,
      organizationType,
      address,
      requiredMeals
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required."
      });
    }

    const allowedRoles = ["donor", "organization"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role."
      });
    }

    // Check existing user
    db.get(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, existingUser) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error."
          });
        }

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already registered."
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        db.run(
          `
          INSERT INTO users
          (name, email, password, role, phone, location)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            name,
            email,
            hashedPassword,
            role,
            phone || "",
            location || ""
          ],
          function (insertErr) {
            if (insertErr) {
              return res.status(500).json({
                success: false,
                message: "Unable to create user."
              });
            }

            const userId = this.lastID;

            // If organization, create organization profile
            if (role === "organization") {
              db.run(
                `
                INSERT INTO organizations
                (
                  user_id,
                  organization_name,
                  organization_type,
                  address,
                  phone,
                  required_meals
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                  userId,
                  organizationName || name,
                  organizationType || "NGO",
                  address || location || "",
                  phone || "",
                  Number(requiredMeals) || 0
                ],
                (orgErr) => {
                  if (orgErr) {
                    return res.status(500).json({
                      success: false,
                      message: "User created but organization profile failed."
                    });
                  }

                  return res.status(201).json({
                    success: true,
                    message: "Organization registered successfully."
                  });
                }
              );
            } else {
              return res.status(201).json({
                success: true,
                message: "User registered successfully."
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

// =========================
// LOGIN
// =========================

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required."
    });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error."
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password."
        });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password."
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role
        },
        JWT_SECRET,
        {
          expiresIn: "1d"
        }
      );

      res.json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location
        }
      });
    }
  );
});

module.exports = router;