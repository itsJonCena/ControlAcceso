const mongoose = require('mongoose');
const unitValidator = require('mongoose-unique-validator');


let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol valido'
} 

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true,'El nombre es requerido']
    },
    email: {
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligaoria']
    },
    img: { 
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
})

usuarioSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin(unitValidator,{message: '{PATH} debe de ser unico.'});

module.exports = mongoose.model('usuario',usuarioSchema)