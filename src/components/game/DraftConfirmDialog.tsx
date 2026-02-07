import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DraftConfirmDialog = ({ open, title, description, onConfirm, onCancel }: Props) => {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-sm tracking-widest uppercase text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs font-body text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="text-xs font-display uppercase tracking-wider bg-muted/30 border-border text-muted-foreground hover:text-foreground"
          >
            No, let me reconsider
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="text-xs font-display uppercase tracking-wider bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30"
          >
            Yes, final answer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DraftConfirmDialog;
