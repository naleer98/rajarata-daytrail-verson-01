const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 120
      },

      password: {
        type: String,
        required: true,
        minlength: 8
      },

      role: {
        type: String,
        enum: [
          'tourist',
          'admin'
        ],
        default: 'tourist'
      }
    },
    {
      timestamps: true
    }
  )


userSchema.pre(
  'save',
  async function () {

    if (
      !this.isModified('password')
    ) {
      return
    }


    const salt =
      await bcrypt.genSalt(10)


    this.password =
      await bcrypt.hash(
        this.password,
        salt
      )
  }
)


userSchema.methods.matchPassword =
  async function (
    enteredPassword
  ) {
    return bcrypt.compare(
      enteredPassword,
      this.password
    )
  }


module.exports =
  mongoose.model(
    'User',
    userSchema
  )
