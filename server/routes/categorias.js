const express = require('express');
const app = express();
let {
    verificaToken,
    verificaAdmin_Role
} = require('../middleware/autenticacion');
let Categorias = require('../models/categoria');


/**
 * ============================
 * Obtener todas las categorias
 * ============================
 */
app.get('/categorias', verificaToken, (req, res) => {

    Categorias.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriasDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
    
            return res.json({
                ok: true,
                msg: 'Lista de todas las categorias',
                categorias: categoriasDB
            })
        })

});

/**
 * ============================
 * Buscar categoria por ID
 * ============================
 */
app.get('/categoria/:id', verificaToken, (req, res) => {
    // findById mongoose

    let idCategoria = req.params.id;

    if (idCategoria) {

        Categorias.findById(idCategoria, 'descripcion', (err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (categoriaDB) {
                return res.json({
                    ok: true,
                    msg: `Categoria ${idCategoria} encontrada`,
                    categoria: categoriaDB
                })
            } else {
                return res.status(204).json({
                    ok: false,
                    msg: `No se encontro la categoria con id: ${req.params.id}`
                })
            }
        })

    } else {
        return res.json({
            ok: false,
            err: {
                msg: 'Debe proporcinar el id de la categoria.'
            }
        })
    }

});

/**
 * ============================
 * Crear una nueva categoria
 * ============================
 */
app.post('/categoria', verificaToken, (req, res) => {
    let descipcion = req.body.descripcion;
    let userId = req.usuario._id;

    if (!descipcion) {
        return res.status(400).json({
            ok: false,
            msg: 'Descripcion es necesaria'
        });
    } else {
        let nuevaCategoria = new Categorias();
        nuevaCategoria.descripcion = descipcion;
        nuevaCategoria.usuario = userId;

        nuevaCategoria.save((err, categoriaCreadaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaCreadaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        msg: 'Categoria no creada'
                    }
                });
            }

            return res.json({
                ok: true,
                msg: 'Nueva categoria creada',
                categoria: categoriaCreadaDB
            })
        })
    }
})

/**
 * ============================
 * Actualizar descipcion de la categoria
 * ============================
 */
app.put('/categoria/:id', verificaToken, (req, res) => {

    let nuevaDescripcion = req.body.descripcion;
    let id = req.params.id;

    if (!nuevaDescripcion) {
        return res.status(400).json({
            ok: false,
            msg: 'Descripcion es necesaria'
        });
    } else {
        Categorias.findByIdAndUpdate(id, {
            descripcion: nuevaDescripcion
        }, {
            new: true,
            runValidators: true
        }, (err, categoriaActualizadaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Categoria no encontrado'
                    }
                });
            }

            if (!categoriaActualizadaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        msg: 'No se encontro la categoria.'
                    }
                });
            }

            return res.json({
                ok: true,
                msg: 'Categoria actualizada exitosamente',
                categoria: categoriaActualizadaDB
            });
        })
    }
});

/**
 * ============================
 * Eliminar categoria
 * ============================
 */
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    if (!id) {
        return res.status(400).json({
            ok: false,
            msg: 'Descripcion es necesaria'
        });
    } else {
        Categorias.findByIdAndRemove(id, (err, categoriaEliminadaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!categoriaEliminadaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoria no encontrado'
                    }
                });
            }

            return res.json({
                ok: true,
                msg: 'Categoria eliminada exitosamente',
                categoria: categoriaEliminadaDB
            });
        });
    }

})

module.exports = app;