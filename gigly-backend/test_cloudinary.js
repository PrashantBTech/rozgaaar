const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.argv[2],
  api_key: "672384498936775",
  api_secret: "wgXbdTiX8AjkbT2-5O__S35LWTQ",
});

cloudinary.api.ping()
  .then(() => console.log(`SUCCESS for ${process.argv[2]}`))
  .catch(err => console.log(`FAIL for ${process.argv[2]}:`, err.message));
