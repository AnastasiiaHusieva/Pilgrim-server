const express = require("express");
const router = express.Router();
const City = require("../models/City.model");

router.get("/", async (req, res) => {
    try {
      const cities = await City.find();
  
      res.status(200).json(cities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

router.post("/", async (req,res) => {
    const { name, position} = req.body;
    try {
      if (!name || !position || !position.lat || !position.lng) {
        return res.status(400).json({ error: "Name, lat, and lng are required" });
      }
  
      const newCity = new City({
        name,
        position: {
          lat: position.lat,
          lng: position.lng,
        },
      });

      await newCity.save();

      res.status(201).json(newCity);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
})


module.exports = router;