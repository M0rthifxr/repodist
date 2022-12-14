import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowProps, ListRowRenderer, Size } from 'react-virtualized';
import { AddEventLinkTracker, RemoveLinkEventTracker } from '../../api';
import { Column, Flex, NitroCardContentView, Text } from '../../common';
import { ChatHistoryContextProvider } from './ChatHistoryContext';
import { ChatHistoryMessageHandler } from './ChatHistoryMessageHandler';
import { ChatEntryType } from './common/ChatEntryType';
import { ChatHistoryState } from './common/ChatHistoryState';
import { SetChatHistory } from './common/GetChatHistory';
import { RoomHistoryState } from './common/RoomHistoryState';

export const ChatHistoryView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ chatHistoryUpdateId, setChatHistoryUpdateId ] = useState(-1);
    const [ roomHistoryUpdateId, setRoomHistoryUpdateId ] = useState(-1);
    const [ chatHistoryState, setChatHistoryState ] = useState(new ChatHistoryState());
    const [ roomHistoryState, setRoomHistoryState ] = useState(new RoomHistoryState());
    const elementRef = useRef<List>(null);

    const cache = useMemo(() => new CellMeasurerCache({ defaultHeight: 25, fixedWidth: true }), []);

    const RowRenderer: ListRowRenderer = (props: ListRowProps) =>
    {
        const item = chatHistoryState.chats[props.index];

        const isDark = (props.index % 2 === 0);

        return (
            <CellMeasurer cache={ cache } columnIndex={ 0 } key={ props.key } parent={ props.parent } rowIndex={ props.index }>
                <Flex key={ props.key } style={ props.style } className="p-1" gap={ 1 }>
                    <Text variant="muted">{ item.timestamp }</Text>
                    { (item.type === ChatEntryType.TYPE_CHAT) &&
                        <>
                            <Text pointer noWrap dangerouslySetInnerHTML={ { __html: (item.name + ':') } } />
                            <Text textBreak wrap grow>{ item.message }</Text>
                        </> }
                    { (item.type === ChatEntryType.TYPE_ROOM_INFO) &&
                        <>
                            <i className="icon icon-small-room" />
                            <Text variant="danger" textBreak wrap grow>{ item.name }</Text>
                        </> }
                </Flex>
            </CellMeasurer>
        );
    };

    const onResize = (info: Size) => cache.clearAll();

    const linkReceived = useCallback((url: string) =>
    {
        const parts = url.split('/');

        if(parts.length < 2) return;

        switch(parts[1])
        {
            case 'show':
                setIsVisible(true);
                return;
            case 'hide':
                setIsVisible(false);
                return;
            case 'toggle':
                setIsVisible(prevValue => !prevValue);
                return;
        }
    }, []);

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived,
            eventUrlPrefix: 'chat-history/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ linkReceived ]);

    useEffect(() =>
    {
        const chatState = new ChatHistoryState();
        const roomState = new RoomHistoryState();

        SetChatHistory(chatState);

        chatState.notifier = () => setChatHistoryUpdateId(prevValue => (prevValue + 1));
        roomState.notifier = () => setRoomHistoryUpdateId(prevValue => (prevValue + 1));

        setChatHistoryState(chatState);
        setRoomHistoryState(roomState);

        return () =>
        {
            chatState.notifier = null;
            roomState.notifier = null;
        };
    }, []);

    useEffect(() =>
    {
        if(elementRef && elementRef.current && isVisible) elementRef.current.scrollToRow(-1);
    }, [ isVisible ]);

    return (
        <ChatHistoryContextProvider value={ { chatHistoryState, roomHistoryState } }>
            <ChatHistoryMessageHandler />
            { isVisible &&
                <Flex gap={ 2 } className="nitro-chat-history">
                    <Column className="chat-history-content h-100">
                        <Column className="h-100">
                            <AutoSizer defaultWidth={ 300 } defaultHeight={ 200 } onResize={ onResize }>
                                { ({ height, width }) => 
                                {
                                    return (
                                        <List
                                            ref={ elementRef }
                                            width={ width }
                                            height={ height }
                                            rowCount={ chatHistoryState.chats.length }
                                            rowHeight={ cache.rowHeight }
                                            className={ 'chat-history-list' }
                                            rowRenderer={ RowRenderer }
                                            deferredMeasurementCache={ cache } />
                                    )
                                } }
                            </AutoSizer>
                        </Column>
                    </Column>
                    <Flex className="chat-toggle" onClick={ event => setIsVisible(false) } />
                </Flex>
            }
        </ChatHistoryContextProvider>
    );
}
