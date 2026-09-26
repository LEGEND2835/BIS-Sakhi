const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/helmet", async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        p.name AS product,
        s.standard_number,
        s.title,
        s.status,
        l.lab_name,
        l.lab_code
      FROM products p
      JOIN product_standards ps
        ON p.id = ps.product_id
      JOIN standards s
        ON s.id = ps.standard_id
      LEFT JOIN lab_scopes ls
        ON ls.standard_id = s.id
      LEFT JOIN labs l
        ON l.id = ls.lab_id
      WHERE p.name = 'Motorcycle Helmet'
      ORDER BY l.lab_name;
    `);

    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: "No compliance data found."
      });
    }

    res.json({
      status: "success",
      product: rows[0].product,
      standard: {
        number: rows[0].standard_number,
        title: rows[0].title,
        status: rows[0].status
      },
      laboratories: rows
        .filter(row => row.lab_name)
        .map(row => ({
          name: row.lab_name,
          code: row.lab_code
        })),
      warning: "IS 4151:1993 is withdrawn. Use the current IS 4151:2015 record."
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;