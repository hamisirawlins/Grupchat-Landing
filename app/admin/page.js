"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Link from "next/link";
import { BookOpen, LayoutList, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) router.replace("/dashboard");
  }, [loading, user, isAdmin, router]);

  if (loading || !isAdmin) return null;

  return (
    <DashboardWrapper>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-7 h-7 text-[#7a73ff]" />
          <h1 className="text-2xl font-semibold text-gray-900">Admin</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/catalogue" className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <BookOpen className="w-8 h-8 text-[#7a73ff] mb-4" />
            <h2 className="font-semibold text-gray-900 mb-1">Catalogue</h2>
            <p className="text-sm text-gray-500">Manage premium experience listings — create, edit, pause, archive.</p>
          </Link>

          <Link href="/admin/plans" className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <LayoutList className="w-8 h-8 text-[#7a73ff] mb-4" />
            <h2 className="font-semibold text-gray-900 mb-1">Active Plans</h2>
            <p className="text-sm text-gray-500">Monitor premium plans — member counts, payment status, lock dates.</p>
          </Link>
        </div>
      </div>
    </DashboardWrapper>
  );
}
