import { MercadoCompeticao } from './brasileirao-a';
import mercados from '../Data/mercados';

export default function SerieA() {
  return <MercadoCompeticao mercado={mercados['serie-a']} />;
}
