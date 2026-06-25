import { ModalHeader } from '@/components/ModalHeader'
import { TransactionForm } from '@/components/TransactionForm'
import { Screen } from '@/components/ui/Screen'
import { EmptyState } from '@/components/ui/States'
import { editingTransactionAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'

export default function EditTransaction() {
  const transaction = useAtomValue(editingTransactionAtom)

  if (!transaction) {
    return (
      <Screen>
        <ModalHeader title="Transaction" />
        <EmptyState icon="activity" title="Transaction unavailable" subtitle="Open this transaction from the list to edit it." />
      </Screen>
    )
  }

  return <TransactionForm existing={transaction} />
}
