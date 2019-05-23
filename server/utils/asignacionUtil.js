/**
 * Valida y retorna el valor final para actualizar una variable.
 * Evita asignar valores Null, undefined. 
 * @param {*} nuevoValor [Nuevo valor para ser asignado]
 * @param {*} valorActual [Valor actual de la variable]
 * @return {*} [valor final de la validacion]
 */
let validarValorFinal = (nuevoValor, valorActual) => {
    return (nuevoValor && (nuevoValor !== valorActual ? nuevoValor : valorActual)) || valorActual;
}

module.exports = {
    validarValorFinal
}