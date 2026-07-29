const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    title: String,

    category: String,

    description: String,

    status: {
        type: String,
        default: "pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);