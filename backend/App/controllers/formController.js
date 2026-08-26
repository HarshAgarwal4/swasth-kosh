import ApprovalForm from "../models/ApprovalForm.js";

/**
 * Get active form for a specific role
 */
export async function getFormByRole(req, res) {
  try {
    const { role } = req.params;
    const form = await ApprovalForm.findOne({ role, isActive: true });
    if (!form) {
      return res.status(404).json({ success: false, message: `No active form configured for role ${role}` });
    }
    return res.json({ success: true, data: form });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: List all dynamic forms
 */
export async function listAllForms(req, res) {
  try {
    const forms = await ApprovalForm.find().populate("createdBy", "name email").sort({ updatedAt: -1 });
    return res.json({ success: true, data: forms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: Create or update dynamic form
 */
export async function saveForm(req, res) {
  try {
    const { role, title, description, fields, isActive } = req.body;
    if (!role || !title || !fields) {
      return res.status(400).json({ success: false, message: "role, title, and fields are required" });
    }

    let form = await ApprovalForm.findOne({ role });
    if (form) {
      form.title = title;
      form.description = description;
      form.fields = fields;
      if (isActive !== undefined) form.isActive = isActive;
      await form.save();
    } else {
      form = await ApprovalForm.create({
        role,
        title,
        description,
        fields,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user._id,
      });
    }

    return res.status(200).json({ success: true, message: `Approval form for ${role} saved successfully`, data: form });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: Delete form
 */
export async function deleteForm(req, res) {
  try {
    const { id } = req.params;
    await ApprovalForm.findByIdAndDelete(id);
    return res.json({ success: true, message: "Form removed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
