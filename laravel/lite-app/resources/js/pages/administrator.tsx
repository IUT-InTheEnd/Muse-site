import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    id_role?: number | null;
    created_at?: string | null;
};

type Props = {
    users: AdminUser[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administrateur',
        href: '/administrator',
    },
];

export default function Administrator({ users }: Props) {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Administrateur" />
			<div className="mx-auto w-full max-w-5xl px-4 py-10">
				<h1 className="text-2xl font-bold">Espace administrateur</h1>
				<h2 className="mt-2 text-lg">Gestion des utilisateurs</h2>

				<div className="mt-6 overflow-x-auto rounded-lg border">
					<table className="min-w-full text-left text-sm">
						<thead className="bg-muted/40">
							<tr>
								<th className="px-4 py-3 font-medium">Identifiant</th>
								<th className="px-4 py-3 font-medium">Nom</th>
								<th className="px-4 py-3 font-medium">Email</th>
								<th className="px-4 py-3 font-medium">Rôle</th>
								<th className="px-4 py-3 font-medium">Créé le</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								console.log(user),
								<tr key={user.id}  className="border-t hover:bg-muted/50 cursor-pointer">
									<td className="px-4 py-3">{user.id}</td>
									<td className="px-4 py-3">{user.name}</td>
									<td className="px-4 py-3">{user.email}</td>
									<td className="px-4 py-3">{Number(user.id_role ?? 2) === 1 ? 'Admin' : 'Utilisateur'}</td>
									<td className="px-4 py-3">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</td>
								</tr>
							))}
							{users.length === 0 && (
								<tr>
									<td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
										Aucun utilisateur.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Popup info detaille user 
				<div className="hidden fixed inset-0 bg-black/50 flex items-center justify-center">
					<h4>test {user.id}</h4>
				</div>*/}
			</div>
		</AppLayout>
	);
}
