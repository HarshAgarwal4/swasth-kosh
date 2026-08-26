import Worker from "../models/Worker.js";
import Mine from "../models/Mine.js";
import Screening from "../models/Screening.js";
import Referral from "../models/Referral.js";
import RiskAssessment from "../models/RiskAssessment.js";

export async function getDashboardOverview(req, res) {
  try {
    const totalWorkers = await Worker.countDocuments();
    const totalMines = await Mine.countDocuments({ isActive: true });
    const totalScreenings = await Screening.countDocuments();
    const totalReferrals = await Referral.countDocuments();

    // Risk distribution
    const highRiskWorkers = await Worker.countDocuments({ currentRiskLevel: "HIGH" });
    const moderateRiskWorkers = await Worker.countDocuments({ currentRiskLevel: "MODERATE" });
    const lowRiskWorkers = await Worker.countDocuments({ currentRiskLevel: "LOW" });
    const pendingRiskWorkers = await Worker.countDocuments({ currentRiskLevel: "PENDING_ASSESSMENT" });

    // Referrals status
    const pendingReferrals = await Referral.countDocuments({ status: "PENDING" });
    const completedReferrals = await Referral.countDocuments({ status: "COMPLETED" });

    // Monthly screenings trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyScreenings = await Screening.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // District-wise breakdown
    const districtRiskStats = await Worker.aggregate([
      {
        $group: {
          _id: "$location.district",
          total: { $sum: 1 },
          highRisk: {
            $sum: { $cond: [{ $eq: ["$currentRiskLevel", "HIGH"] }, 1, 0] },
          },
          moderateRisk: {
            $sum: { $cond: [{ $eq: ["$currentRiskLevel", "MODERATE"] }, 1, 0] },
          },
          lowRisk: {
            $sum: { $cond: [{ $eq: ["$currentRiskLevel", "LOW"] }, 1, 0] },
          },
        },
      },
      { $sort: { highRisk: -1 } },
      { $limit: 10 },
    ]);

    // Mine-wise risk summary
    const mineRiskStats = await Worker.aggregate([
      {
        $group: {
          _id: "$mineId",
          totalWorkers: { $sum: 1 },
          highRisk: {
            $sum: { $cond: [{ $eq: ["$currentRiskLevel", "HIGH"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "mines",
          localField: "_id",
          foreignField: "_id",
          as: "mine",
        },
      },
      { $unwind: "$mine" },
      {
        $project: {
          mineName: "$mine.name",
          organization: "$mine.organization",
          district: "$mine.location.district",
          totalWorkers: 1,
          highRisk: 1,
        },
      },
      { $sort: { highRisk: -1 } },
      { $limit: 8 },
    ]);

    return res.json({
      success: true,
      data: {
        summary: {
          totalWorkers,
          totalMines,
          totalScreenings,
          totalReferrals,
          highRiskWorkers,
          moderateRiskWorkers,
          lowRiskWorkers,
          pendingRiskWorkers,
          pendingReferrals,
          completedReferrals,
        },
        riskDistribution: [
          { name: "High Risk", value: highRiskWorkers, color: "#EF4444" },
          { name: "Moderate Risk", value: moderateRiskWorkers, color: "#F59E0B" },
          { name: "Low Risk", value: lowRiskWorkers, color: "#10B981" },
          { name: "Pending", value: pendingRiskWorkers, color: "#6B7280" },
        ],
        monthlyScreenings,
        districtRiskStats,
        mineRiskStats,
      },
    });
  } catch (error) {
    console.error("getDashboardOverview error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
