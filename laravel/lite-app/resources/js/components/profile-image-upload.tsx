import { router, usePage } from '@inertiajs/react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { deleteMethod, upload } from '@/routes/image';
import type { SharedData } from '@/types';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function ProfileImageUpload() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // L'image est stockée comme filename, on utilise la route /image/{filename}
    const currentImage = user.user_image_file
        ? `/image/${user.user_image_file}`
        : null;

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation côté client
        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp',
        ];
        if (!validTypes.includes(file.type)) {
            alert('Format non supporté. Utilisez JPEG, PNG ou WebP.');
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            alert("L'image ne doit pas dépasser 3 Mo.");
            return;
        }

        // Prévisualisation
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setIsUploading(true);

        router.post(
            upload.url(),
            {
                formData: file,
                table: 'user',
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setPreviewUrl(null);
                    setIsUploading(false);
                },
                onError: (errors) => {
                    console.error('Upload failed:', errors);
                    setPreviewUrl(null);
                    setIsUploading(false);
                    alert("Erreur lors de l'upload de l'image.");
                },
                onFinish: () => {
                    setIsUploading(false);
                },
            },
        );

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = () => {
        if (!currentImage) return;

        if (
            !confirm(
                'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
            )
        ) {
            return;
        }

        setIsDeleting(true);

        router.delete(deleteMethod.url(), {
            data: { table: 'user' },
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
                setIsDeleting(false);
                alert("Erreur lors de la suppression de l'image.");
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const displayImage = previewUrl || currentImage;
    const isLoading = isUploading || isDeleting;

    return (
        <div className="flex items-center gap-6">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    {displayImage ? (
                        <AvatarImage
                            src={displayImage}
                            alt={user.name}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="text-2xl">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>

                {isLoading && (
                    <div className="absolute inset-0 flex items-center/s justify-center rounded-full bg-black/50">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFileSelect}
                    disabled={isLoading}
                    className="cursor-pointer"
                >
                    <Camera className="mr-2 h-4 w-4" />
                    {currentImage ? 'Changer la photo' : 'Ajouter une photo'}
                </Button>

                {currentImage && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                    </Button>
                )}

                <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP. Max 3 Mo.
                </p>
            </div>
        </div>
    );
}
