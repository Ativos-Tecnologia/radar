'use client';

import { useParams } from 'next/navigation';
import NovoAportePage from '../../novo/page';

export default function EditarAportePage() {
  const params = useParams();
  const enteId = params.id as string;

  // Reutiliza o componente de novo aporte, que agora detecta automaticamente
  return <NovoAportePage enteIdProp={enteId} />;
}
