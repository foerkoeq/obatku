import PageTitle from "@/components/page-title";
import { getPendingApprovals } from "@/lib/data/transaction-demo";
import { Transaction } from "@/lib/types/transaction";
import ApprovalCard from "@/components/transactions/approval-card";

const ApprovalPage = () => {
  const pendingApprovals: Transaction[] = getPendingApprovals();

  return (
    <div className="space-y-6">
      <PageTitle
        title="Persetujuan Permintaan"
        subtitle="Review dan setujui permintaan obat dari PPL"
      />
      
      {pendingApprovals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pendingApprovals.map((transaction) => (
            <ApprovalCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-96">
            <div className="p-4 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                 <svg
                    className="w-10 h-10 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
            </div>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Tidak Ada Permintaan
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Saat ini tidak ada permintaan yang memerlukan persetujuan Anda.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApprovalPage; 