import { Modal } from './Modal';
import './CommandReference.css';

export interface ManPageEntry {
  name: string;
  synopsis: string;
  description: string;
}

interface CommandReferenceProps {
  entry: ManPageEntry;
  onClose: () => void;
}

/** A single "man page" popup for one shell command or operator. Reusable across chapters. */
export function CommandReference({ entry, onClose }: CommandReferenceProps) {
  return (
    <Modal title={`man ${entry.name}`} onClose={onClose} closeLabel="Закрыть">
      <p className="command-reference__synopsis">
        <code>{entry.synopsis}</code>
      </p>
      <p>{entry.description}</p>
    </Modal>
  );
}
