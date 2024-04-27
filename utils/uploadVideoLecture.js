const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

require("../helpers/cloudinary");

module.exports = uploadVideoLecture = (file) => {
  if (!file) {
    return Promise.reject("No file provided");
  }

  return new Promise((resolve, reject) => {
    // Create a Cloudinary upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "videos-lectures" },
      (error, result) => {
        if (error) {
          console.error("Error uploading video lecture:", error);
          reject("Failed to upload video lecture");
        } else {
          console.log("Video lecture uploaded successfully");
          resolve(result.secure_url);
        }
      }
    );

    // Create a stream from file buffer
    const fileStream = streamifier.createReadStream(file.buffer);

    // Pipe the file stream to Cloudinary uploader
    fileStream.pipe(uploadStream);
  });
};
