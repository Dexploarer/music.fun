import React, { useState } from 'react';
import { ChevronLeft, Filter, Plus, Search, DollarSign, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs, { useBreadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useRoyaltyReports, useArtistContracts, useArtistPayments } from '../../hooks/useArtistContracts';
import { format } from 'date-fns';
import { RoyaltyReport } from '../../types';
import RoyaltyReportForm from '../../components/royalties/RoyaltyReportForm';
import ArtistContractForm from '../../components/royalties/ArtistContractForm';
import ArtistPaymentForm from '../../components/royalties/ArtistPaymentForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const ArtistRoyalties: React.FC = () => {
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'reports' | 'contracts' | 'payments'>('reports');
  
  // Royalty Reports
  const { reports, isLoading: isLoadingReports, createReport } = useRoyaltyReports();
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  
  // Artist Contracts
  const { contracts, isLoading: isLoadingContracts, createContract } = useArtistContracts();
  const [isContractFormOpen, setIsContractFormOpen] = useState(false);
  
  // Artist Payments
  const { payments, isLoading: isLoadingPayments, createPayment } = useArtistPayments();
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  
  // Filter reports based on search
  const filteredReports = reports.filter(report => 
    report.artistId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter contracts based on search
  const filteredContracts = contracts.filter(contract => 
    contract.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contractType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter payments based on search
  const filteredPayments = payments.filter(payment => 
    payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle forms submission
  const handleReportSubmit = (reportData: Omit<RoyaltyReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    createReport(reportData);
    setIsReportFormOpen(false);
  };
  
  const handleContractSubmit = (contractData: any) => {
    createContract(contractData);
    setIsContractFormOpen(false);
  };
  
  const handlePaymentSubmit = (paymentData: any) => {
    createPayment(paymentData);
    setIsPaymentFormOpen(false);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <button 
            onClick={() => navigate('/finances')}
            className="mb-2 flex items-center text-sm font-medium text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Finances
          </button>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Artist Royalties
          </h1>
        </div>
      </div>
      
      {/* Search and Add buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <TabsList className="mb-2 sm:mb-0">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={12} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border-0 bg-zinc-800 py-1.5 pl-8 pr-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button 
                onClick={() => {
                  if (activeTab === 'reports') setIsReportFormOpen(true);
                  else if (activeTab === 'contracts') setIsContractFormOpen(true);
                  else if (activeTab === 'payments') setIsPaymentFormOpen(true);
                }}
                className="inline-flex items-center rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
              >
                <Plus size={12} className="mr-1" />
                {activeTab === 'reports' ? 'New Report' : 
                 activeTab === 'contracts' ? 'New Contract' : 'New Payment'}
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <TabsContent value="reports" className="mt-4 space-y-4">
            {isLoadingReports ? (
              <div className="flex items-center justify-center py-10">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                <p className="text-white">Loading royalty reports...</p>
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Artist
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Royalty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                    {filteredReports.map(report => (
                      <tr key={report.id} className="hover:bg-zinc-800">
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-white">
                          Artist Name
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">
                          {format(new Date(report.reportPeriodStart), 'MMM d, yyyy')} - {format(new Date(report.reportPeriodEnd), 'MMM d, yyyy')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">
                          ${report.grossRevenue.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-green-500 font-medium">
                          ${report.royaltyAmount.toLocaleString()} ({report.royaltyPercentage}%)
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            report.status === 'draft' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'final' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                          <button className="text-amber-500 hover:text-amber-400">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-900 p-6 text-center">
                <FileText size={32} className="mx-auto text-amber-500 opacity-50" />
                <h2 className="mt-4 text-xl font-semibold text-white">No royalty reports found</h2>
                <p className="mt-1 text-gray-400">
                  {searchTerm ? `No royalty reports matching "${searchTerm}"` : 'Create your first royalty report to get started.'}
                </p>
                <button
                  onClick={() => setIsReportFormOpen(true)}
                  className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  <Plus size={14} className="mr-2" />
                  Create Royalty Report
                </button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contracts" className="mt-4 space-y-4">
            {isLoadingContracts ? (
              <div className="flex items-center justify-center py-10">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                <p className="text-white">Loading contracts...</p>
              </div>
            ) : filteredContracts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredContracts.map(contract => (
                  <div key={contract.id} className="rounded-lg bg-zinc-900 p-4 shadow-lg">
                    <div className="mb-2 flex justify-between">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        contract.status === 'draft' ? 'bg-blue-100 text-blue-800' :
                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                        contract.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {contract.status}
                      </span>
                      <span className="text-xs text-gray-400">{contract.contractType}</span>
                    </div>
                    <h3 className="text-base font-medium text-white">{contract.contractName}</h3>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <Calendar size={10} className="mr-1" />
                      {format(new Date(contract.startDate), 'MMM d, yyyy')}
                      {contract.endDate && ` - ${format(new Date(contract.endDate), 'MMM d, yyyy')}`}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-400">Payment</p>
                        <p className="text-sm font-medium text-white">
                          {contract.paymentType === 'flat_fee' ? `$${contract.flatFeeAmount}` : 
                           contract.paymentType === 'percentage' ? `${contract.percentageRate}%` : 
                           `$${contract.flatFeeAmount} + ${contract.percentageRate}%`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Schedule</p>
                        <p className="text-sm text-white capitalize">{contract.paymentSchedule.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <button className="text-xs text-amber-500 hover:text-amber-400">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-900 p-6 text-center">
                <FileText size={32} className="mx-auto text-amber-500 opacity-50" />
                <h2 className="mt-4 text-xl font-semibold text-white">No contracts found</h2>
                <p className="mt-1 text-gray-400">
                  {searchTerm ? `No contracts matching "${searchTerm}"` : 'Create your first artist contract to get started.'}
                </p>
                <button
                  onClick={() => setIsContractFormOpen(true)}
                  className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  <Plus size={14} className="mr-2" />
                  Create Contract
                </button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="payments" className="mt-4 space-y-4">
            {isLoadingPayments ? (
              <div className="flex items-center justify-center py-10">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                <p className="text-white">Loading payments...</p>
              </div>
            ) : filteredPayments.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Artist
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Payment Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                    {filteredPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-zinc-800">
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-white">
                          Artist Name
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">
                          {format(new Date(payment.paymentDate), 'MMM d, yyyy')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-green-500 font-medium">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300 capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            payment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                          <button className="text-amber-500 hover:text-amber-400">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-900 p-6 text-center">
                <DollarSign size={32} className="mx-auto text-amber-500 opacity-50" />
                <h2 className="mt-4 text-xl font-semibold text-white">No payments found</h2>
                <p className="mt-1 text-gray-400">
                  {searchTerm ? `No payments matching "${searchTerm}"` : 'Record your first artist payment to get started.'}
                </p>
                <button
                  onClick={() => setIsPaymentFormOpen(true)}
                  className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  <Plus size={14} className="mr-2" />
                  Record Payment
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Forms */}
      {isReportFormOpen && (
        <RoyaltyReportForm
          isOpen={isReportFormOpen}
          onClose={() => setIsReportFormOpen(false)}
          onSave={handleReportSubmit}
          isSubmitting={false}
        />
      )}
      
      {isContractFormOpen && (
        <ArtistContractForm
          isOpen={isContractFormOpen}
          onClose={() => setIsContractFormOpen(false)}
          onSave={handleContractSubmit}
          isSubmitting={false}
        />
      )}
      
      {isPaymentFormOpen && (
        <ArtistPaymentForm
          isOpen={isPaymentFormOpen}
          onClose={() => setIsPaymentFormOpen(false)}
          onSave={handlePaymentSubmit}
          isSubmitting={false}
        />
      )}
    </div>
  );
};

export default ArtistRoyalties;