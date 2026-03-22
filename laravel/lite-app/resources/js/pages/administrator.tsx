import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleSlash2, PencilLine, Trash2 } from 'lucide-react';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    id_role?: number | null;
	user_image_file?: string | null;
    created_at?: string | null;
	updated_at?: string | null;
	job?: string | null;
	genre?: string | null;
	preferences?: string | null;
	listen_history?: string | null;
	a2f?: boolean | null;
};

type Props = {
    users: AdminUser[];
};
const age = 20;

type UserEditForm = {
	name: string;
	email: string;
	job: string;
	genre: string;
};

type PopupTheme = 'info' | 'musique' | 'securite';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administrateur',
        href: '/administrator',
    },
];

export default function Administrator({ users }: Props) {
	const [openUpdate, setOpenUpdate] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editForm, setEditForm] = useState<UserEditForm>({
		name: '',
		email: '',
		job: '',
		genre: '',
	});
	const [activeTheme, setActiveTheme] = useState<PopupTheme>('info');
	const [pageActuelle, setPageActuelle] = useState(1);

	const selectedUserStatus = Number(selectedUser?.id_role ?? 2) === 1 ? 'Privé' : 'Public';
	const nbTotalUser = users.length;
	const nbUserParPage = 10;
	const nbPages = Math.max(1, Math.ceil(nbTotalUser / nbUserParPage));
	const premierUtilisateur = nbTotalUser === 0 ? 0 : (pageActuelle - 1) * nbUserParPage + 1;
	const dernierUtilisateur = Math.min(pageActuelle * nbUserParPage, nbTotalUser);
	const usersPage = users.slice((pageActuelle - 1) * nbUserParPage, pageActuelle * nbUserParPage);

	useEffect(() => {
		if (pageActuelle > nbPages) {
			setPageActuelle(nbPages);
		}
	}, [pageActuelle, nbPages]);

	const openUserDialog = (user: AdminUser, editMode = false) => {
		setSelectedUser(user);
		setEditForm({
			name: user.name ?? '',
			email: user.email ?? '',
			job: user.job ?? '',
			genre: user.genre ?? '',
		});
		setIsEditMode(editMode);
		setActiveTheme('info');
		setOpenUpdate(true);
	};

	const updateUser = (user: AdminUser) => {
		openUserDialog(user, false);
	};

	const editUser = (user: AdminUser) => {
		openUserDialog(user, true);
	};

	const deleteUser = (user: AdminUser) => {
		setSelectedUser(user);
		setOpenDelete(true)
	};

	const confirmDeleteUser = () => {
		if (!selectedUser) {
			return;
		}

		setIsDeleting(true);

		router.delete(`/administrator/users/${selectedUser.id}`, {
			preserveScroll: true,
			onSuccess: () => {
				setOpenDelete(false);
				setOpenUpdate(false);
				setSelectedUser(null);
			},
			onFinish: () => {
				setIsDeleting(false);
			},
		});
	};

	const pageSuiv = () => {
		setPageActuelle((prev) => Math.min(prev + 1, nbPages));
	};

	const pagePrev = () => {
		setPageActuelle((prev) => Math.max(prev - 1, 1));
	};

	const pageDeb = () => {
		setPageActuelle(1);
	};

	const pageEnd = () => {
		setPageActuelle(nbPages);
	};
	
	const getUserInitial = (name?: string | null) => {
		const initial = name?.trim().charAt(0).toUpperCase();
		return initial || '?';
	};

	const getUserImageSrc = (user?: AdminUser | null) => {
		const rawFile = user?.user_image_file?.trim();

		if (!rawFile) {
			return null;
		}

		if (
			rawFile.startsWith('http://') ||
			rawFile.startsWith('https://') ||
			rawFile.startsWith('/image/') ||
			rawFile.startsWith('/images/')
		) {
			return rawFile;
		}

		return `/image/${encodeURIComponent(rawFile)}`;
	};

	const selectedUserImageSrc = getUserImageSrc(selectedUser);

	const closeUpdateDialog = (open: boolean) => {
		setOpenUpdate(open);
		if (!open) {
			setIsEditMode(false);
		}
	};

	const handleValidate = () => {
		if (isEditMode && selectedUser) {
			setSelectedUser({
				...selectedUser,
				name: editForm.name,
				email: editForm.email,
				job: editForm.job,
				genre: editForm.genre,
			});
			setIsEditMode(false);
			return;
		}

		setOpenUpdate(false);
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Administrateur" />
			<div className="mx-auto w-full max-w-5xl px-4 py-10">
				<h1 className="text-2xl font-bold">Espace administrateur</h1>

				{/* Stat */}
				<div> 
					<div className="mt-6 flex gap-4">
						<div className="flex-1 rounded-lg bg-muted/100 p-4 text-center">
							<p className="text-sm text-muted-foreground">Nombre total d'utilisateurs</p>
							<p className="mt-2 text-2xl font-semibold">{users.length}</p>
						</div>
						<div className="flex-1 rounded-lg bg-muted/100 p-4 text-center">
							<p className="text-sm text-muted-foreground">Nombre d'administrateurs</p>
							<p className="mt-2 text-2xl font-semibold">{users.filter(user => Number(user.id_role ?? 2) === 1).length}</p>
						</div>
					</div>
				</div>

				{/* Filtre / trie user + recherche */}
				<div className="mt-6">
					{/*<form method="get" action="/search" className="w-full">
						 <input
							type="text"
							name="q"
							placeholder="Rechercher un utilisateur..."
							className="rounded-md border px-4 py-2 w-full"
						/>
                        </form>
                        <Search className="absolute top-1/2 right-1 -translate-y-1/2 p-1" /> */}
					<div className="mt-6 flex items-center gap-4">
						imagine des filtre et trie
						<Button className="px-4 py-2 cursor-pointer">
							Trier
						</Button>
					</div>
				</div>

				{/* Liste user */}
				<div className="mt-6 overflow-x-auto rounded-lg border">
					<table className="min-w-full text-left text-sm">
						<thead className="bg-muted/100">
							<tr>
								<th className="px-4 py-3 font-medium">Utilisateur</th>
								<th className="px-4 py-3 font-medium">Rôle</th>
								<th className="px-4 py-3 font-medium">Créé le</th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{usersPage.map((user) => {
								const userImageSrc = getUserImageSrc(user);
								return (
								<tr
									key={user.id}
									className="cursor-pointer border-t hover:bg-muted/100"
									onClick={() => updateUser(user)}
								>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage src={userImageSrc ?? undefined} alt={user.name} className="object-cover" />
												<AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary dark:bg-neutral-700 dark:text-white">
													{getUserInitial(user.name)}
												</AvatarFallback>
											</Avatar>
											<span>{user.name}</span>
										</div>
									</td>
									<td className="px-4 py-3">
										<span
											className={
												'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ' +
												(Number(user.id_role ?? 2) === 1
														? 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200'
														: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200')
											}
										>
											{Number(user.id_role ?? 2) === 1 ? 'Admin' : 'Utilisateur'}
										</span>
									</td>
									<td className="px-4 py-3">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</td>
									<td> <Button onClick={(event) => {
										event.stopPropagation();
										editUser(user)}
										} size="sm" className='cursor-pointer'><PencilLine /></Button></td>
									<td> <Button onClick={(event) => {
										event.stopPropagation();
										deleteUser(user)}
										} size="sm" className="cursor-pointer bg-destructive hover:bg-destructive/80"><Trash2 /></Button></td>
								</tr>
								);
							})}
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
				{/* Pagination */}
				<div className="flex flex-row justify-between mt-4 text-sm text-muted-foreground items-center">
					<div>
						<p>Affichage des utilisateurs de {premierUtilisateur} à {dernierUtilisateur} sur {nbTotalUser}</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						<Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" onClick={pageDeb} disabled={pageActuelle === 1}><ChevronsLeft /></Button>
						<Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" onClick={pagePrev} disabled={pageActuelle === 1}><ChevronLeft /></Button>
						<p> Page {pageActuelle} sur {nbPages}</p>
						<Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" onClick={pageSuiv} disabled={pageActuelle === nbPages}><ChevronRight /></Button>
						<Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" onClick={pageEnd} disabled={pageActuelle === nbPages}><ChevronsRight /></Button>
					</div>
				</div>

				{/* Popup info detaille user */}
				<Dialog open={openUpdate} onOpenChange={closeUpdateDialog}>
					<DialogContent className="sm:max-w-3xl">
						<DialogHeader className="flex w-full flex-row items-center justify-between gap-4 rounded-md bg-muted/100 p-4 mt-4">
							<Avatar className="h-16 w-16 border-2 border-primary/20 bg-background">
								<AvatarImage src={selectedUserImageSrc ?? undefined} alt={selectedUser?.name} className="object-cover" />
								<AvatarFallback className="text-xl font-semibold bg-primary/20 text-primary dark:bg-neutral-700 dark:text-white">
									{getUserInitial(selectedUser?.name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-1 flex-col items-center justify-center text-center">
								<DialogTitle>{selectedUser?.name}</DialogTitle>
								<DialogDescription className="font-medium">
									{isEditMode ? 'Mode édition' : `Mode consultation`}
								</DialogDescription>
							</div>
							<div className="flex items-center gap-2">
								<Button
									size="sm"
									className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
									onClick={() => setIsEditMode(true)}
								>
									<PencilLine />
								</Button>
								<Button size="sm" className="cursor-pointer bg-destructive text-white hover:bg-destructive/80" onClick={() => setOpenDelete(true)}>
									<Trash2 />
								</Button>
							</div>
						</DialogHeader>
						<nav className="flex w-full items-center justify-center text-sm">
							<div className="flex items-center gap-2">
								<button type="button" onClick={() => setActiveTheme('info')} className={activeTheme === 'info' ? 'font-semibold text-primary underline underline-offset-4 hover:text-primary/80' : 'text-muted-foreground hover:text-primary'}>
									Informations
								</button>
								<span className="text-muted-foreground">|</span>
								<button type="button" onClick={() => setActiveTheme('securite')} className={activeTheme === 'securite' ? 'font-semibold text-primary underline underline-offset-4 hover:text-primary/80' : 'text-muted-foreground hover:text-primary'}>
									Sécurité
								</button>
							</div>
						</nav>

						{/* Informations */}
						{selectedUser && activeTheme === 'info' && (
							<div className="mt-4 grid grid-cols-1 gap-10 text-sm md:grid-cols-2 md:justify-items-center">
								<div className='flex w-full max-w-xs flex-col gap-2'>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">Identifiant : </span> {selectedUser.id ?? <CircleSlash2 size={14}/>}
									</p>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">Email : </span>
										{isEditMode ? (
											<Input
												value={editForm.email}
												onChange={(event) =>
													setEditForm((prev) => ({ ...prev, email: event.target.value }))
												}
												className="h-8"
											/>
										) : (
											selectedUser.email ?? <CircleSlash2 size={14} />
										)}
									</p>
									<p  className="flex flex-row items-center gap-1">
										<span className="font-medium">Genre : </span>
										{isEditMode ? (
											<Input
												value={editForm.genre}
												onChange={(event) =>
													setEditForm((prev) => ({ ...prev, genre: event.target.value }))
												}
												className="h-8"
											/>
										) : (
											selectedUser.genre ?? <CircleSlash2 size={14} />
										)}
									</p>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">Rôle : </span>{' '}
										{Number(selectedUser.id_role ?? 2) === 1 ? 'Admin' : 'Utilisateur'}
									</p>
									
								</div>
								<div className='flex w-full max-w-xs flex-col gap-2'>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">Nom :</span>
										{isEditMode ? (
											<Input
												value={editForm.name}
												onChange={(event) =>
													setEditForm((prev) => ({ ...prev, name: event.target.value }))
												}
												className="h-8"
											/>
										) : (
											selectedUser.name ?? <CircleSlash2 size={14} />
										)}
									</p>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">Age :</span> {age ? `${age} ans` : <CircleSlash2 size={14}/>}
									</p>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">Job :</span>
										{isEditMode ? (
											<Input
												value={editForm.job}
												onChange={(event) =>
													setEditForm((prev) => ({ ...prev, job: event.target.value }))
												}
												className="h-8"
											/>
										) : (
											selectedUser.job ?? <CircleSlash2 size={14} />
										)}
									</p>
								</div>
							</div>
						)}

						{/* Sécurité */}
						{selectedUser && activeTheme === 'securite' && (
							<div className="mt-4 space-y-2 text-sm">
								{/* Passer admin, reset mdp, savoir si a2f ou non, stattut*/}
								<p className="flex flex-row items-center gap-1">
									<span className="font-medium">Statut du compte :</span> {selectedUserStatus ?? <CircleSlash2 size={14}/>}
								</p>
								<p className="flex flex-row items-center gap-1">
									<span className="font-medium">A2F :</span> {selectedUser.a2f ?? <CircleSlash2 size={14}/>}
								</p>
							</div>
						)}

						{selectedUser && (
							<div className='flex flex-row justify-around align-center text-sm mt-4 gap-10'>
								<p>
									<span className="font-medium">Créé le :</span>{' '}
									{selectedUser.created_at
										? new Date(selectedUser.created_at).toLocaleDateString('fr-FR')
										: '—'}
								</p>
								<p>
									<span className="font-medium">Mis à jour le :</span>{' '}
									{selectedUser.updated_at
										? new Date(selectedUser.updated_at).toLocaleDateString('fr-FR')
										: '—'}
								</p>
							</div>
						)}

						<div className="mt-6 flex justify-end gap-2">
							{isEditMode ? (
								<>
									<Button type="button" className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400" onClick={handleValidate}>
										Valider
									</Button>
									<Button type="button" className="cursor-pointer bg-muted-foreground text-black hover:bg-muted-foreground/80" onClick={() => setOpenUpdate(false)}>
										Annuler
									</Button>
								</>
							) : (
								<Button type="button" className="cursor-pointer bg-muted-foreground text-black hover:bg-muted-foreground/80" onClick={() => setOpenUpdate(false)}>
									Fermer
								</Button>
							)}
						</div>
					</DialogContent>
				</Dialog>

				{/* Popup supprimer user */}
				<Dialog open={openDelete} onOpenChange={setOpenDelete}>
					<DialogContent>
						<p>Êtes-vous sûr de vouloir supprimer {selectedUser?.name} ?</p>
						<div className="mt-6 flex justify-end gap-2">
							<Button type="button" variant="outline" className="cursor-pointer" onClick={() => setOpenDelete(false)} disabled={isDeleting}>
								Annuler
							</Button>
							<Button type="button" variant="destructive" className="cursor-pointer" onClick={confirmDeleteUser} disabled={isDeleting || !selectedUser}>
								{isDeleting ? 'Suppression...' : 'Supprimer'}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</AppLayout>
	);
}
