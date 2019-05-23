const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const {
    verificaToken,
    verificaAdmin_Role
} = require('../middleware/autenticacion');
const app = express();
const Usuario = require('../models/usuario')

app.get('/usuario', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    Usuario.find({
            estado: true
        }, 'nombre email role estado google img')
        .skip(Number(desde))
        .limit(Number(limite))
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.countDocuments({
                estado: true
            }, (err, conteo) => {
                res.json({
                    ok: true,
                    total: conteo,
                    usuarios
                })
            })
        })
});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function (req, res) {
    let body = req.body

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            msg: 'Nombre es necesario'
        });
    } else {
        let usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            role: body.role
        })
        usuario.save((err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB
            })
        })
    }

});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado'])

    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {

    let id = req.params.id;

    Usuario.findByIdAndUpdate(id, {
        estado: false
    }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        return res.json({
            ok: true,
            usuario: usuarioBorrado
        })
    })

});

module.exports = app;