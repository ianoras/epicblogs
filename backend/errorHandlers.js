// Utility per il logging strutturato
const logError = (err) => {
  console.error({
    timestamp: new Date().toISOString(),
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

export const badRequestHandler = (err, req, res, next) => {
  if (err.status === 400) {
    logError(err);
    res.status(400).send({
      success: false,
      message: err.message || 'Richiesta non valida',
      errorsList: Array.isArray(err.errorsList) 
        ? err.errorsList.map(e => e.msg)
        : [],
    });
  } else {
    next(err);
  }
};

export const unauthorizedHandler = (err, req, res, next) => {
  if (err.status === 401) {
    logError(err);
    res.status(401).send({ 
      success: false, 
      message: err.message || 'Non autorizzato'
    });
  } else {
    next(err);
  }
};

export const notfoundHandler = (err, req, res, next) => {
  if (err.status === 404) {
    logError(err);
    res.status(404).send({ 
      success: false, 
      message: err.message || 'Risorsa non trovata'
    });
  } else {
    next(err);
  }
};

export const genericErrorHandler = (err, req, res, next) => {
  logError(err);
  
  // Non esporre dettagli dell'errore in produzione
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(err.status || 500).send({
    success: false,
    message: isProduction 
      ? 'Si è verificato un errore interno. Riprova più tardi.'
      : err.message || 'Errore interno del server',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
