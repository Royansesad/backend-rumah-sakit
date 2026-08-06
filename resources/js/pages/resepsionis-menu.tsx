import React from 'react';
import { Layout } from '../components/layout';
import type { Role } from '../types/simrs';

interface ResepsionisMenuProps {
    user: any;
    role: Role;
    menu: string;
}

function FallbackView({ menu }: { menu: string }) {
    return (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
                Menu Belum Tersedia
            </h1>
            <p className="mt-2 text-sm text-gray-500">
                Modul <span className="font-semibold">{menu}</span> sedang dalam
                pengembangan.
            </p>
        </div>
    );
}

export default function ResepsionisMenu({
    user,
    role = 'resepsionis',
    menu = '',
}: ResepsionisMenuProps) {
    return (
        <Layout user={user} role={role}>
            <FallbackView menu={menu} />
        </Layout>
    );
}
