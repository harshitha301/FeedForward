
const express = require("express");
const db = require("../database");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth");

const router = express.Router();

// =====================================
// REQUEST FOOD
// =====================================

router.post(
  "/create",
  authenticateToken,
  authorizeRoles("organization"),
  (req, res) => {
    const { foodId, quantity } = req.body;

    if (
      !foodId ||
      quantity === undefined ||
      quantity === null ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid food ID and quantity are required."
      });
    }

    db.get(
      `SELECT * FROM organizations WHERE user_id = ?`,
      [req.user.id],
      (orgErr, organization) => {
        if (orgErr) {
          return res.status(500).json({
            success: false,
            message: "Database error."
          });
        }

        
if (!organization) {
  return res.status(404).json({
    success: false,
    message: "Organization profile not found."
  });
}

// Security: Only admin-verified organizations can request food.
if (Number(organization.verified) !== 1) {
  return res.status(403).json({
    success: false,
    message: "Your organization is not verified by admin yet. Please wait for verification before requesting food."
  });
}
console.log("Organization verification check:", {
  organizationId: organization.id,
  verified: organization.verified
});
        db.get(
          `SELECT * FROM food_donations WHERE id = ?`,
          [foodId],
          (foodErr, food) => {
            if (foodErr) {
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

            if (food.status !== "AVAILABLE") {
              return res.status(400).json({
                success: false,
                message: "This food is no longer available."
              });
            }

            if (Number(quantity) > Number(food.quantity)) {
              return res.status(400).json({
                success: false,
                message: `Only ${food.quantity} meals are available.`
              });
            }

            db.run(
              `
              INSERT INTO food_requests
                (food_id, organization_id, quantity, status)
              VALUES (?, ?, ?, 'REQUESTED')
              `,
              [foodId, organization.id, Number(quantity)],
              function (requestErr) {
                if (requestErr) {
                  return res.status(500).json({
                    success: false,
                    message: "Failed to create request."
                  });
                }

                res.status(201).json({
                  success: true,
                  message: "Food request sent successfully.",
                  requestId: this.lastID
                });
              }
            );
          }
        );
      }
    );
  }
);

// =====================================
// ORGANIZATION REQUESTS
// Includes the original food donation image
// =====================================

router.get(
  "/my-requests",
  authenticateToken,
  authorizeRoles("organization"),
  (req, res) => {
    db.all(
      `
      SELECT
        food_requests.*,
        food_donations.food_name,
        food_donations.location,
        food_donations.best_before,
        food_donations.image AS image
      FROM food_requests
      JOIN organizations
        ON food_requests.organization_id = organizations.id
      JOIN food_donations
        ON food_requests.food_id = food_donations.id
      WHERE organizations.user_id = ?
      ORDER BY food_requests.requested_at DESC
      `,
      [req.user.id],
      (err, rows) => {
        if (err) {
          console.error("My requests query error:", err.message);

          return res.status(500).json({
            success: false,
            message: "Failed to fetch requests."
          });
        }

        res.json({
          success: true,
          requests: rows
        });
      }
    );
  }
);

// =====================================
// DONOR RECEIVED REQUESTS
// =====================================

router.get(
  "/donor-requests",
  authenticateToken,
  authorizeRoles("donor"),
  (req, res) => {
    db.all(
      `
      SELECT
        food_requests.*,
        food_donations.food_name,
        food_donations.image AS image,
        food_donations.quantity AS available_quantity,
        organizations.organization_name,
        organizations.organization_type,
        organizations.address,
        organizations.phone
      FROM food_requests
      JOIN food_donations
        ON food_requests.food_id = food_donations.id
      JOIN organizations
        ON food_requests.organization_id = organizations.id
      WHERE food_donations.donor_id = ?
      ORDER BY food_requests.requested_at DESC
      `,
      [req.user.id],
      (err, rows) => {
        if (err) {
          console.error("Donor requests query error:", err.message);

          return res.status(500).json({
            success: false,
            message: "Failed to fetch donor requests."
          });
        }

        res.json({
          success: true,
          requests: rows
        });
      }
    );
  }
);

// =====================================
// APPROVE REQUEST
// =====================================

router.put(
  "/:id/approve",
  authenticateToken,
  authorizeRoles("donor"),
  (req, res) => {
    const requestId = req.params.id;

    db.get(
      `
      SELECT
        food_requests.*,
        food_donations.donor_id,
        food_donations.quantity AS available_quantity
      FROM food_requests
      JOIN food_donations
        ON food_requests.food_id = food_donations.id
      WHERE food_requests.id = ?
      `,
      [requestId],
      (err, request) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error."
          });
        }

        if (!request) {
          return res.status(404).json({
            success: false,
            message: "Request not found."
          });
        }

        if (Number(request.donor_id) !== Number(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: "You cannot approve this request."
          });
        }

        if (request.status !== "REQUESTED") {
          return res.status(400).json({
            success: false,
            message: "This request has already been processed."
          });
        }

        db.run(
          `
          UPDATE food_requests
          SET status = 'APPROVED'
          WHERE id = ?
          `,
          [requestId],
          function (updateErr) {
            if (updateErr) {
              return res.status(500).json({
                success: false,
                message: "Failed to approve request."
              });
            }

            db.run(
              `
              UPDATE food_donations
              SET status = 'APPROVED'
              WHERE id = ?
              `,
              [request.food_id],
              (foodErr) => {
                if (foodErr) {
                  return res.status(500).json({
                    success: false,
                    message: "Request approved but food status update failed."
                  });
                }

                res.json({
                  success: true,
                  message: "Food request approved successfully."
                });
              }
            );
          }
        );
      }
    );
  }
);

// =====================================
// REJECT REQUEST
// =====================================

router.put(
  "/:id/reject",
  authenticateToken,
  authorizeRoles("donor"),
  (req, res) => {
    const requestId = req.params.id;

    db.get(
      `
      SELECT
        food_requests.*,
        food_donations.donor_id
      FROM food_requests
      JOIN food_donations
        ON food_requests.food_id = food_donations.id
      WHERE food_requests.id = ?
      `,
      [requestId],
      (err, request) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error."
          });
        }

        if (!request) {
          return res.status(404).json({
            success: false,
            message: "Request not found."
          });
        }

        if (Number(request.donor_id) !== Number(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: "You cannot reject this request."
          });
        }

        if (request.status !== "REQUESTED") {
          return res.status(400).json({
            success: false,
            message: "This request has already been processed."
          });
        }

        db.run(
          `
          UPDATE food_requests
          SET status = 'REJECTED'
          WHERE id = ?
          `,
          [requestId],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({
                success: false,
                message: "Failed to reject request."
              });
            }

            res.json({
              success: true,
              message: "Food request rejected."
            });
          }
        );
      }
    );
  }
);

// =====================================
// MARK PICKED UP
// =====================================

router.put(
  "/:id/pickup",
  authenticateToken,
  authorizeRoles("organization"),
  (req, res) => {
    const requestId = req.params.id;

    db.get(
      `
      SELECT
        food_requests.*,
        organizations.user_id
      FROM food_requests
      JOIN organizations
        ON food_requests.organization_id = organizations.id
      WHERE food_requests.id = ?
      `,
      [requestId],
      (err, request) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error."
          });
        }

        if (!request) {
          return res.status(404).json({
            success: false,
            message: "Request not found."
          });
        }

        if (Number(request.user_id) !== Number(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: "You cannot update this request."
          });
        }

        if (request.status !== "APPROVED") {
          return res.status(400).json({
            success: false,
            message: "Only approved requests can be marked as picked up."
          });
        }

        db.run(
          `
          UPDATE food_requests
          SET status = 'PICKED_UP'
          WHERE id = ?
          `,
          [requestId],
          function (updateErr) {
            if (updateErr) {
              return res.status(500).json({
                success: false,
                message: "Failed to update pickup status."
              });
            }

            db.run(
              `
              UPDATE food_donations
              SET status = 'PICKED_UP'
              WHERE id = ?
              `,
              [request.food_id],
              (foodErr) => {
                if (foodErr) {
                  console.error("Food pickup status update error:", foodErr.message);
                }

                res.json({
                  success: true,
                  message: "Food marked as picked up."
                });
              }
            );
          }
        );
      }
    );
  }
);

// =====================================
// MARK DELIVERED
// =====================================

router.put(
  "/:id/delivered",
  authenticateToken,
  authorizeRoles("organization"),
  (req, res) => {
    const requestId = req.params.id;

    db.get(
      `
      SELECT
        food_requests.*,
        organizations.user_id
      FROM food_requests
      JOIN organizations
        ON food_requests.organization_id = organizations.id
      WHERE food_requests.id = ?
      `,
      [requestId],
      (err, request) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error."
          });
        }

        if (!request) {
          return res.status(404).json({
            success: false,
            message: "Request not found."
          });
        }

        if (Number(request.user_id) !== Number(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: "You cannot update this request."
          });
        }

        if (request.status !== "PICKED_UP") {
          return res.status(400).json({
            success: false,
            message: "Only picked-up requests can be marked as delivered."
          });
        }

        db.run(
          `
          UPDATE food_requests
          SET status = 'DELIVERED'
          WHERE id = ?
          `,
          [requestId],
          function (updateErr) {
            if (updateErr) {
              return res.status(500).json({
                success: false,
                message: "Failed to update delivery status."
              });
            }

            db.run(
              `
              UPDATE food_donations
              SET status = 'DELIVERED'
              WHERE id = ?
              `,
              [request.food_id],
              (foodErr) => {
                if (foodErr) {
                  console.error("Food delivery status update error:", foodErr.message);
                }

                res.json({
                  success: true,
                  message: "Food marked as delivered."
                });
              }
            );
          }
        );
      }
    );
  }
);

module.exports = router;
