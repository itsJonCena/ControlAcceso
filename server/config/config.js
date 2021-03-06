/**
 * Puerto
 */
process.env.PORT = process.env.PORT || 3000;


/**
 * ======================
 * Entorno
 * ======================
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * ======================
 * Vencimiento del token
 * ======================
 */
//60 segundos
//60 minutos
//24 horas
//30 dias
process.env.CADUCIDAD_TOKEN = '48h';


/**
 * ======================
 * SEED de autenticación
 * ======================
 */
process.env.SEED = process.env.SEED || 'seed-desarrollo';

/**
 * ======================
 * Bade de datos
 * ======================
 */
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://192.168.0.9:27017/Pruebas';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

/**
 * ======================
 * Google Client ID
 * ======================
 */
process.env.CLIENT_ID = process.env.CLIENT_ID || '530672903898-frb1fhqch55ho5me5ehq84tmbrc1mkkq.apps.googleusercontent.com';