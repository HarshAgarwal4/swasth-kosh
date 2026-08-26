import { queryAiChat, queryRAG, generateClinicalSummary, checkAiHealth } from "../../services/aiService.js";

export async function chatWithAi(req, res) {
  try {
    const { message, history, mode, language } = req.body;
    const userRole = req.user?.role || "WORKER";

    const payload = {
      message,
      history: history || [],
      mode: mode || (userRole === "DOCTOR" || userRole === "MEDICAL_OFFICER" ? "DOCTOR" : "WORKER"),
      language: language || "en",
      userContext: {
        role: userRole,
        name: req.user?.name,
      },
    };

    const aiResponse = await queryAiChat(payload);
    return res.json({ success: true, data: aiResponse?.data || aiResponse });
  } catch (error) {
    console.error("chatWithAi error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function askRagKnowledge(req, res) {
  try {
    const { query, language } = req.body;
    const response = await queryRAG({ query, language: language || "en" });
    return res.json({ success: true, data: response?.data || response });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAiHealth(req, res) {
  try {
    const health = await checkAiHealth();
    return res.json({ success: true, data: health });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
