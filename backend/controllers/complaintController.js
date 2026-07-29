const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {

    try {

        const complaint = await Complaint.create({
            studentId: req.user.id,
            ...req.body
        });

        res.json({
            success: true,
            data: complaint
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getStudentComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.find({
            studentId: req.params.studentId
        });

        res.json({
            success: true,
            data: complaints
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};