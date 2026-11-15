import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ success: false, message: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ success: false, message: 'Token mal formatado.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_super_segura', (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido ou expirado.' });
    }

    // Injeta os dados do token (employee_id, nickname) na requisição
    req.user = decoded;
    return next();
  });
}