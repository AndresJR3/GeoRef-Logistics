const mongoose = require('mongoose');

const ChangeLogSchema = new mongoose.Schema({
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE'],
        required: true
    },
    changes: {
        type: Object,
        default: {}
    },
    previousData: {
        type: Object,
        default: {}
    },
    newData: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

ChangeLogSchema.index({ placeId: 1, timestamp: -1 });
ChangeLogSchema.index({ action: 1 });

module.exports = mongoose.model('ChangeLog', ChangeLogSchema);