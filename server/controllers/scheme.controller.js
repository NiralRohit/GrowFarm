const Scheme = require('../models/Scheme.model');
const Application = require('../models/Application.model');
const Profile = require('../models/Profile.model');

/**
 * Get all active schemes
 */
exports.getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find({ isActive: true });
        res.status(200).json(schemes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get schemes the current user is eligible for
 */
exports.getEligibleSchemes = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: "Profile not found to determine eligibility." });

        const { district, farmSize, cropsGrown } = profile;

        // Query schemes based on profile
        const eligibleSchemes = await Scheme.find({
            isActive: true,
            $and: [
                { 
                  $or: [
                    { "eligibility.district": "All" }, 
                    { "eligibility.district": district }
                  ] 
                },
                { "eligibility.minFarmSize": { $lte: farmSize || 0 } },
                { "eligibility.maxFarmSize": { $gte: farmSize || 0 } }
            ]
        });

        res.status(200).json(eligibleSchemes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Apply for a scheme
 */
exports.apply = async (req, res) => {
    try {
        const { schemeId, landSurveyNo, documents } = req.body;

        const existing = await Application.findOne({ user: req.user._id, scheme: schemeId });
        if (existing) {
          return res.status(400).json({ message: "You have already applied for this scheme." });
        }

        const application = new Application({
            user: req.user._id,
            scheme: schemeId,
            landSurveyNo,
            documents: documents || []
        });

        await application.save();
        res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get current user applications
 */
exports.getUserApplications = async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id }).populate('scheme', 'title description benefits');
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin: Approve/Reject application
 */
exports.updateStatus = async (req, res) => {
    try {
        const { applicationId, status, remarks } = req.body;
        
        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ message: "Application not found" });

        application.status = status;
        application.adminRemarks = remarks;
        application.updatedOn = Date.now();

        await application.save();
        res.status(200).json({ message: `Application status updated to ${status}`, application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin: Get all applications
 */
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('user', 'fullName phone district') // Note: User model has district, but Profile has more
            .populate('scheme', 'title benefits')
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
/**
 * Admin: Create a new scheme
 */
exports.createScheme = async (req, res) => {
    try {
        const { title, description, eligibility, benefits, documentsRequired, subsidyPercentage, deadline, isActive } = req.body;
        const scheme = new Scheme({
            title, description, eligibility, benefits, documentsRequired, subsidyPercentage, deadline, isActive
        });
        await scheme.save();
        res.status(201).json({ message: "Scheme created successfully", scheme });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin: Update a scheme
 */
exports.updateScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Scheme.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Scheme not found" });
        res.status(200).json({ message: "Scheme updated", scheme: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin: Delete a scheme
 */
exports.deleteScheme = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Scheme.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Scheme not found" });
        // Optionally delete applications associated? Usually keep for record but set to failed.
        await Application.deleteMany({ scheme: id });
        res.status(200).json({ message: "Scheme deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
