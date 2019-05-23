const mongoose = require('mongoose');
const unitValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripción es obligatoria'],
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'usuario'
    }
})

/*categoriaSchema.plugin(unitValidator, {
    message: '{PATH} debe de ser unico.'
});*/
module.exports = mongoose.model('Categoria', categoriaSchema);