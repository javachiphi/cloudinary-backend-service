require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.post('/upload', (req, res) => {
    // Extract the uploaded file from the request
    let sampleFile = req.files.file;
  
    // Specify the path to save the file on the server
    const uploadPath = path.join(__dirname, 'uploads', sampleFile.name);
  
    // Save the file to the server
    sampleFile.mv(uploadPath, async (err) => {
      if (err) {
          console.error('Error saving the file:', err);
          return res.status(500).json({ err: 'Failed to save the file.' });
      }
  
      // Once the file is saved, proceed with uploading it to Cloudinary
      try {

          const uploadedResponse = await cloudinary.uploader.upload(uploadPath, {
            resource_type: "video"
          });
          // Optionally delete the file from the server (you can comment this out if you don't want to delete it)
          fs.unlink(uploadPath, (err) => {
              if (err) console.error('Error deleting the file:', err);
          });
          res.json({ url: uploadedResponse.url });
      } catch (cloudinaryError) {
          console.error('Error uploading to Cloudinary:', cloudinaryError);
          res.status(500).json({ err: 'Failed to upload to Cloudinary.' });
      }
    });
  });
  

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
