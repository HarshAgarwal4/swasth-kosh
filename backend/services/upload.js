import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage: 50MB limit for audio recordings, X-rays, and medical documents
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow all medical audio formats, images, DICOM, and PDF documents
  const allowedMimeTypes = [
    // Audio
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/webm",
    "audio/ogg",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "audio/aac",
    "audio/flac",
    "video/webm",
    "video/ogg",
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/dicom",
    "application/dicom",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("audio/") || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    // Permissive fallback for custom medical extensions
    cb(null, true);
  }
};

const uploadFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter,
});

/**
 * Uploads any file buffer (audio, image, document) to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @param {object} options - optional custom folder or resource_type
 */
async function uploadFileToCloud(fileBuffer, originalName, options = {}) {
  return new Promise((resolve, reject) => {
    // Detect resource_type if audio/video/document
    const lowerName = (originalName || "").toLowerCase();
    let resourceType = options.resource_type || "auto";

    if (lowerName.endsWith(".pdf") || lowerName.endsWith(".doc") || lowerName.endsWith(".docx")) {
      resourceType = "raw";
    } else if (
      lowerName.endsWith(".wav") ||
      lowerName.endsWith(".mp3") ||
      lowerName.endsWith(".ogg") ||
      lowerName.endsWith(".webm") ||
      lowerName.endsWith(".m4a") ||
      lowerName.endsWith(".aac")
    ) {
      resourceType = "video"; // Cloudinary uses 'video' resource_type for audio files
    }

    const cleanName = (originalName || "file")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.[^/.]+$/, "");

    const uploadOptions = {
      folder: options.folder || "SwasthaKosh/Medical",
      resource_type: resourceType,
      public_id: `${Date.now()}-${cleanName}`,
      overwrite: true,
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error("Cloudinary upload failed:", error);
        return reject(error);
      }
      console.log(`Uploaded ${resourceType} to Cloudinary:`, result.secure_url);
      resolve(result);
    });

    stream.end(fileBuffer);
  });
}

/**
 * Uploads respiratory audio specifically
 */
async function uploadAudioToCloud(fileBuffer, originalName = "lung_sound.wav") {
  return uploadFileToCloud(fileBuffer, originalName, {
    folder: "SwasthaKosh/RespiratoryAudio",
    resource_type: "video",
  });
}

/**
 * Uploads X-ray or medical image
 */
async function uploadImageToCloud(fileBuffer, originalName = "chest_xray.png") {
  return uploadFileToCloud(fileBuffer, originalName, {
    folder: "SwasthaKosh/ChestXray",
    resource_type: "image",
  });
}

/**
 * Delete a file from Cloudinary by public ID
 */
async function deleteImageByPublicId(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Deleted successfully:", result);
    return result;
  } catch (error) {
    console.error("Failed to delete file from Cloudinary:", error);
    throw error;
  }
}

/**
 * Delete a file from Cloudinary by its full secure URL
 */
async function deleteImageByUrl(fileUrl, resourceType = "auto") {
  try {
    if (!fileUrl) throw new Error("File URL is required");

    let match = fileUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (!match || !match[1]) throw new Error("Invalid Cloudinary URL format");

    let publicId = match[1];
    let detectedType = resourceType;

    if (resourceType === "auto") {
      if (fileUrl.includes("/video/upload/")) detectedType = "video";
      else if (fileUrl.includes("/raw/upload/")) detectedType = "raw";
      else detectedType = "image";
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: detectedType,
    });

    return result;
  } catch (error) {
    console.error("Error deleting Cloudinary file:", error);
    throw error;
  }
}

export {
  uploadFile,
  uploadFileToCloud,
  uploadAudioToCloud,
  uploadImageToCloud,
  deleteImageByPublicId,
  deleteImageByUrl,
};

