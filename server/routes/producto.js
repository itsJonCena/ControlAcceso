const express = require('express');
const app = express();
const validador = require('../utils/asignacionUtil');

const {
    verificaToken
} = require('../middleware/autenticacion');

let Productos = require('../models/producto');
let Categorias = require('../models/categoria');


/**
 * ===========================
 * Obtener productos
 * ===========================
 */
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;

    Productos.find({
            disponible: true
        }, 'nombre precioUni descripcion disponible categoria usuario')
        .skip(Number(desde))
        .limit(Number(limite))
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                productos: productosDB
            })

        })
})

/**
 * ===========================
 * Obtener producto por id
 * ===========================
 */
app.get('/producto/:id', verificaToken, (req, res) => {

    let idProducto = req.params.id;

    if (idProducto) {
        Productos.findById(idProducto)
            .populate('usuario', 'nombre email')
            .populate('categoria', 'descripcion')
            .exec((err, productoDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if (productoDB) {
                    return res.json({
                        ok: true,
                        msg: `Producto: ${idProducto} encontrado`,
                        categoria: productoDB
                    })
                } else {
                    return res.status(204).json({
                        ok: false,
                        mesg: `No se encontro el producto con id: ${idProducto}`
                    })
                }
            })
    } else {
        return res.json({
            ok: false,
            err: {
                msg: 'Debe proporcinar el id del producto.'
            }
        })
    }
})

/**
 * ===========================
 * Buscar productos
 * ===========================
 */
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino,'i');
    Productos.find({ nombre: regex})
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                productos: productosDB
            })
        })

        
})

/**
 * ===========================
 * Crear un producto
 * ===========================
 */
app.post('/producto', verificaToken, async (req, res) => {
    // grabar usuario
    // grabar una categoria del listado

    let {
        nombre,
        precioUni,
        descripcion,
        disponible,
        categoria
    } = req.body;

    let usuarioId = req.usuario._id;

    // buscar categoria

    let categoriaEnDB = await Categorias.findOne({
            descripcion: categoria
        })
        .then((categoriaDB) => {
            if (categoriaDB) {
                return categoriaDB;
            } else {
                return res.status(204).json({
                    ok: false,
                    msg: `No se encontro la categoria : ${categoria}.`
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                ok: false,
                err
            })
        });

    let nuevoProducto = new Productos({
        nombre,
        descripcion,
        precioUni,
        disponible,
        categoria: categoriaEnDB._id,
        usuario: usuarioId
    })

    nuevoProducto.save((err, nuevoProductoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!nuevoProductoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: `Producto '${nombre}' no creado.`
                }
            });
        }

        return res.status(201).json({
            ok: true,
            msg: 'Nuevo producto creado',
            producto: nuevoProductoDB
        })

    })

})

/**
 * ===========================
 * Actualizar un producto
 * ===========================
 */
app.put('/producto/:id', verificaToken, async (req, res) => {
    let {
        nombre,
        precioUni,
        descripcion,
        disponible,
        categoria
    } = req.body;

    let usuarioId = req.usuario._id;

    let productoId = req.params.id;

    let actualProductoDB = await Productos.findById(productoId)
        .then(productoDB => {
            return productoDB
        })
        .catch(err => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
        });

    nombre = validador.validarValorFinal(nombre, actualProductoDB.nombre)
    precioUni = validador.validarValorFinal(precioUni, actualProductoDB.precioUni)
    descripcion = validador.validarValorFinal(descripcion, actualProductoDB.descripcion)
    disponible = validador.validarValorFinal(disponible, actualProductoDB.disponible)
    categoria = validador.validarValorFinal(categoria, actualProductoDB.categoria)
    usuarioId = validador.validarValorFinal(usuarioId, actualProductoDB.usuarioId)

    Productos.findByIdAndUpdate(productoId, {
        nombre,
        precioUni,
        descripcion,
        disponible,
        categoria,
        usuarioId
    }, {
        new: true,
        runValidators: true
    }, (err, productoActualizadoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        if (!productoActualizadoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'No se encontro el producto.'
                }
            });
        }

        return res.json({
            ok: true,
            msg: 'Producto actualizado correctamente',
            producto: productoActualizadoDB
        });
    })
})

/**
 * ===========================
 * Borrar un producto
 * ===========================
 */
app.delete('/producto/:id', (req, res) => {

    let idProducto = req.params.id;
    if (!idProducto) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El id del producto es requerido.'
            }
        });
    }
    Productos.findOneAndUpdate(idProducto, {
        disponible: false
    }, {
        new: true,
        runValidators: true
    }, (err, productoActualizadoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrado'
                }
            });
        }

        if (!productoActualizadoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    msg: 'No se encontro el producto.'
                }
            });
        }
        return res.json({
            ok: true,
            msg: 'Producto deshabilitado correctamente',
            producto: productoActualizadoDB
        });
    })
})


module.exports = app;