import express from "express";
import { uploadAndAnalyzeAudio, getAudioByScreening } from "../controllers/audioController.js";
import { uploadFile } from "../../services/upload.js";

const router = express.Router();

router.post("/analyze", uploadFile.single("audio"), uploadAndAnalyzeAudio);
router.get("/:id", getAudioByScreening);

export default router;
