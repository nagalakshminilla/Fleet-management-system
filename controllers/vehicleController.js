const supabase = require('../config/db');

// Create vehicle (Owner only)
const createVehicle = async (req, res, next) => {
  try {
    const ownerId = req.userId; // Assuming userId is set from auth middleware
    const { name, registration_number, allowed_passengers, rate_per_km } = req.body;
    
    // Check if user is owner
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', ownerId)
      .single();
    
    if (!user || user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can create vehicles'
      });
    }
    
    // Check if registration number already exists
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('registration_number')
      .eq('registration_number', registration_number)
      .single();
    
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Registration number already exists'
      });
    }
    
    // Create vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        name,
        registration_number,
        allowed_passengers,
        rate_per_km,
        owner_id: ownerId,
        is_available: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data
    });
    
  } catch (error) {
    next(error);
  }
};

// Assign driver to vehicle
const assignDriver = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { driverId } = req.body;
    const ownerId = req.userId;
    
    // Check if user is owner
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', ownerId)
      .single();
    
    if (!user || user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can assign drivers'
      });
    }
    
    // Check if vehicle exists and belongs to owner
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('owner_id', ownerId)
      .single();
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or you are not the owner'
      });
    }
    
    // Check if driver exists and has driver role
    const { data: driver } = await supabase
      .from('users')
      .select('role')
      .eq('id', driverId)
      .eq('role', 'driver')
      .single();
    
    if (!driver) {
      return res.status(400).json({
        success: false,
        message: 'Driver not found or user is not a driver'
      });
    }
    
    // Check if driver is already assigned to another vehicle
    const { data: existingAssignment } = await supabase
      .from('vehicles')
      .select('id')
      .eq('driver_id', driverId)
      .neq('id', vehicleId)
      .single();
    
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Driver is already assigned to another vehicle'
      });
    }
    
    // Assign driver to vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .update({ driver_id: driverId })
      .eq('id', vehicleId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Driver assigned successfully',
      data
    });
    
  } catch (error) {
    next(error);
  }
};

// Get vehicle details
const getVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        owner:users!vehicles_owner_id_fkey(name, email),
        driver:users!vehicles_driver_id_fkey(name, email)
      `)
      .eq('id', vehicleId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = { createVehicle, assignDriver, getVehicle };