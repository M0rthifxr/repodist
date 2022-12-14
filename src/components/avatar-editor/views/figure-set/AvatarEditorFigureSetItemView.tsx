import { FC, useCallback, useEffect, useState } from 'react';
import { GetConfiguration } from '../../../../api';
import { LayoutCurrencyIcon, LayoutGridItem, LayoutGridItemProps } from '../../../../common';
import { AvatarEditorGridPartItem } from '../../common/AvatarEditorGridPartItem';
import { AvatarEditorIcon } from '../AvatarEditorIcon';

export interface AvatarEditorFigureSetItemViewProps extends LayoutGridItemProps
{
    partItem: AvatarEditorGridPartItem;
}

export const AvatarEditorFigureSetItemView: FC<AvatarEditorFigureSetItemViewProps> = props =>
{
    const { partItem = null, children = null, ...rest } = props;
    const [ updateId, setUpdateId ] = useState(-1);

    const hcDisabled = GetConfiguration<boolean>('hc.disabled', false);

    const rerender = useCallback(() =>
    {
        setUpdateId(prevValue => (prevValue + 1));
    }, []);

    useEffect(() =>
    {
        partItem.notify = rerender;

        return () =>
        {
            partItem.notify = null;
        }
    }, [ partItem, rerender ]);

    return (
        <LayoutGridItem itemImage={ (partItem.isClear ? undefined : partItem.imageUrl) } itemActive={ partItem.isSelected } { ...rest }>
            { !hcDisabled && partItem.isHC && <i className="icon hc-icon position-absolute" /> }
            { partItem.isClear && <AvatarEditorIcon icon="clear" /> }
            { partItem.isSellable && <AvatarEditorIcon icon="sellable" position="absolute" className="end-1 bottom-1" /> }
            { children }
        </LayoutGridItem>
    );
}
