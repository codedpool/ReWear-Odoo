const asyncHandler = require('express-async-handler');
const Joi = require('joi');
const Item = require('../models/Item');
const path = require('path');

const itemSchema = Joi.object({
  title: Joi.string().required().trim().max(100),
  description: Joi.string().required().trim().max(1000),
  category: Joi.string().valid('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories').required(),
  type: Joi.string().required().trim().max(50),
  size: Joi.string().required().trim().max(20),
  condition: Joi.string().valid('new', 'like-new', 'good', 'fair').required(),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10).optional(),
  pointValue: Joi.number().min(0).required(),
  location: Joi.string().trim().max(100).optional()
});

const createItem = asyncHandler(async (req, res) => {
  // Handle tags input: parse JSON string or convert single/multiple form-data tags to array
  let tags = req.body.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags); // Try parsing if it's a JSON string
    } catch (e) {
      tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag); // Fallback to comma-separated string
    }
  } else if (!Array.isArray(tags)) {
    tags = tags ? [tags] : []; // Handle single tag or undefined
  }

  // Ensure tags is an array
  if (!Array.isArray(tags)) {
    res.status(400);
    throw new Error('Tags must be an array or a valid JSON string of tags');
  }

  const { error } = itemSchema.validate({ ...req.body, tags });
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { title, description, category, type, size, condition, pointValue, location } = req.body;

  // Handle image uploads
  const images = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      images.push(`/uploads/${file.filename}`);
    }
  }

  if (images.length === 0) {
    res.status(400);
    throw new Error('At least one image is required');
  }

  const item = await Item.create({
    title,
    description,
    category,
    type,
    size,
    condition,
    tags,
    images,
    uploaderId: req.user._id,
    uploaderName: req.user.name,
    uploaderAvatar: req.user.avatar,
    pointValue,
    location,
    isApproved: false // Require admin approval
  });

  res.status(201).json(item);
});

const getUserItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ uploaderId: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
});

module.exports = { createItem, getUserItems };