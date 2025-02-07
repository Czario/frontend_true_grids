const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// cors implementation for cross origin
app.use(cors({
    origin: '*'
}));

app.get("/sec-link1", async (req, res) => {
  const url = "https://www.sec.gov/Archives/edgar/data/1318605/000162828024043486/tsla-20240930.htm";

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "ransom app App/1.0 (your.email@domain.com)",
      },
    });
    console.log("response sending");
    res.send(response.data);
  } catch (error) {
    console.log("error occurred");
    res.status(500).send({ message: "Error Occurred" });
  }
});




const PORT = process.env.PORT || 8100;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});