const supabase = require('../config/db');

// Create trip (Customer only)
const createTrip = async (req, res, next) => {
  try {
    const customerId = req.userId;
    const { vehicle_id, start_date, location, distance_km, passengers } = req.body;
    
    // Check if user is customer
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', customerId)
      .single();
    
    if (!user || user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can create trips'
      });
    }
    
    // Check if vehicle exists and is available
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicle_id)
      .eq('is_available', true)
      .single();
    
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle not found or not available'
      });
    }
    
    // Check passenger limit
    if (passengers > vehicle.allowed_passengers) {
      return res.status(400).json({
        success: false,
        message: `Passengers exceed vehicle limit. Maximum allowed: ${vehicle.allowed_passengers}`
      });
    }
    
    // Start transaction-like operations
    // 1. Create trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert([{
        customer_id: customerId,
        vehicle_id,
        start_date: new Date(start_date).toISOString(),
        location,
        distance_km,
        passengers,
        trip_cost: 0,
        is_completed: false
      }])
      .select()
      .single();
    
    if (tripError) throw tripError;
    
    // 2. Update vehicle availability
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({ is_available: false })
      .eq('id', vehicle_id);
    
    if (vehicleError) throw vehicleError;
    
    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip
    });
    
  } catch (error) {
    next(error);
  }
};

// Get trip details
const getTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const userId = req.userId;
    
    const { data: trip, error } = await supabase
      .from('trips')
      .select(`
        *,
        customer:users!trips_customer_id_fkey(name, email),
        vehicle:vehicles!trips_vehicle_id_fkey(
          name,
          registration_number,
          owner:users!vehicles_owner_id_fkey(name, email)
        )
      `)
      .eq('id', tripId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }
      throw error;
    }
    
    // Check if user owns this trip or is related to it
    if (trip.customer_id !== userId) {
      // Check if user is vehicle owner or driver
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('owner_id, driver_id')
        .eq('id', trip.vehicle_id)
        .single();
      
      if (!vehicle || (vehicle.owner_id !== userId && vehicle.driver_id !== userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this trip'
        });
      }
    }
    
    res.json({
      success: true,
      data: trip
    });
    
  } catch (error) {
    next(error);
  }
};

// Update trip
const updateTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const customerId = req.userId;
    const updates = req.body;
    
    // Check if trip exists and belongs to customer
    const { data: existingTrip } = await supabase
      .from('trips')
      .select('customer_id, is_completed')
      .eq('id', tripId)
      .single();
    
    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    if (existingTrip.customer_id !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own trips'
      });
    }
    
    if (existingTrip.is_completed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed trip'
      });
    }
    
    // If changing vehicle, check new vehicle availability and passenger limit
    if (updates.vehicle_id && updates.vehicle_id !== existingTrip.vehicle_id) {
      const { data: newVehicle } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', updates.vehicle_id)
        .eq('is_available', true)
        .single();
      
      if (!newVehicle) {
        return res.status(400).json({
          success: false,
          message: 'New vehicle not found or not available'
        });
      }
      
      if (updates.passengers > newVehicle.allowed_passengers) {
        return res.status(400).json({
          success: false,
          message: `Passengers exceed new vehicle limit. Maximum allowed: ${newVehicle.allowed_passengers}`
        });
      }
      
      // Update old vehicle availability
      await supabase
        .from('vehicles')
        .update({ is_available: true })
        .eq('id', existingTrip.vehicle_id);
      
      // Update new vehicle availability
      await supabase
        .from('vehicles')
        .update({ is_available: false })
        .eq('id', updates.vehicle_id);
    }
    
    // Update trip
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Trip updated successfully',
      data
    });
    
  } catch (error) {
    next(error);
  }
};

// Delete trip
const deleteTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const customerId = req.userId;
    
    // Check if trip exists and belongs to customer
    const { data: existingTrip } = await supabase
      .from('trips')
      .select('customer_id, vehicle_id, is_completed')
      .eq('id', tripId)
      .single();
    
    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    if (existingTrip.customer_id !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own trips'
      });
    }
    
    if (existingTrip.is_completed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed trip'
      });
    }
    
    // Start transaction-like operations
    // 1. Make vehicle available again
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({ is_available: true })
      .eq('id', existingTrip.vehicle_id);
    
    if (vehicleError) throw vehicleError;
    
    // 2. Delete trip
    const { error: tripError } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);
    
    if (tripError) throw tripError;
    
    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// End trip
const endTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const userId = req.userId;
    
    // Check if trip exists
    const { data: trip } = await supabase
      .from('trips')
      .select('*, vehicle:vehicles(rate_per_km, id, driver_id, owner_id)')
      .eq('id', tripId)
      .single();
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user is authorized (customer, driver, or owner)
    const isCustomer = trip.customer_id === userId;
    const isDriver = trip.vehicle.driver_id === userId;
    const isOwner = trip.vehicle.owner_id === userId;
    
    if (!isCustomer && !isDriver && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this trip'
      });
    }
    
    if (trip.is_completed) {
      return res.status(400).json({
        success: false,
        message: 'Trip is already completed'
      });
    }
    
    // Calculate trip cost
    const tripCost = trip.distance_km * trip.vehicle.rate_per_km;
    const endDate = new Date().toISOString();
    
    // Update trip and vehicle
    const updates = await supabase.rpc('end_trip_procedure', {
      p_trip_id: tripId,
      p_end_date: endDate,
      p_trip_cost: tripCost,
      p_vehicle_id: trip.vehicle_id
    });
    
    if (updates.error) throw updates.error;
    
    res.json({
      success: true,
      message: 'Trip ended successfully',
      data: {
        trip_cost: tripCost,
        end_date: endDate
      }
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = { createTrip, getTrip, updateTrip, deleteTrip, endTrip };