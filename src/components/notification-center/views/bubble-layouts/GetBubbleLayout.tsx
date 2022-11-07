import { NotificationBubbleItem, NotificationBubbleType } from '../../../../api';
import { NotificationClubGiftBubbleView } from './NotificationClubGiftBubbleView';
import { NotificationDefaultBubbleView } from './NotificationDefaultBubbleView';

export const GetBubbleLayout = (item: NotificationBubbleItem, close: () => void) =>
{
    if(!item) return null;

    const props = { key: item.id, item, close };

    switch(item.notificationType)
    {
        case NotificationBubbleType.CLUBGIFT:
            return <NotificationClubGiftBubbleView { ...props } />
        default:
            return <NotificationDefaultBubbleView { ...props } />
    }
}
