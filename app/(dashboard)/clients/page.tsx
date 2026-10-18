import { LeadRepository } from '@/lib/db';
import ClientsManager from '@/components/ClientsManager';

export const revalidate = 0;

export default async function ClientsPage() {
  const allLeads = await LeadRepository.getAllLeads();
  const clients = allLeads.filter(
    (l) => l.customer?.isCustomer || l.lifecycle === 'client' || l.lifecycle === 'maintenance'
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <ClientsManager initialClients={clients} />
    </div>
  );
}
