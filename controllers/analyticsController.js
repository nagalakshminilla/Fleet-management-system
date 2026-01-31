const supabase = require('../config/db');

const getAnalytics = async (req, res, next) => {
  try {
    // Run all counts in parallel for better performance
    const [
      customersCount,
      ownersCount,
      driversCount,
      vehiclesCount,
      tripsCount
    ] = await Promise.all([
      // Total customers
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer'),
      
      // Total owners
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'owner'),
      
      // Total drivers
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'driver'),
      
      // Total vehicles
      supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true }),
      
      // Total trips
      supabase
        .from('trips')
        .select('id', { count: 'exact', head: true })
    ]);
    
    res.json({
      success: true,
      data: {
        total_customers: customersCount.count || 0,
        total_owners: ownersCount.count || 0,
        total_drivers: driversCount.count || 0,
        total_vehicles: vehiclesCount.count || 0,
        total_trips: tripsCount.count || 0
      }
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };