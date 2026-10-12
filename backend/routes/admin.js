const express = require("express");

const db = require("../database");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

// =====================================
// ADMIN DASHBOARD STATISTICS
// =====================================

router.get(
  "/stats",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const stats = {};

    db.get(
      "SELECT COUNT(*) AS totalUsers FROM users",
      [],
      (err, users) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Failed to get statistics."
          });
        }

        stats.totalUsers = users.totalUsers;

        db.get(
          "SELECT COUNT(*) AS totalOrganizations FROM organizations",
          [],
          (err, organizations) => {
            stats.totalOrganizations =
              organizations.totalOrganizations;

            db.get(
              "SELECT COUNT(*) AS totalDonations FROM food_donations",
              [],
              (err, donations) => {
                stats.totalDonations =
                  donations.totalDonations;

                db.get(
                  `
                  SELECT COALESCE(SUM(quantity), 0) AS totalMeals
                  FROM food_donations
                  WHERE status IN ('APPROVED', 'PICKED_UP', 'DELIVERED')
                  `,
                  [],
                  (err, meals) => {
                    stats.totalMeals = meals.totalMeals;

                    db.get(
                      `
                      SELECT COUNT(*) AS delivered
                      FROM food_donations
                      WHERE status = 'DELIVERED'
                      `,
                      [],
                      (err, delivered) => {
                        stats.delivered =
                          delivered.delivered;

                        res.json({
                          success: true,
                          stats
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// =====================================
// ALL USERS
// =====================================

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    db.all(
      `
      SELECT
        id,
        name,
        email,
        role,
        phone,
        location,
        created_at
      FROM users
      ORDER BY created_at DESC
      `,
      [],
      (err, users) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch users."
          });
        }

        res.json({
          success: true,
          users
        });
      }
    );
  }
);

// =====================================
// ORGANIZATIONS
// =====================================

router.get(
  "/organizations",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    db.all(
      `
      SELECT *
      FROM organizations
      ORDER BY id DESC
      `,
      [],
      (err, organizations) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch organizations."
          });
        }

        res.json({
          success: true,
          organizations
        });
      }
    );
  }
);

// =====================================
// VERIFY ORGANIZATION
// =====================================

router.put(
  "/organizations/:id/verify",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    db.run(
      `
      UPDATE organizations
      SET verified = 1
      WHERE id = ?
      `,
      [req.params.id],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Failed to verify organization."
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "Organization not found."
          });
        }

        res.json({
          success: true,
          message: "Organization verified successfully."
        });
      }
    );
  }
);

module.exports = router;