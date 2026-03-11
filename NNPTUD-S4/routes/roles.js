var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles')
let userModel = require('../schemas/users')

// GET /api/v1/roles - Get all roles
router.get('/', async function (req, res, next) {
  try {
    let roles = await roleModel.find({
      isDeleted: false
    });
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/v1/roles/:id - Get role by ID
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let role = await roleModel.findOne({
      isDeleted: false,
      _id: id
    });
    
    if (role) {
      res.json({
        success: true,
        data: role
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/v1/roles - Create new role
router.post('/', async function (req, res, next) {
  try {
    let newRole = new roleModel({
      name: req.body.name,
      description: req.body.description || ""
    });
    
    let savedRole = await newRole.save();
    
    res.status(201).json({
      success: true,
      data: savedRole,
      message: "Role created successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/v1/roles/:id - Update role
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updateData = {
      name: req.body.name,
      description: req.body.description
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    let updatedRole = await roleModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (updatedRole) {
      res.json({
        success: true,
        data: updatedRole,
        message: "Role updated successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/v1/roles/:id - Soft delete role
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let deletedRole = await roleModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    
    if (deletedRole) {
      res.json({
        success: true,
        message: "Role deleted successfully",
        data: deletedRole
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/v1/roles/:id/users - Get all users with specific role
router.get('/:id/users', async function (req, res, next) {
  try {
    let roleId = req.params.id;
    
    // Check if role exists
    let role = await roleModel.findOne({
      isDeleted: false,
      _id: roleId
    });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }
    
    // Get all users with this role
    let users = await userModel.find({
      role: roleId,
      isDeleted: false
    }).populate('role');
    
    res.json({
      success: true,
      data: users,
      roleInfo: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
