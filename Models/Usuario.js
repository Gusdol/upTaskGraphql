const mongoose = require("mongoose");

const UsuariosSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true, // eliminar espacios en blanco inicio y final
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowerCase: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  registro: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Usuario", UsuariosSchema);
