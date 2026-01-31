const supabase = require('../config/db');

// User signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate role
    const validRoles = ['customer', 'owner', 'driver'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be customer, owner, or driver'
      });
    }
    
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Create user (no password hashing as per requirements)
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password, role }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        created_at: data.created_at
      }
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = { signup };