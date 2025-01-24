export function validateEmail(email) {
    
    email = email.trim(); //Elimina espacios al inicio y al final

    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email)
}

export function validatePhone(phone) {
    // Expresión regular para validar números de teléfono de EE.UU.
    const regex = /^(?:\+1\s?)?(\d{10}|\(\d{3}\)\s?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})$/;
    return regex.test(phone);
  }
  