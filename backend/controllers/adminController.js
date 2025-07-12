const asyncHandler = require('express-async-handler');
const Item = require('../models/Item');

const getPendingItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ isApproved: false }).sort({ createdAt: -1 });
  res.json(items);
});

const approveItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  item.isApproved = true;
  await item.save();
  res.json({ message: 'Item approved', item });
});

const rejectItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  item.isApproved = false;
  item.isAvailable = false; // Mark as unavailable if rejected
  await item.save();
  res.json({ message: 'Item rejected', item });
});

const removeItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  await item.deleteOne();
  res.status(204).send();
});

module.exports = { getPendingItems, approveItem, rejectItem, removeItem };