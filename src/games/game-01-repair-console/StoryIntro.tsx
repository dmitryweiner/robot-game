import { Modal } from '../../components/Modal';

interface StoryIntroProps {
  onStart: () => void;
}

export function StoryIntro({ onStart }: StoryIntroProps) {
  return (
    <Modal title="Глава 1. Ремонтная консоль" onClose={onStart} closeLabel="Начать">
      <p>
        Сегодня утром робот лежит на полу. У него отказали драйверы северного моста — сигналы к
        рукам и ногам не проходят, сам он пошевелиться не может. Почини его через ремонтную
        консоль: разберись, какой драйвер не запустился, и запусти его заново.
      </p>
      <p>
        В консоли работают обычные команды Linux — <code>ls</code>, <code>cat</code>,{' '}
        <code>journalctl</code>, <code>grep</code>, <code>chmod</code> и другие. Если не будешь
        знать, что вводить дальше, — рядом есть кнопка «?» с подсказкой.
      </p>
    </Modal>
  );
}
