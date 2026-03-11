var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users')

// GET /api/v1/users - Get all users with optional username filter
router.get('/', async function (req, res, next) {
  try {
    let query = { isDeleted: false };
    
    // Filter by username if provided (includes/partial match)
    if (req.query.username) {
      query.username = { $regex: req.query.username, $options: 'i' }; // Case-insensitive
    }
    
    let users = await userModel.find(query).populate('role');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let user = await userModel.findOne({
      isDeleted: false,
      _id: id
    }).populate('role');
    
    if (user) {
      res.json({
        success: true,
        data: user
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/v1/users - Create new user
router.post('/', async function (req, res, next) {
  try {
    let newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName || "",
      avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
      status: req.body.status || false,
      role: req.body.role,
      loginCount: req.body.loginCount || 0
    });
    
    let savedUser = await newUser.save();
    savedUser = await savedUser.populate('role');
    
    res.status(201).json({
      success: true,
      data: savedUser,
      message: "User created successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/v1/users/:id - Update user
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updateData = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.role,
      loginCount: req.body.loginCount
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    let updatedUser = await userModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('role');
    
    if (updatedUser) {
      res.json({
        success: true,
        data: updatedUser,
        message: "User updated successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/v1/users/:id - Soft delete user
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let deletedUser = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    
    if (deletedUser) {
      res.json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/v1/users/enable - Enable user account (set status to true)
router.post('/enable', async function (req, res, next) {
  try {
    let { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: "Email and username are required"
      });
    }
    
    let user = await userModel.findOne({
      email: email,
      username: username,
      isDeleted: false
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with provided email and username"
      });
    }
    
    user.status = true;
    let updatedUser = await user.save();
    updatedUser = await updatedUser.populate('role');
    
    res.json({
      success: true,
      data: updatedUser,
      message: "User account enabled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/v1/users/disable - Disable user account (set status to false)
router.post('/disable', async function (req, res, next) {
  try {
    let { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: "Email and username are required"
      });
    }
    
    let user = await userModel.findOne({
      email: email,
      username: username,
      isDeleted: false
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with provided email and username"
      });
    }
    
    user.status = false;
    let updatedUser = await user.save();
    updatedUser = await updatedUser.populate('role');
    
    res.json({
      success: true,
      data: updatedUser,
      message: "User account disabled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
