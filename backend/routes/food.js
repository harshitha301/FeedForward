const express = require("express");

const db = require("../database");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

// =====================================
// DONATE FOOD
// =====================================

router.post(
  "/donate",
  authenticateToken,
  authorizeRoles("donor"),
  (req, res) => {
    const {
      foodName,
      foodType,
      quantity,
      preparedTime,
      bestBefore,
      location,
      description,
      image
    } = req.body;

    if (
      !foodName ||
      !foodType ||
      !quantity ||
      !location ||
      !bestBefore
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required food details."
      });
    }

    db.run(
      `
      INSERT INTO food_donations
      (
        donor_id,
        food_name,
        food_type,
        quantity,
        prepared_time,
        best_before,
        location,
        description,
        image,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
      `,
      [
        req.user.id,
        foodName,
        foodType,
        Number(quantity),
        preparedTime || "",
        bestBefore,
        location,
        description || "",
        image || ""
      ],
      function (err) {
        if (err) {
          console.error(err);

          return res.status(500).json({
            success: false,
            message: "Failed to create food donation."
          });
        }

        res.status(201).json({
          success: true,
          message: "Food donation created successfully.",
          donationId: this.lastID
        });
      }
    );
  }
);

// =====================================
// GET ALL AVAILABLE FOOD
// =====================================

router.get(
  "/available",
  authenticateToken,
  (req, res) => {
    db.all(
      `
      SELECT
        food_donations.*,
        users.name AS donor_name
      FROM food_donations
      JOIN users
      ON food_donations.donor_id = users.id
      WHERE food_donations.status = 'AVAILABLE'
      ORDER BY food_donations.created_at DESC
      `,
      [],
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch food donations."
          });
        }

        res.json({
          success: true,
          donations: rows
        });
      }
    );
  }
);

// =====================================
// GET MY DONATIONS
// =====================================

router.get(
  "/my-donations",
  authenticateToken,
  authorizeRoles("donor"),
  (req, res) => {
    db.all(
      `
      SELECT *
      FROM food_donations
      WHERE donor_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch your donations."
          });
        }

        res.json({
          success: true,
          donations: rows
        });
      }
    );
  }
);

// =====================================
// GET SINGLE FOOD
// =====================================

router.get(
  "/:id",
  authenticateToken,
  (req, res) => {
    db.get(
      `
      SELECT
        food_donations.*,
        users.name AS donor_name,
        users.phone AS donor_phone
      FROM food_donations
      JOIN users
      ON food_donations.donor_id = users.id
      WHERE food_donations.id = ?
      `,
      [req.params.id],
      (err, food) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error."
          });
        }

        if (!food) {
          return res.status(404).json({
            success: false,
            message: "Food donation not found."
          });
        }

        res.json({
          success: true,
          food
        });
      }
    );
  }
);

module.exports = router;