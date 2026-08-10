import styled from 'styled-components';

function obterInicial(usuario, nome) {
  const texto =
    nome ||
    usuario?.nomeUsuario ||
    usuario?.nomePublico ||
    usuario?.nome ||
    'U';

  return String(texto).replace(/^@/, '').trim().charAt(0).toUpperCase() || 'U';
}

export default function UserAvatar({ usuario, nome, src, size = 40, className = '', alt = '' }) {
  const foto = src || usuario?.fotoPerfilUrl || '';
  const descricao = alt || `Foto de ${nome || usuario?.nomeUsuario || usuario?.nome || 'usuário'}`;

  return (
    <AvatarBase $size={size} className={className} aria-label={descricao}>
      {foto ? (
        <img src={foto} alt={descricao} referrerPolicy="no-referrer" />
      ) : (
        <span aria-hidden="true">{obterInicial(usuario, nome)}</span>
      )}
    </AvatarBase>
  );
}

const AvatarBase = styled.div`
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  min-width: ${({ $size }) => `${$size}px`};
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #16a34a);
  color: #fff;
  font-size: ${({ $size }) => `${Math.max(12, Math.round($size * 0.42))}px`};
  font-weight: 800;
  line-height: 1;
  flex: 0 0 auto;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;
