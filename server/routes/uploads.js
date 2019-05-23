const fs = require('fs');
const path = require('path');
const Usuarios = require('../models/usuario')
const Productos = require('../models/producto')
const express = require('express');
const upload = require('express-fileupload');
const app = express();

/**
 * 
 */
app.use(upload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: true,
                err: {
                    msg: 'No se ha seleccionado ningun archivo.'
                }
            });
    }
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                msg: 'Las tipos permitidos son ' + tiposValidos.join(', ')
            }
        })
    }


    //Extenciones validas
    let extencionesValidas = ['jpg', 'pgn', 'gif', 'jpeg'];

    let archivo = req.files.archivo;
    let extencionArchivo = archivo.name.split('.');
    let extencion = extencionArchivo[extencionArchivo.length - 1]

    if (extencionesValidas.indexOf(extencionArchivo[extencionArchivo.length - 1]) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                msg: 'Las extenciones permitidas son ' + extencionesValidas.join(', '),
                extencion
            }
        })
    }

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencion}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500)
                .json({
                    ok: false,
                    err
                })
        }
        switch (tipo) {
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo);
                break;

            case 'productos':
                imagenProducto(id, res, nombreArchivo);
                break;
        }

    })
})

function imagenUsuario(id, res, nombreArchivo) {

    Usuarios.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(500)
                .json({
                    ok: true,
                    err
                });
        }

        if (!usuarioDB) {
            return res.status(400)
                .json({
                    ok: true,
                    err: {
                        msg: 'Usuario no existe.'
                    }
                });
        }

        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: true,
                        err
                    });
            }

            return res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })

    })

}

function imagenProducto(id, res, nombreArchivo) {
    
    Productos.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(500)
                .json({
                    ok: true,
                    err
                });
        }

        if (!productoDB) {
            return res.status(400)
                .json({
                    ok: true,
                    err: {
                        msg: 'Producto no existe.'
                    }
                });
        }

        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: true,
                        err
                    });
            }

            return res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })

    })
}

function borrarArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;