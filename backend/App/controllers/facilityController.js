import HealthcareFacility from "../models/HealthcareFacility.js";

export async function createFacility(req, res) {
  try {
    const facility = await HealthcareFacility.create(req.body);
    return res.status(201).json({ success: true, data: facility });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllFacilities(req, res) {
  try {
    const { district, state, hasChestXray, hasPulmonologist } = req.query;
    const filter = { isActive: true };

    if (district) filter["address.district"] = new RegExp(district, "i");
    if (state) filter["address.state"] = new RegExp(state, "i");
    if (hasChestXray === "true") filter["facilitiesAvailable.hasChestXray"] = true;
    if (hasPulmonologist === "true") filter["facilitiesAvailable.hasPulmonologist"] = true;

    let facilities = await HealthcareFacility.find(filter).sort({ name: 1 });

    // If no facilities found in database yet, seed with official default district health centers
    if (facilities.length === 0) {
      const defaultFacilities = [
        {
          name: "District Tuberculosis & Chest Diseases Hospital",
          facilityType: "DISTRICT_HOSPITAL",
          address: { line: "Hospital Road", district: "Jaipur", state: "Rajasthan", pincode: "302001" },
          location: { type: "Point", coordinates: [75.8267, 26.9124] },
          contactPhone: "+91 141 2560000",
          nodalOfficerName: "Dr. R. K. Sharma (Nodal Officer Pneumoconiosis)",
          facilitiesAvailable: { hasChestXray: true, hasHRCT: true, hasFullPFTLab: true, hasPulmonologist: true, hasSilicosisBoard: true, hasEmergencyBeds: true },
        },
        {
          name: "Jodhpur Desert Occupational Health Research Institute & Clinic",
          facilityType: "OCCUPATIONAL_HEALTH_INSTITUTE",
          address: { line: "AIIMS Road, Basni", district: "Jodhpur", state: "Rajasthan", pincode: "342005" },
          location: { type: "Point", coordinates: [73.0243, 26.2389] },
          contactPhone: "+91 291 2740741",
          nodalOfficerName: "Dr. S. Meena (Pulmonology Board)",
          facilitiesAvailable: { hasChestXray: true, hasHRCT: true, hasFullPFTLab: true, hasPulmonologist: true, hasSilicosisBoard: true, hasEmergencyBeds: true },
        },
        {
          name: "Community Health Centre & Silicosis Screening Unit",
          facilityType: "COMMUNITY_HEALTH_CENTRE",
          address: { line: "Near Mining Belt", district: "Karauli", state: "Rajasthan", pincode: "322241" },
          location: { type: "Point", coordinates: [77.025, 26.495] },
          contactPhone: "+91 7464 220011",
          nodalOfficerName: "Dr. A. Verma (Medical Officer)",
          facilitiesAvailable: { hasChestXray: true, hasHRCT: false, hasFullPFTLab: true, hasPulmonologist: false, hasSilicosisBoard: false, hasEmergencyBeds: true },
        },
        {
          name: "District General Hospital & Respiratory Care Unit",
          facilityType: "DISTRICT_HOSPITAL",
          address: { line: "Station Road", district: "Dhanbad", state: "Jharkhand", pincode: "826001" },
          location: { type: "Point", coordinates: [86.4304, 23.7957] },
          contactPhone: "+91 326 2202020",
          nodalOfficerName: "Dr. P. Mukherjee (Chest Specialist)",
          facilitiesAvailable: { hasChestXray: true, hasHRCT: true, hasFullPFTLab: true, hasPulmonologist: true, hasSilicosisBoard: true, hasEmergencyBeds: true },
        },
      ];
      facilities = await HealthcareFacility.insertMany(defaultFacilities);
    }

    return res.json({ success: true, data: facilities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getNearestFacilities(req, res) {
  try {
    const { lat, lng, district, maxDistanceKm = 100 } = req.query;

    if (lat && lng) {
      try {
        const facilities = await HealthcareFacility.find({
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
              $maxDistance: maxDistanceKm * 1000,
            },
          },
          isActive: true,
        }).limit(5);

        if (facilities.length > 0) {
          return res.json({ success: true, data: facilities });
        }
      } catch (geoErr) {
        // Fallback to district matching
      }
    }

    const fallbackFilter = district ? { "address.district": new RegExp(district, "i") } : {};
    const facilities = await HealthcareFacility.find(fallbackFilter).limit(5);
    return res.json({ success: true, data: facilities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
