'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
}

export function ImagePreviewDialog({ isOpen, onOpenChange, imageUrl }: ImagePreviewDialogProps) {
  const { t } = useLanguage();
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `bito-ai-generated-image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('imagePreviewTitle')}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center p-4">
          <img src={imageUrl} alt={t('imagePreviewAlt')} className="max-w-full max-h-[70vh] object-contain rounded-md" />
        </div>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t('close')}
            </Button>
          </DialogClose>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t('download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
