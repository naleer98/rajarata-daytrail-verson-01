const User = require('../models/User')
const jwt = require('jsonwebtoken')


const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not configured in .env'
    )
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d'
    }
  )
}


exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      adminCode
    } = req.body


    if (
      !name ||
      !email ||
      !password ||
      !adminCode
    ) {
      return res.status(400).json({
        message:
          'Name, email, password and administrator registration code are required.'
      })
    }


    if (name.trim().length < 2) {
      return res.status(400).json({
        message:
          'Please enter a valid name.'
      })
    }


    if (password.length < 8) {
      return res.status(400).json({
        message:
          'Password must contain at least 8 characters.'
      })
    }


    if (
      !process.env.ADMIN_REGISTRATION_CODE
    ) {
      console.error(
        'ADMIN_REGISTRATION_CODE is missing from .env'
      )

      return res.status(500).json({
        message:
          'Administrator registration is not configured.'
      })
    }


    if (
      adminCode !==
      process.env.ADMIN_REGISTRATION_CODE
    ) {
      return res.status(403).json({
        message:
          'Invalid administrator registration code.'
      })
    }


    const normalizedEmail =
      email.toLowerCase().trim()


    const userExists =
      await User.findOne({
        email: normalizedEmail
      })


    if (userExists) {
      return res.status(400).json({
        message:
          'An account with this email already exists.'
      })
    }


    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'admin'
    })


    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })

  } catch (error) {

    console.error(
      'Register error:',
      error
    )


    if (error.code === 11000) {
      return res.status(400).json({
        message:
          'An account with this email already exists.'
      })
    }


    return res.status(500).json({
      message:
        'Unable to create account. Please try again.'
    })
  }
}


exports.loginUser = async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body


    if (!email || !password) {
      return res.status(400).json({
        message:
          'Email and password are required.'
      })
    }


    const normalizedEmail =
      email.toLowerCase().trim()


    const user = await User.findOne({
      email: normalizedEmail
    })


    if (
      !user ||
      !(await user.matchPassword(password))
    ) {
      return res.status(401).json({
        message:
          'Invalid email or password.'
      })
    }


    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })

  } catch (error) {

    console.error(
      'Login error:',
      error
    )


    return res.status(500).json({
      message:
        'Unable to sign in. Please try again.'
    })
  }
}


exports.getUserProfile = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.user._id
      )


    if (!user) {
      return res.status(404).json({
        message:
          'User not found.'
      })
    }


    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })

  } catch (error) {

    return res.status(500).json({
      message:
        'Unable to load user profile.'
    })
  }
}
