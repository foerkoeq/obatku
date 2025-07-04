import PageTitle from "@/components/page-title";
import { getPendingDistributions } from "@/lib/data/transaction-demo";
import { Transaction } from "@/lib/types/transaction";
import IssuanceCard from "@/components/transactions/issuance-card";
import { Icon } from "@/components/ui/icon";

const OutgoingTransactionPage = () => {
  const pendingDistributions: Transaction[] = getPendingDistributions();

  return (
    <div className="space-y-6">
      <div>
        <PageTitle
          title="Pengeluaran Obat"
        />
        <p className="text-sm text-default-600 mt-1">Proses pengeluaran obat yang telah disetujui untuk didistribusikan.</p>
      </div>
      
      {pendingDistributions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pendingDistributions.map((transaction) => (
            <IssuanceCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-96 rounded-lg bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                 <Icon icon="lucide:package-check" className="w-10 h-10 text-primary-500" />
            </div>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Tidak Ada Pengajuan Siap Distribusi
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
            Saat ini tidak ada permintaan yang siap untuk proses pengeluaran barang dari gudang.
          </p>
        </div>
      )}
    </div>
  );
};

export default OutgoingTransactionPage; 