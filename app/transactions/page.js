'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  // Mock transactions data
  const allTransactions = [
    {
      transactionId: "txn_001",
      poolId: "550e8400-e29b-41d4-a716-446655440001",
      poolName: "Team Vacation Fund",
      type: "deposit",
      amount: 5000,
      status: "success",
      description: "Monthly contribution",
      mpesaPhone: "+254712345678",
      referenceId: "MPesa123456",
      createdAt: "2024-10-15T10:30:00Z",
      processedAt: "2024-10-15T10:35:00Z"
    },
    {
      transactionId: "txn_002",
      poolId: "550e8400-e29b-41d4-a716-446655440002",
      poolName: "Office Equipment",
      type: "deposit",
      amount: 7500,
      status: "pending",
      description: "Equipment fund contribution",
      mpesaPhone: "+254712345678",
      referenceId: "MPesa789012",
      createdAt: "2024-10-14T14:20:00Z",
      processedAt: null
    },
    {
      transactionId: "txn_003",
      poolId: "550e8400-e29b-41d4-a716-446655440001",
      poolName: "Team Vacation Fund",
      type: "withdrawal",
      amount: 15000,
      status: "success",
      description: "Hotel booking payment",
      mpesaPhone: "+254712345678",
      referenceId: "MPesa345678",
      createdAt: "2024-10-13T09:15:00Z",
      processedAt: "2024-10-13T09:20:00Z"
    },
    {
      transactionId: "txn_004",
      poolId: "550e8400-e29b-41d4-a716-446655440003",
      poolName: "Emergency Fund",
      type: "deposit",
      amount: 10000,
      status: "failed",
      description: "Emergency fund contribution",
      mpesaPhone: "+254712345678",
      referenceId: "MPesa901234",
      createdAt: "2024-10-12T16:45:00Z",
      processedAt: "2024-10-12T16:50:00Z"
    },
    {
      transactionId: "txn_005",
      poolId: "550e8400-e29b-41d4-a716-446655440002",
      poolName: "Office Equipment",
      type: "fee",
      amount: 150,
      status: "success",
      description: "Platform service fee",
      referenceId: "FEE_AUTO_001",
      createdAt: "2024-10-11T12:00:00Z",
      processedAt: "2024-10-11T12:00:00Z"
    }
  ];

  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = transaction.poolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      }[dateRange];
      
      if (daysAgo) {
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        matchesDate = transactionDate >= cutoffDate;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const StatusBadge = ({ status }) => {
    const styles = {
      success: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-800' },
      pending: { icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-800' },
      failed: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-800' }
    };
    
    const style = styles[status];
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    const styles = {
      deposit: { icon: ArrowDownLeft, bg: 'bg-blue-100', text: 'text-blue-800' },
      withdrawal: { icon: ArrowUpRight, bg: 'bg-purple-100', text: 'text-purple-800' },
      fee: { icon: AlertCircle, bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    
    const style = styles[type];
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const TransactionCard = ({ transaction }) => (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{transaction.poolName}</h3>
            <TypeBadge type={transaction.type} />
            <StatusBadge status={transaction.status} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>ID: {transaction.transactionId}</span>
            <span>Ref: {transaction.referenceId}</span>
            {transaction.mpesaPhone && (
              <span>Phone: {transaction.mpesaPhone}</span>
            )}
          </div>
        </div>
        <div className="text-right ml-4">
          <p className={`text-lg font-bold ${
            transaction.type === 'deposit' ? 'text-green-600' :
            transaction.type === 'withdrawal' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {transaction.type === 'withdrawal' ? '-' : '+'}KSh {transaction.amount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      
      {transaction.processedAt && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Processed: {new Date(transaction.processedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
    </div>
  );

  const totalAmount = filteredTransactions.reduce((sum, t) => {
    if (t.type === 'deposit') return sum + t.amount;
    if (t.type === 'withdrawal') return sum - t.amount;
    return sum;
  }, 0);

  const depositTotal = filteredTransactions
    .filter(t => t.type === 'deposit' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const withdrawalTotal = filteredTransactions
    .filter(t => t.type === 'withdrawal' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout 
      title="Transactions"
      subtitle="View your transaction history and activity"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deposits</p>
              <p className="text-xl font-bold text-green-600">KSh {depositTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Withdrawals</p>
              <p className="text-xl font-bold text-red-600">KSh {withdrawalTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Amount</p>
              <p className={`text-xl font-bold ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                KSh {Math.abs(totalAmount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="fee">Fees</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <TransactionCard key={transaction.transactionId} transaction={transaction} />
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <ArrowUpRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || dateRange !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Your transactions will appear here once you start contributing to pools'
            }
          </p>
          <button
            onClick={() => router.push('/pools')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Pools
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
