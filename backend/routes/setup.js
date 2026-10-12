
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database");

const router = express.Router();

router.post("/create-admin", async (req, res) => {
  try {
    const setupKey = process.env.ADMIN_SETUP_KEY;

    if (!setupKey || req.headers["x-admin-setup-key"] !== setupKey) {
      return res.status(403).json({
        success: false,
        message: "Setup access denied"
      });
    }

    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.includes("@") ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a name, valid email, and password of at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    db.get(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail],
      async (err, existingUser) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database lookup failed"
          });
        }

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "This email already exists. No account was changed."
          });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          db.run(
            `INSERT INTO users (name, email, password, role, phone, location)
             VALUES (?, ?, ?, 'admin', '', '')`,
            [name.trim(), normalizedEmail, hashedPassword],
            function (insertErr) {
              if (insertErr) {
                return res.status(500).json({
                  success: false,
                  message: "Admin account creation failed"
                });
              }

              return res.status(201).json({
                success: true,
                message: "Admin account created successfully",
                email: normalizedEmail
              });
            }
          );
        } catch {
          return res.status(500).json({
            success: false,
            message: "Password processing failed"
          });
        }
      }
    );
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unexpected setup error"
    });
  }
});

module.exports = router;
