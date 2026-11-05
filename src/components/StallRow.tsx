import { View } from 'react-native';

import { cardStyle } from '@/theme/helpers';
import { useTheme } from '@/theme/ThemeProvider';
import type { Stall } from '@/types';
import { formatKina } from '@/utils/format';
import type { StallView } from '@/utils/stalls';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Pill } from './Pill';

type Props = {
  stall: Stall;
  view: StallView;
  isOwner: boolean;
  busy: boolean;
  onBook: () => void;
  onDecide: (bookingId: string, status: 'approved' | 'rejected') => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function StallRow({ stall, view, isOwner, busy, onBook, onDecide, onEdit, onDelete }: Props) {
  const { theme } = useTheme();
  const pending = view.decidable;
  return (
    <View style={cardStyle(theme)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
        <View style={{ flex: 1 }}>
          <AppText bold>{stall.name}</AppText>
          <AppText variant="small" muted>
            {stall.category} - {formatKina(stall.price)}
          </AppText>
        </View>
        <Pill label={view.label} tone={view.tone} />
      </View>

      {view.vendorName ? (
        <AppText variant="small" muted>
          Vendor: {view.vendorName}
          {view.note ? ` - "${view.note}"` : ''}
        </AppText>
      ) : null}

      {pending ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing.s }}>
          <Button label="Approve" icon="checkmark" fullWidth={false} busy={busy}
            onPress={() => onDecide(pending.id, 'approved')} />
          <Button label="Reject" icon="close-circle-outline" variant="secondary" fullWidth={false} disabled={busy}
            onPress={() => onDecide(pending.id, 'rejected')} />
        </View>
      ) : null}

      {view.canBook && !isOwner ? <Button label="Request this stall" icon="send-outline" onPress={onBook} /> : null}

      {isOwner ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <IconButton icon="create-outline" label={`Edit ${stall.name}`} onPress={onEdit} />
          <IconButton
            icon="trash-outline"
            label={`Delete ${stall.name}`}
            color={theme.colors.danger}
            onPress={onDelete}
          />
        </View>
      ) : null}
    </View>
  );
}