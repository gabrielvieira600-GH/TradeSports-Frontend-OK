import { MercadoCompeticao } from './brasileirao-a';
import mercados from '../Data/mercados';
export default function PremierLeague() { return <MercadoCompeticao mercado={mercados['serie-a']} />; }
