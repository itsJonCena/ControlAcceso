const jwk = require('jsonwebtoken');

/**
 * ===============
 * Verificacion de token
 * ===============
 */

let verificaToken = (req, res, next) => {
    //let token = req.get('Autorization'); // Obtiene del Autorization
    let token = req.get('token'); // Obtiene de los headers
    jwk.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido.'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();

    });

}

/**
 * ===============
 * Verificacion de token IMG
 * ===============
 */

let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwk.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido.'
                }
            })
        }
        req.usuario = decoded.usuario;
        next();

    });
}

/**
 * ====================
 * Verifica Admin Role
 * ====================
 */
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {

        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador.'
            }
        });
    }




}

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}