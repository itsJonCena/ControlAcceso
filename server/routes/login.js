const express = require('express');
const bcrypt = require('bcrypt');
const jwk = require('jsonwebtoken');
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const app = express();
const Usuario = require('../models/usuario')

app.post('/login', (req, res) => {

    let body = req.body

    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    menssage: 'Usuario o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    menssage: 'Usuario o contraseña incorrectos'
                }
            });
        }

        let token = jwk.sign({
            usuario: usuarioDB
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })

    })

})

/**
 * ==========================
 * Configuraciones de Google
 * ==========================
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();


    let email = payload.email;
    let nombre = payload.name;
    let img = payload.picture;
    console.log(email);
    console.log(nombre);
    console.log(img);

    return {
        email,
        nombre,
        img,
        google: true
    }

}
app.post('/google', async (req, res) => {


    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });

        });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Debe usar su autenticación normal.'
                    }
                });
            } else {
                let token = jwk.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });
        
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
            
        } else {
            // Nuevo usuario cuando no exista en BD pero sea correcto su registro por google
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.password = ':)';
            usuario.img = googleUser.img;
            usuario.google = true;

            usuario.save((err,usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwk.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });
        
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            })
        }
    })

})

module.exports = app;