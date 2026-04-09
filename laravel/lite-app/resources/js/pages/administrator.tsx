import { router, usePage } from '@inertiajs/react';
import { Head } from '@/components/head';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GENDER_OPTIONS, JOB_OPTIONS, ROLE_OPTIONS } from '@/lib/user-options';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleSlash2, Eye, EyeClosed, ListFilter, PencilLine, Search, Trash2 } from 'lucide-react';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    id_role?: number | null;
	public_profile_visibility?: boolean | null;
	user_image_file?: string | null;
    created_at?: string | null;
	updated_at?: string | null;
	user_job?: string | null;
	user_gender?: string | null;
	preferences?: string | null;
	listen_history?: string | null;
	two_factor_enabled?: boolean | null;
	user_age?: number | null;
};

type Props = {
    users: AdminUser[];
};

type UserEditForm = {
	name: string;
	email: string;
	user_job: string;
	user_gender: string;
	user_age?: number | null;
};

type UserCreateForm = {
	name: string;
	email: string;
	password: string;
	user_job: string;
	user_gender: string;
	user_age?: number | null;
};

type PopupTheme = 'info' | 'musique' | 'securite';
type trieChamps = 'name' | 'id_role' | 'created_at';
type trieSens = 'asc' | 'desc';
type filtreRole = 'all' | 'admin' | 'user';
type filtreGenre = 'all' | (typeof GENDER_OPTIONS)[number];
type filtreJob = 'all' | (typeof JOB_OPTIONS)[number];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administrateur',
        href: '/administrator',
    },
];

export default function Administrator({ users }: Props) {
	const [openUpdate, setOpenModification] = useState(false);
	const [openCreate, setOpenCreate] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [openChangeRole, setOpenChangeRole] = useState(false);
	const [openChangeStatut, setOpenChangeStatut] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [showCreatePassword, setShowCreatePassword] = useState(false);
	const [isChangingRole, setIsChangingRole] = useState(false);
	const [isChangingStatut, setIsChangingStatut] = useState(false);
	const [editEmailError, setEditEmailError] = useState('');
	const [createEmailError, setCreateEmailError] = useState('');
	const [selectedUser, setSelectUser] = useState<AdminUser | null>(null);
	const [isEditMode, setModeEdition] = useState(false);
	const [editForm, setEditForm] = useState<UserEditForm>({
		name: '',
		email: '',
		user_job: '',
		user_gender: '',
		user_age: null,
	});
	const [createForm, setCreateForm] = useState<UserCreateForm>({
		name: '',
		email: '',
		password: '',
		user_job: '',
		user_gender: '',
		user_age: null,
	});
	const [activeTheme, setActiveTheme] = useState<PopupTheme>('info');
	const [pageActuelle, setPageActuelle] = useState(1);
	const [recherche, setTrieRecherche] = useState('');
	const [identifiant, setTrieIdentifiant] = useState('');
	const [filtreRole, setTrieRole] = useState<filtreRole>('all');
	const [filtreGenre, setTrieGenre] = useState<filtreGenre>('all');
	const [filtreJob, setTrieJob] = useState<filtreJob>('all');
	const [filtreDateCreationApres, setTrieDateCreationApres] = useState('');
	const [filtreDateCreationAvant, setTrieDateCreationAvant] = useState('');
	const [filtreAgeA, setTrieAgeA] = useState('');
	const [filtreAgeB, setTrieAgeB] = useState('');
	const [trieChamps, settrieChamps] = useState<trieChamps>('name');
	const [trieSens, sensTrie] = useState<trieSens>('asc');
	const { auth } = usePage<SharedData>().props;
	const currentUserId = auth.user.id;

	const formatDateForInput = (dateValue?: string | null) => {
		if (!dateValue) {
			return '';
		}

		const date = new Date(dateValue);
		if (Number.isNaN(date.getTime())) {
			return '';
		}

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	};

	const emailVerif = (email: string) => email.includes('@');

	const filtreUser = useMemo(() => {
		const rechercheClean = recherche.trim().toLowerCase();
		const ageValeurA = filtreAgeA.trim();
		const ageValeurB = filtreAgeB.trim();
		const ageNombreA = ageValeurA === '' ? null : Number(ageValeurA);
		const ageNombreB = ageValeurB === '' ? null : Number(ageValeurB);
		const bornesAge = [ageNombreA, ageNombreB].filter(
			(age): age is number => age !== null && !Number.isNaN(age),
		);
		const ageMinimum = bornesAge.length === 2 ? Math.min(...bornesAge) : ageNombreA;
		const ageMaximum = bornesAge.length === 2 ? Math.max(...bornesAge) : ageNombreB;

		return users.filter((user) => {
			const userRole = Number(user.id_role ?? 2);
			const userName = (user.name ?? '').toLowerCase();
			const userEmail = (user.email ?? '').toLowerCase();
			const userCreationDate = formatDateForInput(user.created_at);
			const userAge = user.user_age;
			const ageManquant = userAge == null;

			const matchesSearch = rechercheClean.length === 0 || userName.includes(rechercheClean) || userEmail.includes(rechercheClean);
			const matchesIdentifiant = identifiant.length === 0 || (user.id && user.id.toString() === identifiant);
			const matchesRole = filtreRole === 'all' || (filtreRole === 'admin' && userRole === 1) || (filtreRole === 'user' && userRole !== 1);
			const matchesGenre = filtreGenre === 'all' || (user.user_gender ?? '').trim().toLowerCase() === filtreGenre.toLowerCase();
			const matchesJob = filtreJob === 'all' || (user.user_job ?? '').trim().toLowerCase() === filtreJob.toLowerCase();
			const matchesCreatedAtAfter = filtreDateCreationApres.length === 0 || (userCreationDate.length > 0 && userCreationDate >= filtreDateCreationApres);
			const matchesCreatedAtBefore = filtreDateCreationAvant.length === 0 || (userCreationDate.length > 0 && userCreationDate <= filtreDateCreationAvant);
			const matchesAge = (() => {
				if (ageMinimum === null && ageMaximum === null) {
					return true;
				}

				if (ageManquant) {
					return ageMinimum === null || ageMaximum === null;
				}

				if (ageMinimum !== null && userAge < ageMinimum) {
					return false;
				}

				if (ageMaximum !== null && userAge > ageMaximum) {
					return false;
				}

				return true;
			})();

			return ( matchesSearch && matchesIdentifiant && matchesRole && matchesGenre && matchesJob && matchesCreatedAtAfter && matchesCreatedAtBefore && matchesAge);
		});
	}, [users, recherche, identifiant, filtreRole, filtreGenre, filtreJob, filtreDateCreationApres, filtreDateCreationAvant, filtreAgeA, filtreAgeB]);

	const trieUsers = useMemo(() => {
		const usersAFiltrer = [...filtreUser];

		usersAFiltrer.sort((a, b) => {
			let comparison = 0;

			if (trieChamps === 'id_role') {
				comparison = Number(a.id_role ?? 2) - Number(b.id_role ?? 2);
			} else if (trieChamps === 'created_at') {
				const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
				const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
				comparison = aDate - bDate;
			} else {
				comparison = (a.name ?? '').localeCompare(b.name ?? '', 'fr', {
					sensitivity: 'base',
				});
			}

			return trieSens === 'asc' ? comparison : -comparison;
		});

		return usersAFiltrer;
	}, [filtreUser, trieChamps, trieSens]);

	const statusCompteUser = selectedUser
		? (selectedUser.public_profile_visibility ? 'Public' : 'Privé')
		: null;
	const nbTotalUser = trieUsers.length;
	const nbAdmin = trieUsers.filter((user) => Number(user.id_role ?? 2) === 1).length;
	const nbUserParPage = 10;
	const nbPages = Math.max(1, Math.ceil(nbTotalUser / nbUserParPage));
	const premierUtilisateur = nbTotalUser === 0 ? 0 : (pageActuelle - 1) * nbUserParPage + 1;
	const dernierUtilisateur = Math.min(pageActuelle * nbUserParPage, nbTotalUser);
	const usersPage = trieUsers.slice((pageActuelle - 1) * nbUserParPage, pageActuelle * nbUserParPage);

	useEffect(() => {
		if (pageActuelle > nbPages) {
			setPageActuelle(nbPages);
		}
	}, [pageActuelle, nbPages]);

	useEffect(() => {
		setPageActuelle(1);
	}, [recherche, identifiant, filtreRole, filtreGenre, filtreJob, filtreDateCreationApres, filtreDateCreationAvant, filtreAgeA, filtreAgeB]);

	const openPopupUser = (user: AdminUser, editMode = false) => {
		setSelectUser(user);
		setEditEmailError('');
		setEditForm({
			name: user.name ?? '',
			email: user.email ?? '',
			user_job: user.user_job ?? '',
			user_gender: user.user_gender ?? '',
			user_age: user.user_age ?? null,
		});
		setModeEdition(editMode);
		setActiveTheme('info');
		setOpenModification(true);
	};

	const updateUser = (user: AdminUser) => {
		openPopupUser(user, false);
	};

	const editUser = (user: AdminUser) => {
		openPopupUser(user, true);
	};

	const deleteUser = (user: AdminUser) => {
		if (user.id === currentUserId) {
			return;
		}

		setSelectUser(user);
		setOpenDelete(true)
	};

	const confirmDeleteUser = () => {
		if (!selectedUser) {
			return;
		}

		if (selectedUser.id === currentUserId) {
			setOpenDelete(false);
			return;
		}

		setIsDeleting(true);

		router.delete(`/administrator/users/${selectedUser.id}`, {
			preserveScroll: true,
			onSuccess: () => {
				setOpenDelete(false);
				setOpenModification(false);
				setSelectUser(null);
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
		const fileProfile = user?.user_image_file?.trim();

		if (!fileProfile) {
			return null;
		}

		if (
			fileProfile.startsWith('http://') ||
			fileProfile.startsWith('https://') ||
			fileProfile.startsWith('/image/') ||
			fileProfile.startsWith('/images/')
		) {
			return fileProfile;
		}

		return `/image/${encodeURIComponent(fileProfile)}`;
	};

	const selectedUserImageSrc = getUserImageSrc(selectedUser);

	const closeUpdateDialog = (open: boolean) => {
		setOpenModification(open);
		if (!open) {
			setModeEdition(false);
		}
	};

	const handleValidate = () => {
		if (isEditMode && selectedUser) {
			if (!emailVerif(editForm.email.trim())) {
				setEditEmailError("L'email doit contenir un @.");
				return;
			}

			setEditEmailError('');

			router.patch(`/administrator/users/${selectedUser.id}`, editForm, {
				preserveScroll: true,
				onSuccess: () => {
					setSelectUser({
						...selectedUser,
						name: editForm.name,
						email: editForm.email,
						user_job: editForm.user_job,
						user_gender: editForm.user_gender,
						user_age: editForm.user_age,
					});
					setModeEdition(false);
				},
			});
			return;
		}

		setOpenModification(false);
	};

	const handleChangeRole = (user: AdminUser) => {
		setSelectUser(user);
		setOpenChangeRole(true)
	};

	const confirmChangeRoleUser = () => {
		if (!selectedUser) {
			return;
		}

		setIsChangingRole(true);

		router.patch(`/administrator/users/${selectedUser.id}/role`, {}, {
			preserveScroll: true,
			onSuccess: () => {
				setSelectUser((prev) => {
					if (!prev) {
						return prev;
					}

					return {
						...prev,
						id_role: Number(prev.id_role ?? 2) === 1 ? 2 : 1,
					};
				});
				setOpenChangeRole(false);
			},
			onFinish: () => {
				setIsChangingRole(false);
			},
		});
	};

	const handleChangeStatut = (user: AdminUser) => {
		setSelectUser(user);
		setOpenChangeStatut(true)
	};

	const confirmChangeStatutUser = () => {
		if (!selectedUser) {
			return;
		}

		setIsChangingStatut(true);

		router.patch(`/administrator/users/${selectedUser.id}/statut`, {}, {
			preserveScroll: true,
			onSuccess: () => {
				setSelectUser((prev) => {
					if (!prev) {
						return prev;
					}

					return {
						...prev,
						public_profile_visibility: !prev.public_profile_visibility,
					};
				});
				setOpenChangeStatut(false);
			},
			onFinish: () => {
				setIsChangingStatut(false);
			},
		});
	};

	const handleSort = (field: trieChamps) => {
		if (trieChamps === field) {
			sensTrie((prev) => (prev === 'asc' ? 'desc' : 'asc'));
			return;
		}

		settrieChamps(field);
		sensTrie('asc');
	};

	const resetFiltre = () => { setTrieRecherche('');
		setTrieIdentifiant('');
		setTrieRole('all');
		setTrieGenre('all');
		setTrieJob('all');
		setTrieDateCreationApres('');
		setTrieDateCreationAvant('');
		setTrieAgeA('');
		setTrieAgeB('');
	};

	const genererMotDePasseTempo = () => {
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
		const length = 14;
		let password = '';

		for (let i = 0; i < length; i += 1) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		setCreateForm((prev) => ({ ...prev, password }));
	};

	const openCreateDialog = () => {
		setCreateEmailError('');
		setCreateForm({
			name: '',
			email: '',
			password: '',
			user_job: '',
			user_gender: '',
			user_age: null,
		});
		setShowCreatePassword(false);
		setOpenCreate(true);
		genererMotDePasseTempo();
	};

	const handleCreateUser = () => {
		if (!emailVerif(createForm.email.trim())) {
			setCreateEmailError("L'email doit contenir un @.");
			return;
		}

		setCreateEmailError('');

		if (!createForm.password) {
			genererMotDePasseTempo();
		}

		setIsCreating(true);

		const motDePasse = {
			...createForm,
			password: createForm.password || (() => {
				const lettres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
				const length = 14;
				let password = '';
				for (let i = 0; i < length; i += 1) {
					password += lettres.charAt(Math.floor(Math.random() * lettres.length));
				}
				return password;
			})(),
		};

		router.post('/administrator/users', motDePasse, {
			preserveScroll: true,
			onSuccess: () => {
				setOpenCreate(false);
				setCreateForm({
					name: '',
					email: '',
					password: '',
					user_job: '',
					user_gender: '',
					user_age: null,
				});
			},
			onFinish: () => {
				setIsCreating(false);
			},
		});
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head
				title="Administrateur"
				description="Administrez les utilisateurs de la plateforme, gérez leurs rôles, leurs informations et les actions de modération."
			/>
			<div className="mx-auto w-full max-w-5xl px-4 py-10">
				<h1 className="text-2xl font-bold">Espace administrateur</h1>

				{/* Filtre / tri users */}
				<div className="mt-6 rounded-lg border bg-muted/30 p-4">
					<div className="mb-3 flex items-center gap-2 text-sm font-medium">
						<ListFilter className="h-4 w-4" />
						<span>Filtres</span>
					</div>

					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
						<div className="space-y-1 col-span-2">
							<p className="text-xs text-muted-foreground">Recherche</p>
							<div className="relative">
								<Input
									type="text"
									placeholder="Rechercher un utilisateur..."
									value={recherche}
									onChange={(event) => setTrieRecherche(event.target.value)}
									className="pr-8"
								/>
								<Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							</div>
						</div>

						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Date de création après le : </p>
							<Input
								type="date"
								value={filtreDateCreationApres}
								onChange={(event) => setTrieDateCreationApres(event.target.value)}
							/>
						</div>

						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Date de création avant le : </p>
							<Input
								type="date"
								value={filtreDateCreationAvant}
								onChange={(event) => setTrieDateCreationAvant(event.target.value)}
							/>
						</div>

						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Rôle</p>
							<select
								value={filtreRole}
								onChange={(event) => setTrieRole(event.target.value as filtreRole)}
								className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
							>
								<option value="all">Tous</option>
								{ROLE_OPTIONS.map((role) => (
									<option key={role} value={role === 'Administrateur' ? 'admin' : 'user'}>{role} </option>
								))}
							</select>
						</div>

						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Genre</p>
							<select
								value={filtreGenre}
								onChange={(event) => setTrieGenre(event.target.value as filtreGenre)}
								className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
							>
								<option value="all">Tous</option>
								{GENDER_OPTIONS.map((genre) => (
									<option key={genre} value={genre}>{genre} </option>
								))}
							</select>
						</div>

						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Profession</p>
							<select
								value={filtreJob}
								onChange={(event) => setTrieJob(event.target.value as filtreJob)}
								className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
							>
								<option value="all">Tous</option>
								{JOB_OPTIONS.map((job) => (
									<option key={job} value={job}>{job} </option>
								))}
							</select>
						</div>

						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">Âge</p>
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground">Entre</span>
								<Input
									type="number"
									min="0"
									placeholder="0"
									value={filtreAgeA}
									onChange={(event) => setTrieAgeA(event.target.value)}
								/>
								<span className="text-xs text-muted-foreground">et</span>
								<Input
									type="number"
									min="0"
									placeholder="100"
									value={filtreAgeB}
									onChange={(event) => setTrieAgeB(event.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="mt-4 flex justify-end">
						<Button type="button" className="cursor-pointer" onClick={resetFiltre}>
							Réinitialiser les filtres
						</Button>
					</div>
				</div>

				{/* Stat */}
				<div> 
					<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
						<div className="flex-1 rounded-lg bg-muted/100 p-4 text-center">
							<p className="text-sm text-muted-foreground">Nombre d'utilisateurs</p>
							<p className="mt-2 text-2xl font-semibold">{nbTotalUser - nbAdmin}</p>
						</div>
						<div className="flex-1 rounded-lg bg-muted/100 p-4 text-center">
							<p className="text-sm text-muted-foreground">Nombre d'administrateurs</p>
							<p className="mt-2 text-2xl font-semibold">{nbAdmin}</p>
						</div>
						<div className="flex-1 rounded-lg bg-muted/100 p-4 text-center">
							<p className="text-sm text-muted-foreground">Nombre total</p>
							<p className="mt-2 text-2xl font-semibold">{nbTotalUser}</p>
						</div>
					</div>
				</div>

				{/* Créer user */}
				<div className="mt-4 flex justify-end"> 
					<Button onClick={openCreateDialog} className="cursor-pointer">Créer un utilisateur</Button>
				</div>

				{/* Liste user */}
				<div className="mt-6 overflow-x-auto rounded-lg border">
					<table className="min-w-full text-left text-sm">
						<thead className="bg-muted/100">
							<tr>
								<th className="px-3 py-3 font-medium cursor-pointer sm:px-4"><button type="button" className="flex flex-row gap-2 cursor-pointer" onClick={() => handleSort('name')}> Utilisateur <ArrowUpDown className="h-4 w-4" /></button></th>
								<th className="px-3 py-3 font-medium cursor-pointer sm:px-4"><button type="button" className="flex flex-row gap-2 cursor-pointer" onClick={() => handleSort('id_role')}> Rôle <ArrowUpDown className="h-4 w-4" /></button></th>
								<th className="hidden px-3 py-3 font-medium cursor-pointer md:table-cell sm:px-4"><button type="button" className="flex flex-row gap-2 cursor-pointer" onClick={() => handleSort('created_at')}> Créé le <ArrowUpDown className="h-4 w-4" /></button></th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{usersPage.map((user) => {
								const userImageSrc = getUserImageSrc(user);
								const canDeleteUser = user.id !== currentUserId;
								return (
								<tr
									key={user.id}
									className="cursor-pointer border-t hover:bg-muted/100"
									onClick={() => updateUser(user)}
								>
									<td className="px-3 py-3 sm:px-4">
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarImage src={userImageSrc ?? undefined} alt={user.name} className="object-cover" />
												<AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary dark:bg-neutral-700 dark:text-foreground">
													{getUserInitial(user.name)}
												</AvatarFallback>
											</Avatar>
											<span>{user.name}</span>
										</div>
									</td>
									<td className="px-3 py-3 sm:px-4">
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
									<td className="hidden px-3 py-3 md:table-cell sm:px-4">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</td>
									<td className="px-1 py-2 sm:px-2"> <Button onClick={(event) => {
										event.stopPropagation();
										editUser(user)}
										} size="icon" className="h-8 w-8 cursor-pointer"><PencilLine className="h-4 w-4" /></Button></td>
									<td className="px-1 py-2 sm:px-2">
										{canDeleteUser ? (
											<Button onClick={(event) => {
												event.stopPropagation();
												deleteUser(user)}
												} size="icon" className="h-8 w-8 cursor-pointer bg-destructive hover:bg-destructive/80"><Trash2 className="h-4 w-4" /></Button>
										) : null}
									</td>
								</tr>
								);
							})}
							{nbTotalUser === 0 && (
								<tr>
									<td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
										Aucun utilisateur ne correspond aux filtres.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				{/* Pagination */}
				<div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
					<div>
						<p>Affichage des utilisateurs de {premierUtilisateur} à {dernierUtilisateur} sur {nbTotalUser}</p>
					</div>
					<div className="flex flex-row items-center gap-2 self-end sm:self-auto">
						<Button className="h-8 w-8 cursor-pointer bg-primary p-0 text-primary-foreground hover:bg-primary/90" onClick={pageDeb} disabled={pageActuelle === 1}><ChevronsLeft className="h-4 w-4" /></Button>
						<Button className="h-8 w-8 cursor-pointer bg-primary p-0 text-primary-foreground hover:bg-primary/90" onClick={pagePrev} disabled={pageActuelle === 1}><ChevronLeft className="h-4 w-4" /></Button>
						<p> Page {pageActuelle} sur {nbPages}</p>
						<Button className="h-8 w-8 cursor-pointer bg-primary p-0 text-primary-foreground hover:bg-primary/90" onClick={pageSuiv} disabled={pageActuelle === nbPages}><ChevronRight className="h-4 w-4" /></Button>
						<Button className="h-8 w-8 cursor-pointer bg-primary p-0 text-primary-foreground hover:bg-primary/90" onClick={pageEnd} disabled={pageActuelle === nbPages}><ChevronsRight className="h-4 w-4" /></Button>
					</div>
				</div>

				{/* Popup info detaille user */}
				<Dialog open={openUpdate} onOpenChange={closeUpdateDialog}>
					<DialogContent className="sm:max-w-3xl">
						<DialogHeader className="flex w-full flex-row items-center justify-between gap-4 rounded-md bg-muted/100 p-4 mt-4">
							<Avatar className="h-16 w-16 border-2 border-primary/20 bg-background">
								<AvatarImage src={selectedUserImageSrc ?? undefined} alt={selectedUser?.name} className="object-cover" />
								<AvatarFallback className="text-xl font-semibold bg-primary/20 text-primary dark:bg-neutral-700 dark:text-foreground">
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
								{!isEditMode && (
									<Button size="sm" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setModeEdition(true)} ><PencilLine /> </Button>
								)}
								{selectedUser?.id !== currentUserId ? (
									<Button size="sm" className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/80" onClick={() => setOpenDelete(true)}>
										<Trash2 />
									</Button>
								) : null}
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
												className="h-8 w-60"
											/>
										) : (
											selectedUser.email ?? <CircleSlash2 size={14} />
										)}
									</p>
										{isEditMode && editEmailError && (
											<p className="text-xs text-red-500">{editEmailError}</p>
										)}
									<p  className="flex flex-row items-center gap-1">
										<span className="font-medium">Genre : </span>
										{isEditMode ? (
											<select
												value={editForm.user_gender}
												onChange={(event) =>
													setEditForm((prev) => ({ ...prev, user_gender: event.target.value }))
												}
												className="h-8 w-60 border rounded-md border-input bg-background px-3 py-1 text-sm shadow-xs"
											>
												<option value=""></option>
												{GENDER_OPTIONS.map((genre) => (
													<option key={genre} value={genre}>{genre} </option>
												))}
											</select>
										) : (
											selectedUser.user_gender ?? <CircleSlash2 size={14} />
										)}
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
												className="h-8 w-60"
											/>
										) : (
											selectedUser.name ?? <CircleSlash2 size={14} />
										)}
									</p>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">Age :</span> 
										{isEditMode ? (
											<Input type="number" min="0" placeholder="Age" value={editForm.user_age ?? ''} onChange={(event) => setEditForm((prev) => ({ 
												...prev, 
												user_age: event.target.value === '' 
												? null : Number(event.target.value) 
											}))} className="h-8 w-60 border rounded-md border-input bg-background px-3 py-1 text-sm shadow-xs" />
										) : (
											selectedUser.user_age ? `${selectedUser.user_age} ans` : <CircleSlash2 size={14}/>
										)}
									</p>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">Job :</span>
										{isEditMode ? (
											<select
												value={editForm.user_job}
												onChange={(event) =>
													setEditForm((prev) => ({ ...prev, user_job: event.target.value }))
												}
												className="h-8 w-60 border rounded-md border-input bg-background px-3 py-1 text-sm shadow-xs"
											>
												<option value=""></option>
												{JOB_OPTIONS.map((job) => (
													<option key={job} value={job}>{job} </option>
												))}
											</select>
										) : (
											selectedUser.user_job ?? <CircleSlash2 size={14} />
										)}
									</p>
								</div>
							</div>
						)}

						{/* Sécurité */}
						{selectedUser && activeTheme === 'securite' && (
							<>
								<div className="mt-4 space-y-2 text-sm">
									{/* Passer admin, reset mdp, savoir si a2f ou non, stattut*/}
									<div className="flex flex-row gap-2 items-center">
										<p className="flex flex-row items-center gap-1">
											<span className="font-medium">Statut du compte :</span> {statusCompteUser ?? <CircleSlash2 size={14}/>}
										</p>
										{isEditMode && (
											<Button type="button" className="cursor-pointer" onClick={() => handleChangeStatut(selectedUser)}>
												Changer le statut du compte
											</Button>
										)}
									</div>
									<p className="flex flex-row items-center gap-1">
										<span className="font-medium">A2F :</span>{' '}
										{selectedUser.two_factor_enabled == null
											? <CircleSlash2 size={14} />
											: selectedUser.two_factor_enabled
												? 'Activée'
												: 'Désactivée'}
									</p>
									<div className="flex flex-row gap-2 items-center">
										<p className="flex flex-row items-center gap-1">
											<span className="font-medium">Rôle : </span>{' '}
											{Number(selectedUser.id_role ?? 2) === 1 ? 'Admin' : 'Utilisateur'}
										</p>
										{isEditMode && (
											<Button type="button" className="cursor-pointer" onClick={() => handleChangeRole(selectedUser)}>
												Changer de rôle
											</Button>
										)}
									</div>
								</div>
								{/* Popup change role user */}
								<Dialog open={openChangeRole} onOpenChange={setOpenChangeRole}>
									<DialogContent>
										<p>
											Êtes-vous sûr de vouloir changer le rôle de {selectedUser?.name} en{' '}
											<strong>{Number(selectedUser?.id_role ?? 2) === 1 ? 'Utilisateur' : 'Administrateur'}</strong> ?
										</p>
										<div className="mt-6 flex justify-end gap-2">
											<Button type="button" className="cursor-pointer bg-red-500 text-inverse-foreground hover:bg-red-600" onClick={() => setOpenChangeRole(false)} disabled={isChangingRole}>
												Annuler
											</Button>
											<Button type="button" className="cursor-pointer bg-emerald-500 text-inverse-foreground hover:bg-emerald-600" onClick={confirmChangeRoleUser} disabled={isChangingRole || !selectedUser}>
												{isChangingRole ? 'Mise à jour...' : 'Confirmer'}
											</Button>
										</div>
									</DialogContent>
								</Dialog>
								{/* Popup change statut user */}
								<Dialog open={openChangeStatut} onOpenChange={setOpenChangeStatut}>
									<DialogContent>
										<p>
											Êtes-vous sûr de vouloir passer le compte de {selectedUser?.name} en{' '}
											<strong>{selectedUser?.public_profile_visibility ? 'Privé' : 'Public'}</strong> ?
										</p>
										<div className="mt-6 flex justify-end gap-2">
											<Button type="button" className="cursor-pointer bg-red-500 text-inverse-foreground hover:bg-red-600" onClick={() => setOpenChangeStatut(false)} disabled={isChangingStatut}>
												Annuler
											</Button>
											<Button type="button" className="cursor-pointer bg-emerald-500 text-inverse-foreground hover:bg-emerald-600" onClick={confirmChangeStatutUser} disabled={isChangingStatut || !selectedUser}>
												{isChangingStatut ? 'Mise à jour...' : 'Confirmer'}
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</>
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
									<Button type="button" className="cursor-pointer bg-emerald-600 text-inverse-foreground hover:bg-emerald-700 dark:bg-emerald-500 dark:text-inverse-foreground dark:hover:bg-emerald-400" onClick={handleValidate}>
										Valider
									</Button>
									<Button type="button" className="cursor-pointer bg-red-500 text-inverse-foreground hover:bg-red-600" onClick={() => setOpenModification(false)}>
										Annuler
									</Button>
								</>
							) : (
								<Button type="button" className="cursor-pointer bg-muted-foreground text-inverse hover:bg-muted-foreground/80" onClick={() => setOpenModification(false)}>
									Fermer
								</Button>
							)}
						</div>
					</DialogContent>
				</Dialog>

				{/* Popup creation user */}
				<Dialog open={openCreate} onOpenChange={setOpenCreate}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Créer un utilisateur</DialogTitle>
							<DialogDescription>
								Remplissez les informations ci-dessous pour créer un nouvel utilisateur.
							</DialogDescription>
						</DialogHeader>

						<div className="mt-2 grid gap-3">
							<span className="font-medium">Nom* :</span>
							<Input placeholder="Nom" required value={createForm.name} onChange={
									(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value 
								}))} />
							<span className="font-medium">Email* :</span>
							<Input type="email" placeholder="Email" required value={createForm.email} onChange={
									(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value
								}))}/>
							{createEmailError && <p className="text-xs text-red-500">{createEmailError}</p>}
							<span className="font-medium">Mot de passe* :</span>
							<div className="flex flex-row items-center gap-2">
								<Input type={showCreatePassword ? 'text' : 'password'} required placeholder="Mot de passe temporaire" value={createForm.password} onChange={
										(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value 
									}))}/> 
								<Button type="button" className="cursor-pointer" onClick={
										() => setShowCreatePassword((prev) => !prev
									)}>
									{showCreatePassword ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
								<Button type="button" className="cursor-pointer" onClick={genererMotDePasseTempo} >Régénérer </Button>
								<Button type="button"className="cursor-pointer" onClick={() => {
										void navigator.clipboard.writeText(createForm.password || '');
									}}
									disabled={!createForm.password} > 
									Copier
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								Communiquez ce mot de passe temporaire à l'utilisateur.
							</p>
						</div>

						<div className="mt-6 flex justify-end gap-2">
							<Button type="button" className="cursor-pointer bg-emerald-500 text-inverse-foreground hover:bg-emerald-600" onClick={handleCreateUser} disabled={isCreating}>
								{isCreating ? 'Création...' : 'Créer'}
							</Button>
							<Button type="button" className="cursor-pointer bg-red-500 text-inverse-foreground hover:bg-red-600" onClick={() => setOpenCreate(false)} disabled={isCreating}>
								Annuler
							</Button>
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
