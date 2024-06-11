const { Storage } = require("@google-cloud/storage");
const path = require("path");
const uuid = require("uuid");

const storage = new Storage({
  keyFilename: path.join(__dirname, "../bucket.json"),
});

const bucketName = "skinifier";
const bucket = storage.bucket(bucketName);

const uploadFileToGCS = async (filePath) => {
  try {
    // Generate UUID for the file
    const newFileName = uuid.v4();
    const ext = path.extname(filePath).toLowerCase();

    let typeFile;
    if (ext === ".jpeg" || ext === ".jpg") {
      typeFile = "image/jpeg";
    } else if (ext === ".png") {
      typeFile = "image/png";
    } else {
      throw new Error("File bukan file gambar (jpeg/png)");
    }

    // Set destination path with new file name and original extension
    const destination = `${newFileName}${ext}`;

    await bucket.upload(filePath, {
      destination: destination,
      resumable: false,
      public: true,
      metadata: {
        contentType: typeFile,
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
    return publicUrl;
  } catch (err) {
    console.error("Error saat mengunggah file:", err);
    throw err;
  }
};

module.exports = uploadFileToGCS;
