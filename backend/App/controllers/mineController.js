import Mine from "../models/Mine.js";
import Worker from "../models/Worker.js";
import Screening from "../models/Screening.js";

export async function createMine(req, res) {
  try {
    const { name, organization, mineralType, location, safetyOfficer, dustControlMeasures } = req.body;

    if (!name || !organization || !location?.district || !location?.state) {
      return res.status(400).json({ success: false, message: "Name, organization, district, and state are required" });
    }

    const mineCode = req.body.mineCode || `MINE-${Date.now().toString().slice(-6)}`;

    const mine = await Mine.create({
      name,
      organization,
      mineCode,
      mineralType: mineralType || "STONE_CRUSHING",
      location,
      safetyOfficer,
      dustControlMeasures,
      createdBy: req.user?._id,
    });

    return res.status(201).json({ success: true, data: mine });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllMines(req, res) {
  try {
    const { district, state, mineralType } = req.query;
    const filter = { isActive: true };

    if (district) filter["location.district"] = new RegExp(district, "i");
    if (state) filter["location.state"] = new RegExp(state, "i");
    if (mineralType) filter.mineralType = mineralType;

    const mines = await Mine.find(filter).sort({ name: 1 });
    return res.json({ success: true, data: mines });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMineById(req, res) {
  try {
    const { id } = req.params;
    const mine = await Mine.findById(id);
    if (!mine) return res.status(404).json({ success: false, message: "Mine not found" });

    // Summary statistics for mine
    const workers = await Worker.find({ mineId: id });
    const workerCount = workers.length;
    const highRiskCount = workers.filter((w) => w.currentRiskLevel === "HIGH").length;
    const moderateRiskCount = workers.filter((w) => w.currentRiskLevel === "MODERATE").length;
    const lowRiskCount = workers.filter((w) => w.currentRiskLevel === "LOW").length;

    return res.json({
      success: true,
      data: {
        mine,
        statistics: {
          totalWorkers: workerCount,
          highRisk: highRiskCount,
          moderateRisk: moderateRiskCount,
          lowRisk: lowRiskCount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateMine(req, res) {
  try {
    const { id } = req.params;
    const updated = await Mine.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
