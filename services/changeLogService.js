// services/changeLogService.js
const ChangeLog = require('../models/ChangeLog');

async function logChange(placeId, action, previousData = {}, newData = {}) {
  const changes = {};
  const allKeys = new Set([...Object.keys(previousData), ...Object.keys(newData)]);

  allKeys.forEach((key) => {
    const prevVal = previousData[key];
    const newVal = newData[key];
    if (JSON.stringify(prevVal) !== JSON.stringify(newVal)) {
      changes[key] = { from: prevVal, to: newVal };
    }
  });

  return ChangeLog.create({
    placeId,
    action,
    previousData,
    newData,
    changes,
  });
}

async function getAllHistory(limit = 50) {
  return ChangeLog.find().sort({ timestamp: -1 }).limit(limit);
}

async function getHistoryByPlace(placeId) {
  return ChangeLog.find({ placeId }).sort({ timestamp: -1 });
}

module.exports = {
  logChange,
  getAllHistory,
  getHistoryByPlace,
};