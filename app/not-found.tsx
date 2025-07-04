'use client';

import { Link } from '@/components/navigation';
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center py-20 bg-background">
            <Image src="/images/all-img/404-2.svg" alt="" height={300} width={300} />
            <div className="max-w-[546px] mx-auto w-full mt-12">
                <h4 className="text-default-900 mb-4">Halaman tidak ditemukan</h4>
                <div className="dark:text-white text-base font-normal mb-10">
                    Halaman yang Anda cari mungkin telah dihapus, berganti nama, atau sementara tidak tersedia.
                </div>
            </div>
            <div className="max-w-[300px] mx-auto w-full">
                <Link
                    href="/"
                    className="btn bg-default-300 hover:bg-default-300/50 transition-all duration-150 block text-center rounded-md py-2"
                >
                    Kembali ke beranda
                </Link>
            </div>
        </div>
    );
} 